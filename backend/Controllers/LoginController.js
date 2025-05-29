const pool = require('../db');

const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    try {
        // Busco usuario por email y password
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const usuario = result.rows[0];

        res.json({ message: 'Login exitoso', usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { loginUsuario };
