import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import folderRoutes from './routes/folderRoutes';
import mailRoutes from './routes/mailRoutes';
import statusRoutes from './routes/statusRoutes';
import imapRoutes from './routes/imapRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';

dotenv.config();

const validateEnv = () => {
  if (!process.env.PORT) {
    process.env.PORT = '3000';
  }
  if (!process.env.CPANEL_USER || !process.env.CPANEL_TOKEN || !process.env.CPANEL_DOMAIN || !process.env.CPANEL_HOST) {
    console.warn('Attention : certaines variables cPanel ne sont pas définies dans .env');
  }
};
validateEnv();

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route API accessible via "/api/{Routes}"
app.use('/api', authRoutes);
app.use('/api', folderRoutes);
app.use('/api', mailRoutes);
app.use('/api', statusRoutes);
app.use('/api', imapRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorMiddleware);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Aether Mail Backend running on port ${PORT}`);
});

export default app;