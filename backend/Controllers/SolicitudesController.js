const pool = require('../db');
const mqtt = require('mqtt');

// Conexión al broker real o local según tu caso
const client = mqtt.connect('mqtt://54.243.184.8');

const responderSolicitudManual = async (req, res) => {
    const { id, respuesta } = req.body; // respuesta: 'autorizado' o 'denegado'

    if (!['autorizado', 'denegado'].includes(respuesta)) {
        return res.status(400).json({ error: 'Respuesta inválida' });
    }

    try {
        // 1. Buscar la solicitud pendiente
        const solicitud = await pool.query(
            `SELECT * FROM solicitudes_manuales WHERE id = $1 AND estado = 'pendiente'`,
            [id]
        );

        if (solicitud.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada o ya respondida' });
        }

        const { patente, imagen_url } = solicitud.rows[0];

        // 2. Actualizar estado en la base
        await pool.query(
            `UPDATE solicitudes_manuales SET estado = $1, fecha_hora = NOW() WHERE id = $2`,
            [respuesta, id]
        );

        // 3. Publicar mensaje MQTT con respuesta
        const topic = `acceso/respuesta`;
        client.publish(topic, JSON.stringify({
            patente,
            respuesta,
            metodo: 'manual'
        }));

        // 4. Registrar el acceso si fue autorizado
        if (respuesta === 'autorizado') {
            await pool.query(
                `INSERT INTO registro_accesos (patente, fecha_hora, metodo, resultado, captura_url)
                 VALUES ($1, NOW(), 'manual', 'autorizado', $2)`,
                [patente, imagen_url]
            );
            console.log(`📝 Acceso manual registrado para ${patente}`);
        }

        res.json({ message: 'Respuesta enviada y solicitud actualizada' });
    } catch (err) {
        console.error('Error al responder solicitud:', err);
        res.status(500).json({ error: 'Error interno' });
    }
};

module.exports = { responderSolicitudManual };
