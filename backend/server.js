import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import connectMongoDB from './db/connectMongo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Server is ready');
})

app.listen(PORT, () => {
    console.log('Server running');
    connectMongoDB();
})