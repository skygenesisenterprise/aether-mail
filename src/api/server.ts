import express, { type Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import folderRoutes from './routes/folderRoutes';
import mailRoutes from './routes/mailRoutes';
import statusRoutes from './routes/statusRoutes';
import indexRoutes from './routes/indexRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/folders', folderRoutes);
app.use('/mails', mailRoutes);
app.use('/status', statusRoutes);
app.use('/', indexRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Aether Mail Backend running on port ${PORT}`);
});
