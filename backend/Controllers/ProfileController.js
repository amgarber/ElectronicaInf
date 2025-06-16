const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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

const changePassword = async (req, res) => {
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

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Se requieren todos los campos' });
    }

    try {
        // Get current user's password
        const result = await pool.query(
            'SELECT password FROM usuarios WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, result.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Contraseña actual incorrecta' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query(
            'UPDATE usuarios SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { getProfile, changePassword };
