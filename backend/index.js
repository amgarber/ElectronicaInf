// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

app.post('/usuarios', (req, res) => {
    const { nombre, email, password, patente } = req.body;
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    // Acá iría la lógica de guardar usuario en DB (por ahora mock)
    console.log({ nombre, email, password, patente });
    res.status(201).json({ message: 'Usuario creado' });
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
