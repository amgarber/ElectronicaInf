const pool = require('../db');

const responderSolicitudManual = async (req, res) => {
    const { id, respuesta } = req.body;

    console.log("📥 Datos recibidos:", { id, respuesta });

    if (!['autorizado', 'denegado'].includes(respuesta)) {
        return res.status(400).json({ error: 'Respuesta inválida' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM solicitudes_manuales WHERE id = $1 AND estado = 'pendiente'`,
            [id]
        );

        if (result.rows.length === 0) {
            console.log("⚠️ Solicitud no encontrada o ya respondida");
            return res.status(404).json({ error: 'Solicitud no encontrada o ya respondida' });
        }

        const solicitud = result.rows[0];
        console.log("📦 Solicitud encontrada:", solicitud);

        res.json({ message: "✅ Solicitud válida, lista para siguiente paso" });
    } catch (err) {
        console.error("❌ Error al acceder a la base:", err);
        res.status(500).json({ error: "Error en la base de datos" });
    }
};

module.exports = { responderSolicitudManual };
