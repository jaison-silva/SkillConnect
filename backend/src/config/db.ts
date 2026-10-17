import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    logger.error('FATAL ERROR: MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB connection failed: ${error.message}`);
    } else {
      logger.error('MongoDB connection failed with an unknown error');
    }
    process.exit(1);
  }
};