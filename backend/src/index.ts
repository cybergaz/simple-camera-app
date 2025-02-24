import express from 'express';
import cors from 'cors';
import { mediaRoutes } from './routes/mediaRoutes';
import { authRoutes } from './routes/authRoutes';
import { createTables } from './utils/postgres';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/media', mediaRoutes);
app.use('/auth', authRoutes)

// Start server
app.listen(PORT, () => {
    createTables()
    console.log(`Server running on http://localhost:${PORT}`);
});
