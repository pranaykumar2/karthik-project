import { config } from 'dotenv';
import path from 'path';

// Load environment variables at the very beginning
const result = config({ path: path.join(__dirname, '../.env') });
config();


if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

console.log('Loaded environment variables:', {
    PINATA_API_KEY: !!process.env.PINATA_API_KEY,
    PINATA_SECRET_KEY: !!process.env.PINATA_SECRET_KEY,
    PORT: process.env.PORT || 3000
});

import express from 'express';
import { DatabaseService } from './services/databaseService';
import uploadRouter from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
DatabaseService.initialize()
    .then(() => {
        console.log('Database initialized successfully');
    })
    .catch(error => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Current time (UTC): ${new Date().toISOString()}`);
    console.log(`Current user: pranaykumar2`);
});