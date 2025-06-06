const pool = require('../db');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost'); // o tu broker externo

const responderSolicitudManual = async (req, res) => {
    const { id, respuesta } = req.body; // respuesta: 'autorizado' o 'denegado'

    if (!['autorizado', 'denegado'].includes(respuesta)) {
        return res.status(400).json({ error: 'Respuesta inválida' });
    }

    try {
        // 1. Buscar la solicitud
        const solicitud = await pool.query(
            `SELECT * FROM solicitudes_manuales WHERE id = $1 AND estado = 'pendiente'`,
            [id]
        );

        if (solicitud.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada o ya respondida' });
        }

        const { patente } = solicitud.rows[0];

        // 2. Actualizar estado en BD
        await pool.query(
            `UPDATE solicitudes_manuales SET estado = $1 WHERE id = $2`,
            [respuesta, id]
        );

        // 3. Publicar mensaje MQTT
        const topic = `acceso/respuesta`;
        client.publish(topic, JSON.stringify({
            patente,
            respuesta
        }));

        res.json({ message: 'Respuesta enviada y solicitud actualizada' });
    } catch (err) {
        console.error('Error al responder solicitud:', err);
        res.status(500).json({ error: 'Error interno' });
    }
};

module.exports = { responderSolicitudManual };
