import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';
import uploadRouter from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('uploads'));

// Routes
app.use('/api', uploadRouter);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Database connection and server start
createConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
    });