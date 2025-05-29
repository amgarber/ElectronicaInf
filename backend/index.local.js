const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5050;

require('dotenv').config(); // Variables locales desde .env
const pool = require('./db');

const entryRoutes = require('./Routes/EntryRoutes');
const authRoutes = require('./Routes/AuthRoutes');
const loginRoutes = require('./Routes/LoginRoutes');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API funcionando correctamente [LOCAL]');
});

app.use('/api', authRoutes);
app.use('/api', entryRoutes);
app.use('/api', loginRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Backend local en http://localhost:${PORT}`);
});
