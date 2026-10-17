import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { logger, morganStream } from './utils/logger.js';
import authRoutes from './routes/auth.routes.js';
import crmRoutes from './routes/crm.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);
const CLIENT_URL: string = process.env.CLIENT_URL || 'http://localhost:5173';


app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined', { stream: morganStream }));

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'active',
    message: 'SkillConnect API is running cleanly with Inversify & N-Tier Architecture',
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/admin/crm', crmRoutes);


app.use(errorHandler);


const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`🚀 SkillConnect Server running on http://localhost:${PORT}`);
  });
};

startServer();