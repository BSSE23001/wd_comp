import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testConnection } from '../config/db'; // Double check this path matches your folder structure

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running!');
});

// Start Server and Test DB
const startServer = async () => {
  try {
    // Run the Prisma connection test we wrote
    await testConnection();

    app.listen(PORT, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to DB connection issues:', error);
    process.exit(1);
  }
};

startServer();