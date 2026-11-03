import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import './config/db.js';
import { HttpStatus } from './constants/enums.js';
import { RESPONSE_MESSAGES } from './constants/messages.js';
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
  res.status(HttpStatus.OK).json({
    status: 'active',
    message: RESPONSE_MESSAGES.SYSTEM.API_HEALTH_RUNNING,
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/admin/crm', crmRoutes);


app.use(errorHandler);


app.listen(PORT, () => {
  logger.info(`🚀 SkillConnect Server running on http://localhost:${PORT}`);
});
