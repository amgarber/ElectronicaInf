const express = require('express');
const cors = require('cors');
const listEndpoints = require('express-list-endpoints');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Conexión a la base de datos
const pool = require('./db');

// Importar rutas
const entryRoutes = require('./Routes/EntryRoutes');
const authRoutes = require('./Routes/AuthRoutes');
const loginRoutes = require('./Routes/LoginRoutes');
const NotificationsRoutes = require('./Routes/NotificationsRoutes');
const authorizationsRoutes = require('./Routes/AuthorizationRoutes');
const profileRoutes  = require('./Routes/ProfileRoutes');
const solicitudesRoutes  = require('./Routes/SolicitudesRoutes');
const infraccionesRoutes = require('./Routes/InfraccionesRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
    res.send('API funcionando correctamente [PRODUCCIÓN]');
});

// Registrar rutas reales
app.use('/api', authRoutes);
app.use('/api', entryRoutes);
app.use('/api', loginRoutes);
app.use('/api', NotificationsRoutes);
app.use('/api', authorizationsRoutes);
app.use('/api', profileRoutes);
app.use('/api', solicitudesRoutes);
app.use('/api/infracciones', infraccionesRoutes);
app.post('/api/test', (req, res) => {
    console.log("✅ Se recibió POST a /api/test");
    res.json({ mensaje: 'Funciona!' });
});



// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Backend producción corriendo en http://0.0.0.0:${PORT}`);
    console.log('📚 Endpoints registrados:');
    console.table(listEndpoints(app));
});
