const pool = require('../db');

const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;
    if (!nombre || !lastname || !email || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING *',
            [nombre, email, password]
        );
        res.status(201).json({ message: 'Usuario creado', usuario: result.rows[0] });
    } catch (err) {
        console.error('Error al insertar usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { registrarUsuario };