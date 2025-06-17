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
    database: 'control_accesos',
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
        if (buffer.length < 1000) return reject(new Error('Imagen corrupta o incompleta'));

        fs.writeFile(IMAGE_PATH, buffer, (err) => {
            if (err) return reject(err);
            console.log(`✅ Imagen guardada en ${IMAGE_PATH}`);

            const debugPath = path.join(__dirname, `capturas/debug-${Date.now()}.jpg`);
            fs.copyFileSync(IMAGE_PATH, debugPath);
            resolve();
        });
    });
}

function subirImagenAS3(s3Key) {
    return s3.upload({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fs.createReadStream(IMAGE_PATH),
    }).promise()
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
    return rekognition.detectText({ Image: { S3Object: { Bucket: BUCKET_NAME, Name: s3Key } } })
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
        const res = await client.query('SELECT autorizado, bloqueado FROM vehiculos WHERE patente = $1', [patente]);
        await client.end();

        const row = res.rows[0];
        if (!row || row.bloqueado) return 'false';
        return row.autorizado ? 'true' : 'false';
    } catch (err) {
        console.error('❌ Error al conectar con PostgreSQL:', err);
        return 'false';
    }
}

async function registrarAcceso(patente, metodo, resultado, capturaUrl) {
    const dbClient = new Client(dbConfig);
    try {
        await dbClient.connect();

        let nombre = 'Dueño desconocido';
        const { rows } = await dbClient.query(
            `SELECT u.nombre AS nombre_usuario, p.nombre AS nombre_autorizado
             FROM vehiculos v
                      LEFT JOIN usuarios u ON v.dueno_usuario_id = u.id
                      LEFT JOIN personas_autorizadas p ON v.dueno_autorizado_id = p.id
             WHERE v.patente = $1`,
            [patente]
        );

        if (rows.length > 0) {
            const row = rows[0];
            if (row.nombre_usuario) nombre = row.nombre_usuario;
            else if (row.nombre_autorizado) nombre = row.nombre_autorizado;
        }

        await dbClient.query(
            'INSERT INTO registro_accesos (patente, fecha_hora, metodo, resultado, captura_url) VALUES ($1, NOW(), $2, $3, $4)',
            [patente, metodo, resultado, capturaUrl]
        );
        await dbClient.end();

        const mensaje = {
            nombre,
            patente,
            estado: resultado
        };
        console.log(`📝 Ingreso: ${nombre} ingresó con el vehículo ${patente} - ${resultado}`);
        client.publish('notificacion/acceso', JSON.stringify(mensaje));
    } catch (err) {
        console.error('❌ Error al guardar acceso:', err);
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
        } else {
            const { dueno_usuario_id, dueno_autorizado_id } = rows[0];

            if (dueno_usuario_id) {
                const nombreRes = await client.query(
                    'SELECT nombre FROM usuarios WHERE id = $1',
                    [dueno_usuario_id]
                );
                const nombre = nombreRes.rows[0]?.nombre || 'Usuario desconocido';
                await client.query(
                    'INSERT INTO infracciones (id_usuario, descripcion, tipo, patente, fecha_hora) VALUES ($1, $2, $3, $4, NOW())',
                    [dueno_usuario_id, `Exceso de velocidad - ${nombre}`, 'velocidad', patente]
                );
            } else if (dueno_autorizado_id) {
                const nombreRes = await client.query(
                    'SELECT nombre FROM personas_autorizadas WHERE id = $1',
                    [dueno_autorizado_id]
                );
                const nombre = nombreRes.rows[0]?.nombre || 'Persona autorizada desconocida';
                await client.query(
                    'INSERT INTO infracciones (descripcion, tipo, patente, fecha_hora) VALUES ($1, $2, $3, NOW())',
                    [`Exceso de velocidad - ${nombre}`, 'velocidad', patente]
                );
            } else {
                await client.query(
                    'INSERT INTO infracciones (descripcion, tipo, patente, fecha_hora) VALUES ($1, $2, $3, NOW())',
                    ['Exceso de velocidad', 'velocidad', patente]
                );
            }

            const infracciones = await client.query('SELECT COUNT(*) FROM infracciones WHERE patente = $1', [patente]);
            if (parseInt(infracciones.rows[0].count) >= 3) {
                await client.query('UPDATE vehiculos SET bloqueado = true WHERE patente = $1', [patente]);
            }
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error al guardar infracción:', err);
    }
}

// === MQTT ===
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log(`🚀 Conectado al broker. Escuchando en:`);
    client.subscribe(MQTT_TOPIC_SUB, () => console.log(`🛰️ Subscrito a ${MQTT_TOPIC_SUB}`));
    client.subscribe('infraccion/velocidad', () => console.log(`🛰️ Subscrito a infraccion/velocidad`));
    client.subscribe('acceso/manual', () => console.log(`🛰️ Subscrito a acceso/manual`));
});

client.on('message', async (topic, message) => {
    const payload = message.toString();

    if (topic === MQTT_TOPIC_SUB || topic === 'acceso/manual') {
        console.log(`📥 Imagen recibida (${topic})`);

        try {
            await guardarImagen(payload);
            const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
            const s3Key = `capturas/${timestamp}.jpg`;
            const key = await subirImagenAS3(s3Key);
            if (!key) return;

            const patente = await detectarPatenteConRekognition(key);
            if (patente === 'NO_DETECTADA') {
                console.warn('⚠️ No se detectó patente.');
                return;
            }

            ultimaPatenteDetectada = patente;
            tiempoPatenteDetectada = Date.now();
            client.publish('patente/detectada', patente);

            if (topic === 'patentes/captura') {
                const resultado = await verificarAutorizacion(patente);
                await registrarAcceso(patente, 'automatico', resultado === 'true' ? 'autorizado' : 'denegado', key);
                client.publish(MQTT_TOPIC_PUB, resultado);
            } else {
                const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
                const db = new Client(dbConfig);
                await db.connect();
                await db.query('INSERT INTO vehiculos (patente) VALUES ($1) ON CONFLICT (patente) DO NOTHING', [patente]);
                await db.query(
                    'INSERT INTO solicitudes_manuales (patente, fecha_hora, imagen_url, estado) VALUES ($1, NOW(), $2, $3)',
                    [patente, publicUrl, 'pendiente']
                );
                await db.end();
                console.log(`📝 Solicitud manual registrada para ${patente}`);
            }
        } catch (err) {
            console.error('❌ Error procesando imagen:', err);
        }
    }

    if (topic === 'infraccion/velocidad') {
        console.log('⚠️ Infracción de velocidad recibida');
        const patente = (ultimaPatenteDetectada && Date.now() - tiempoPatenteDetectada < 20000)
            ? ultimaPatenteDetectada
            : 'DESCONOCIDA';
        await registrarInfraccionConPatente(patente);
    }
});
