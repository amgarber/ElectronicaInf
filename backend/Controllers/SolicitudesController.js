const pool = require('../db');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://54.243.184.8');

console.log("🔥 Cargando responderSolicitudManual desde", __filename);

const responderSolicitudManual = async (req, res) => {
    const { id, respuesta } = req.body;

    console.log("✅ Entrando a responderSolicitudManual con:", { id, respuesta });

    if (!['autorizado', 'denegado'].includes(respuesta)) {
        return res.status(400).json({ error: 'Respuesta inválida' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM solicitudes_manuales WHERE id = $1 AND estado = 'pendiente'`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada o ya respondida' });
        }

        const solicitud = result.rows[0];
        const { patente, imagen_url } = solicitud;

        // Actualizar estado
        await pool.query(
            `UPDATE solicitudes_manuales SET estado = $1, fecha_hora = NOW() WHERE id = $2`,
            [respuesta, id]
        );

        // Enviar por MQTT
        const topic = `acceso/respuesta`;
        const payload = JSON.stringify({ patente, respuesta, metodo: 'manual' });
        client.publish(topic, payload);
        console.log(`📡 Publicado en ${topic}:`, payload);

        // Registrar acceso si fue autorizado
        if (respuesta === 'autorizado') {
            await pool.query(
                `INSERT INTO registro_accesos (patente, fecha_hora, metodo, resultado, captura_url)
                 VALUES ($1, NOW(), 'manual', 'autorizado', $2)`,
                [patente, imagen_url]
            );
            console.log(`📝 Acceso registrado para ${patente}`);
        }

        return res.json({ message: `✅ Solicitud ${respuesta} procesada correctamente` });
    } catch (err) {
        console.error("❌ Error en responderSolicitudManual:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { responderSolicitudManual };
