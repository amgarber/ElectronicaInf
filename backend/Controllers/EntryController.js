const pool = require('../db');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const autorizarEntrada = async (req, res) => {
    console.log('Datos recibidos:', req.body);
    const { nombre, apellido, email, marca, modelo, patente } = req.body;

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

    if (!nombre || !apellido || !email || !marca || !modelo || !patente) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        // Buscar o insertar persona autorizada
        let personaId;
        const existing = await pool.query(
            `SELECT id FROM personas_autorizadas WHERE email = $1`,
            [email]
        );

        if (existing.rows.length > 0) {
            personaId = existing.rows[0].id;
        } else {
            const insert = await pool.query(
                `INSERT INTO personas_autorizadas (nombre, apellido, email, autorizado_por_id)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id`,
                [nombre, apellido, email, autorizadoPorId]
            );
            personaId = insert.rows[0].id;
        }

        // Insertar vehículo (si no existe)
        const vehiculoInsert = await pool.query(
            `INSERT INTO vehiculos (marca, modelo, patente, dueño_autorizado_id, dueño_usuario_id, autorizado)
             VALUES ($1, $2, $3, $4, NULL, $5)
                 ON CONFLICT (patente) DO UPDATE
                                              SET marca = EXCLUDED.marca,
                                              modelo = EXCLUDED.modelo,
                                              dueño_autorizado_id = EXCLUDED.dueño_autorizado_id,
                                              dueño_usuario_id = NULL,
                                              autorizado = true
                                              RETURNING *`,
            [marca, modelo, patente, personaId, true]
        );


        res.status(201).json({
            message: 'Entrada autorizada con éxito',
            personaId,
            vehiculo: vehiculoInsert.rows[0]
        });
    } catch (err) {
        console.error('Error al autorizar entrada:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { autorizarEntrada };
