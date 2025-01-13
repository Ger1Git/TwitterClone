import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import connectMongoDB from './db/connectMongo.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

const frontendUrl = process.env.FRONTEND_URL;
const corsOptions = {
    origin: function (origin, callback) {
        if (origin === frontendUrl || !origin) {
            callback(null, true);
        } else {
            callback(
                new Error('CORS policy: This origin is not allowed by CORS.')
            );
        }
    },
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.get('/api/db-status', (req, res) => {
    const state = mongoose.connection.readyState;
    const status = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    res.send(
        `Database connection status: ${status[state]} ${process.env.PORT}`
    );
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
    connectMongoDB();
});

export default app;
