const pool = require('../db');

const autorizarEntrada = async (req, res) => {
    console.log('Datos recibidos:', req.body);
    const { nombre, apellido, email, marca, modelo, patente } = req.body;

    if (!nombre || !apellido || !email || !marca || !modelo || !patente) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        // 1. Insertar persona autorizada
        const personaResult = await pool.query(
            `INSERT INTO personas_autorizadas (nombre, apellido, email)
             VALUES ($1, $2, $3)
                 RETURNING id`,
            [nombre, apellido, email]
        );

        const personaId = personaResult.rows[0].id;

        // 2. Insertar vehículo asociado a esa persona
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
