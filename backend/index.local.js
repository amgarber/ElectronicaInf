const express = require('express');
const cors = require('cors');
const listEndpoints = require('express-list-endpoints');

const app = express();
const PORT = process.env.PORT || 5050;

require('dotenv').config(); // Variables de entorno
const pool = require('./db');

// Rutas
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

// Ruta básica de prueba
app.get('/', (req, res) => {
    res.send('API funcionando correctamente [PRODUCCIÓN]');
});

// Montaje de rutas
app.use('/api', authRoutes);
app.use('/api', entryRoutes);
app.use('/api', loginRoutes);
app.use('/api', NotificationsRoutes);
app.use('/api', authorizationsRoutes);
app.use('/api', profileRoutes);
app.use('/api', solicitudesRoutes);
app.use('/api/infracciones', infraccionesRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Backend local en http://localhost:${PORT}`);


    // Mostrar rutas registradas
    console.log('📚 Endpoints registrados:');
    console.table(listEndpoints(app));
});
