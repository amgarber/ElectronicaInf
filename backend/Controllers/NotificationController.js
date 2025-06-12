// === BACKEND: notificationsController.js ===
const pool = require('../db');

const getAllNotifications = async (req, res) => {
    try {
        const accesos = await pool.query(`
            SELECT 'ingreso' AS tipo,
                   CONCAT('El vehículo ', ra.patente, ' ingresó correctamente.') AS mensaje,
                   ra.fecha_hora,
                   NULL AS imagen_url
            FROM registro_accesos ra
        `);

        const infracciones = await pool.query(`
            SELECT 'infraccion' AS tipo,
                   CONCAT('Infracción registrada para el vehículo ', i.patente, ': ', i.descripcion) AS mensaje,
                   i.fecha_hora,
                   NULL AS imagen_url
            FROM infracciones i
        `);

        const solicitudes = await pool.query(`
            SELECT 'solicitud_manual' AS tipo,
                   CONCAT('El vehículo ', s.patente, ' solicita ingreso manual.') AS mensaje,
                   s.fecha_hora,
                   s.imagen_url
            FROM solicitudes_manuales s
            WHERE s.estado = 'pendiente'
        `);

        const todas = [...accesos.rows, ...infracciones.rows, ...solicitudes.rows].sort(
            (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)
        );

        res.json(todas);
    } catch (error) {
        console.error('❌ Error en getAllNotifications:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
};

module.exports = { getAllNotifications };
