const pool = require('../db');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const getProfile = async (req, res) => {
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
        const result = await pool.query(
            `SELECT nombre, apellido, email FROM usuarios WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en perfil:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { getProfile };
