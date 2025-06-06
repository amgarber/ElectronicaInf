const pool = require('../db');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const autorizarEntrada = async (req, res) => {
    console.log('Datos recibidos:', req.body);
    const { nombre, apellido, email, marca, modelo, patente } = req.body;

    // 1. Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado: faltan credenciales' });
    }

    const token = authHeader.split(' ')[1];

    let autorizadoPorId;
    try {
        const decoded = jwt.verify(token, SECRET);
        autorizadoPorId = decoded.id;
    } catch (err) {
        console.error('Token inválido:', err);
        return res.status(401).json({ error: 'Token inválido' });
    }

    // 2. Validar datos del cuerpo
    if (!nombre || !apellido || !email || !marca || !modelo || !patente) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        // 3. Insertar persona autorizada
        const personaResult = await pool.query(
            `INSERT INTO personas_autorizadas (nombre, apellido, email, autorizado_por_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [nombre, apellido, email, autorizadoPorId]
        );

        const personaId = personaResult.rows[0].id;

        // 4. Insertar vehículo asociado a esa persona
        const vehiculoResult = await pool.query(
            `INSERT INTO vehiculos (marca, modelo, patente, dueño_autorizado_id, autorizado)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [marca, modelo, patente, personaId, true]
        );

        res.status(201).json({
            message: 'Entrada autorizada con éxito',
            persona: personaResult.rows[0],
            vehiculo: vehiculoResult.rows[0]
        });
    } catch (err) {
        console.error('Error al autorizar entrada:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { autorizarEntrada };
