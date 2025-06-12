const pool = require('../db');

const registrarUsuario = async (req, res) => {
    const { nombre, apellido, email, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO usuarios (nombre, apellido, email, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, apellido, email`,
            [nombre, apellido, email, password]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error al registrar usuario:', err);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
};

module.exports = { registrarUsuario };
