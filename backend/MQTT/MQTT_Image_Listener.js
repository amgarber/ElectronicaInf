const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const AWS = require('aws-sdk');

// === CONFIGURACIÓN GENERAL ===
const MQTT_BROKER = 'mqtt://54.243.184.8';
const MQTT_TOPIC_SUB = 'patentes/captura';
const MQTT_TOPIC_PUB = 'acceso/autorizado';
const IMAGE_PATH = path.join(__dirname, 'captura.jpg');
const BUCKET_NAME = 'esp32-captures';

// === CONFIGURACIÓN POSTGRES ===
const dbConfig = {
    host: '172.31.25.254',
    database: 'control_acceso',
    user: 'postgres',
    password: 'postgres',
    port: 5432,
};

// === AWS CONFIG ===
AWS.config.update({ region: 'us-east-1' });
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

// === VARIABLES DE ESTADO ===
let ultimaPatenteDetectada = null;
let tiempoPatenteDetectada = null;

// === FUNCIONES AUXILIARES ===
function guardarImagen(base64Data) {
    return new Promise((resolve, reject) => {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFile(IMAGE_PATH, buffer, (err) => {
            if (err) return reject(err);
            console.log(`✅ Imagen guardada en ${IMAGE_PATH}`);
            resolve();
        });
    });
}

function subirImagenAS3(s3Key) {
    return s3
        .upload({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fs.createReadStream(IMAGE_PATH),
        })
        .promise()
        .then(() => {
            console.log(`☁️ Imagen subida a S3 como ${s3Key}`);
            return s3Key;
        })
        .catch((err) => {
            console.error('❌ Error subiendo a S3:', err);
            return null;
        });
}

function filtrarPatente(textos) {
    const regex = /^[A-Z]{2}\d{3}[A-Z]{2}$/;
    for (const texto of textos) {
        if (texto.Type === 'LINE') {
            const cleanText = texto.DetectedText.replace(/\s/g, '').toUpperCase();
            if (regex.test(cleanText)) {
                console.log('✅ Patente detectada:', cleanText);
                return cleanText;
            }
        }
    }
    return 'NO_DETECTADA';
}

function detectarPatenteConRekognition(s3Key) {
    return rekognition
        .detectText({
            Image: {
                S3Object: {
                    Bucket: BUCKET_NAME,
                    Name: s3Key,
                },
            },
        })
        .promise()
        .then((data) => filtrarPatente(data.TextDetections))
        .catch((err) => {
            console.error('❌ Error con Rekognition:', err);
            return 'NO_DETECTADA';
        });
}

async function verificarAutorizacion(patente) {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const res = await client.query(
            'SELECT autorizado, bloqueado FROM vehiculos WHERE patente = $1',
            [patente]
        );
        await client.end();

        const row = res.rows[0];
        if (!row) {
            console.log('⛔ Patente no registrada');
            return 'false';
        }

        if (row.bloqueado === true) {
            console.log('🚫 Patente bloqueada por infracciones');
            return 'false';
        }

        if (row.autorizado === true) {
            console.log('✅ Patente autorizada');
            return 'true';
        } else {
            console.log('⛔ Patente no autorizada');
            return 'false';
        }
    } catch (err) {
        console.error('❌ Error al conectar con PostgreSQL:', err);
        return 'false';
    }
}

async function registrarInfraccionConPatente(patente) {
    const client = new Client(dbConfig);
    try {
        await client.connect();

        const { rows } = await client.query(
            'SELECT dueno_usuario_id, dueno_autorizado_id FROM vehiculos WHERE patente = $1',
            [patente]
        );

        if (rows.length === 0) {
            await client.query(
                'INSERT INTO infracciones (descripcion, tipo, patente, fecha_hora) VALUES ($1, $2, $3, NOW())',
                [`Exceso de velocidad - patente desconocida (${patente})`, 'velocidad', patente]
            );
            console.warn('❌ Patente no registrada en la base');
        } else {
            const id_usuario = rows[0]["dueno_usuario_id"];
            const id_autorizado = rows[0]["dueno_autorizado_id"];

            if (id_usuario !== null) {
                await client.query(
                    'INSERT INTO infracciones (id_usuario, descripcion, tipo, patente, fecha_hora) VALUES ($1, $2, $3, $4, NOW())',
                    [id_usuario, 'Exceso de velocidad', 'velocidad', patente]
                );
                console.log(`📝 Infracción registrada para usuario ID ${id_usuario}`);
            } else if (id_autorizado !== null) {
                await client.query(
                    'INSERT INTO infracciones (descripcion, tipo, patente, fecha_hora) VALUES ($1, $2, $3, NOW())',
                    [`Exceso de velocidad - persona autorizada ID ${id_autorizado}`, 'velocidad', patente]
                );
                console.log(`📝 Infracción registrada para persona autorizada ID ${id_autorizado}`);
            } else {
                await client.query(
                    'INSERT INTO infracciones (descripcion, tipo, patente, fecha_hora) VALUES ($1, $2, $3, NOW())',
                    ['Exceso de velocidad - sin dueño asociado', 'velocidad', patente]
                );
                console.warn('⚠️ Vehículo sin dueño asociado en la base');
            }

            // 🚫 Bloqueo automático si supera 3 infracciones
            const infracciones = await client.query(
                'SELECT COUNT(*) FROM infracciones WHERE patente = $1',
                [patente]
            );
            if (parseInt(infracciones.rows[0].count) >= 3) {
                await client.query(
                    'UPDATE vehiculos SET bloqueado = true WHERE patente = $1',
                    [patente]
                );
                console.warn(`🚫 Patente ${patente} bloqueada por exceso de infracciones`);
            }
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error al guardar infracción:', err);
    }
}

// === MQTT CLIENT ===
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log(`🚀 Conectado al broker. Escuchando en ${MQTT_TOPIC_SUB}`);
    client.subscribe(MQTT_TOPIC_SUB);
    client.subscribe('infraccion/velocidad');
});

client.on('message', async (topic, message) => {
    const payload = message.toString();

    if (topic === MQTT_TOPIC_SUB) {
        console.log('📥 Imagen recibida por MQTT');

        try {
            await guardarImagen(payload);
            const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
            const s3Key = `capturas/${timestamp}.jpg`;

            const key = await subirImagenAS3(s3Key);
            if (!key) return;

            const patente = await detectarPatenteConRekognition(key);

            let resultado = 'false';
            if (patente !== 'NO_DETECTADA') {
                ultimaPatenteDetectada = patente;
                tiempoPatenteDetectada = Date.now();
                client.publish('patente/detectada', patente);
                resultado = await verificarAutorizacion(patente);
            }

            console.log('📡 Publicando resultado:', resultado);
            client.publish(MQTT_TOPIC_PUB, resultado);
        } catch (err) {
            console.error('❌ Error procesando imagen:', err);
        }
    }

    if (topic === 'infraccion/velocidad') {
        console.log('⚠️ Infracción de velocidad recibida:', payload);

        if (
            ultimaPatenteDetectada &&
            Date.now() - tiempoPatenteDetectada < 20000
        ) {
            await registrarInfraccionConPatente(ultimaPatenteDetectada);
        } else {
            await registrarInfraccionConPatente('DESCONOCIDA');
        }
    }
});
