// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5050;

require('dotenv').config(); // carga variables de entorno
const pool = require('./db'); // conexión a PostgreSQL

const entryRoutes = require('./routes/entryRoutes');
const authRoutes = require('./Routes/AuthRoutes'); // rutas de autenticación


app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Rutas principales
app.use('/api', authRoutes);
app.use('/api', entryRoutes);


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
