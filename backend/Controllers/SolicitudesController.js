console.log("🔥 Cargando responderSolicitudManual desde", __filename);

const responderSolicitudManual = (req, res) => {
    console.log("✅ Entrando a responderSolicitudManual con body:", req.body);
    res.json({ message: "🧠 Ejecutando lógica desde el controller REAL" });
};

module.exports = { responderSolicitudManual };
