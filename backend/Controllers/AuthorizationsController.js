const pool = require('../db');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const getAuthorizations = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.split(' ')[1];

    let userId;
    try {
        const decoded = jwt.verify(token, SECRET);
        userId = decoded.id;
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    try {
        const result = await pool.query(`
            SELECT
                p.id,
                p.nombre AS firstname,
                p.apellido AS lastname,
                v.patente AS licenseplate,
                v.marca,
                v.modelo,
                v.autorizado,
                v.bloqueado,
                v.es_autorizado
            FROM personas_autorizadas p
                     JOIN vehiculos v ON p.id = v.dueño_autorizado_id
            WHERE p.autorizado_por_id = $1
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener autorizaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { getAuthorizations };
