const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

require('dotenv').config(); // Variables locales desde .env
const pool = require('./db');

const entryRoutes = require('./Routes/EntryRoutes');
const authRoutes = require('./Routes/AuthRoutes');
const loginRoutes = require('./Routes/LoginRoutes');
const notificationRoutes = require('./Routes/NotificationsRoutes');
const authorizationsRoutes = require('./Routes/AuthorizationRoutes');
const profileRoutes  = require('./Routes/ProfileRoutes');
const solicitudesRoutes = require('./Routes/SolicitudesRoutes');


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API funcionando correctamente [LOCAL]');
});

app.use('/api', authRoutes);
app.use('/api', entryRoutes);
app.use('/api', loginRoutes);
app.use('/api', notificationRoutes);
app.use('/api', authorizationsRoutes);
app.use('/api', profileRoutes);
app.use('/api', solicitudesRoutes);




app.listen(PORT, () => {
    console.log(`🚀 Backend local en http://localhost:${PORT}`);
});
