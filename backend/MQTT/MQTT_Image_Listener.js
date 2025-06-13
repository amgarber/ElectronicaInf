const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const AWS = require('aws-sdk');

// === CONFIGURACIÓN ===
const MQTT_BROKER = 'mqtt://54.243.184.8';
const MQTT_TOPIC_SUB = 'patentes/captura';
const MQTT_TOPIC_PUB = 'acceso/autorizado';
const BUCKET_NAME = 'esp32-captures';
const IMAGE_DIR = path.join(__dirname, 'capturas'); // Guardamos copias debug

// Crear carpeta si no existe
if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR);

AWS.config.update({ region: 'us-east-1' });
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

const dbConfig = {
    host: '172.31.25.254',
    database: 'control_accesos',
    user: 'postgres',
    password: 'postgres',
    port: 5432,
};

function limpiarBase64(base64Data) {
    return base64Data.replace(/^data:image\/\w+;base64,/, "");
}

function guardarImagen(base64Data) {
    return new Promise((resolve, reject) => {
        const cleaned = limpiarBase64(base64Data);
        const buffer = Buffer.from(cleaned, 'base64');

        if (buffer.length < 1000) {
            console.warn('⚠️ Imagen demasiado pequeña, puede estar corrupta');
            return reject(new Error('Imagen corrupta o incompleta'));
        }

        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
        const filePath = path.join(IMAGE_DIR, `debug-${timestamp}.jpg`);

        fs.writeFile(filePath, buffer, (err) => {
            if (err) return reject(err);
            console.log(`✅ Imagen guardada localmente como ${filePath}`);
            resolve(filePath);
        });
    });
}

function subirImagenAS3(filePath, s3Key) {
    return s3.upload({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fs.createReadStream(filePath),
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
            const clean = texto.DetectedText.replace(/\s/g, '').toUpperCase();
            if (regex.test(clean)) {
                console.log('✅ Patente detectada:', clean);
                return clean;
            }
        }
    }
    return 'NO_DETECTADA';
}

function detectarPatenteConRekognition(s3Key) {
    return rekognition.detectText({
        Image: {
            S3Object: { Bucket: BUCKET_NAME, Name: s3Key },
        },
    }).promise()
        .then(data => filtrarPatente(data.TextDetections))
        .catch(err => {
            console.error('❌ Error con Rekognition:', err);
            return 'NO_DETECTADA';
        });
}

async function insertarSolicitudManual(patente, imagen_url) {
    const db = new Client(dbConfig);
    await db.connect();

    await db.query(
        'INSERT INTO vehiculos (patente) VALUES ($1) ON CONFLICT (patente) DO NOTHING',
        [patente]
    );

    await db.query(
        'INSERT INTO solicitudes_manuales (patente, fecha_hora, imagen_url, estado) VALUES ($1, NOW(), $2, $3)',
        [patente, imagen_url, 'pendiente']
    );

    console.log(`📝 Solicitud manual registrada para ${patente}`);
    await db.end();
}

// === MQTT ===
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('🚀 Conectado al broker. Escuchando en:');
    client.subscribe(MQTT_TOPIC_SUB, () => console.log(`🛰️ Subscrito a ${MQTT_TOPIC_SUB}`));
    client.subscribe('acceso/manual', () => console.log(`🛰️ Subscrito a acceso/manual`));
});

client.on('message', async (topic, message) => {
    const payload = message.toString();
    console.log(`📥 Mensaje recibido en topic ${topic}`);

    try {
        const localPath = await guardarImagen(payload);
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
        const s3Key = `capturas/${timestamp}.jpg`;

        const key = await subirImagenAS3(localPath, s3Key);
        if (!key) return;

        const patente = await detectarPatenteConRekognition(key);
        if (patente === 'NO_DETECTADA') {
            console.warn('⚠️ No se detectó patente, no se guarda la solicitud.');
            return;
        }

        if (topic === 'acceso/manual') {
            await insertarSolicitudManual(patente, key);
        }

    } catch (err) {
        console.error('❌ Error general en procesamiento:', err);
    }
});
