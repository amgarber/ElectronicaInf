// backend/Controllers/infraccionesController.js
const pool = require('../db');

const getInfracciones = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, patente, descripcion, fecha_hora
            FROM infracciones
            ORDER BY fecha_hora DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error al obtener infracciones:', error);
        res.status(500).json({ error: 'Error al obtener infracciones' });
    }
};

module.exports = { getInfracciones };
