import express, { type Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import folderRoutes from './routes/folderRoutes';
import mailRoutes from './routes/mailRoutes';
import statusRoutes from './routes/statusRoutes';
import indexRoutes from './routes/indexRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';

dotenv.config();

// Valider les variables d'environnement
const validateEnv = () => {
  if (!process.env.PORT) {
    console.warn('PORT is not defined in the environment variables. Using default port 3000.');
    process.env.PORT = '3000'; // Définir une valeur par défaut
  }
};
validateEnv();

const app: Application = express();

// Middleware de sécurité et de journalisation
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Middleware pour parser les requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/folders', folderRoutes);
app.use('/mails', mailRoutes);
app.use('/status', statusRoutes);
app.use('/', indexRoutes);

// Gestion des routes non trouvées
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Middleware de gestion des erreurs
app.use(errorMiddleware);

// Gestion globale des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Aether Mail Backend running on port ${PORT}`);
});
