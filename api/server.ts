// Importation des modules nécessaires
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import csurf from 'csurf';

// Routes
import authRoutes from './routes/authRoutes';
import folderRoutes from './routes/folderRoutes';
import mailRoutes from './routes/mailRoutes';
import statusRoutes from './routes/statusRoutes';
import imapRoutes from './routes/imapRoutes';
// import settingRoutes from './routes/settingRoutes';

// Middlewares
import { errorMiddleware } from './middlewares/errorMiddleware';

// =====================
// Chargement de l'env & validation
// =====================
dotenv.config();

const validateEnv = () => {
  if (!process.env.PORT) process.env.PORT = '3000';
  if (!process.env.CPANEL_USER || !process.env.CPANEL_TOKEN || !process.env.CPANEL_DOMAIN || !process.env.CPANEL_HOST) {
    console.warn('Attention : certaines variables cPanel ne sont pas définies dans .env');
  }
};
validateEnv();

// =====================
// Création de l'app
// =====================
const app: Application = express();

// =====================
// Sécurité & middlewares globaux
// =====================

// CORS dynamique selon l'environnement
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://webmail.skygenesisenterprise.com'] // Domaine de production (A changer selon le besoin)
    : ['http://localhost:5173'],                   // Domaine de développement (Environment local par défaut)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true
}));

// Sécurité HTTP
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' })); // Protection clickjacking

// Logs
app.use(morgan('dev'));

// Protection contre les attaques courantes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(csurf());
app.disable('x-powered-by');

// =====================
// Middlewares spécifiques à la prod
// =====================

// Forcer HTTPS en production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Bloquer les routes de test en production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.path.startsWith('/test')) {
    return res.status(403).json({ error: 'Forbidden in production' });
  }
  next();
});

// =====================
// Rate limiting
// =====================

// Limite générale
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Limite spécifique pour les endpoints sensibles (ex: login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives par 15 min
  message: 'Trop de tentatives, réessayez plus tard.'
});
app.use('/api/v1/login', authLimiter);

// =====================
// Routing API
// =====================

const apiRouter = express.Router();
apiRouter.use(authRoutes);
apiRouter.use(folderRoutes);
apiRouter.use(mailRoutes);
apiRouter.use(statusRoutes);
apiRouter.use(imapRoutes);
// apiRouter.use(settingRoutes);

app.use('/api/v1', apiRouter);

// =====================
// Gestion des erreurs & 404
// =====================

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorMiddleware);

// =====================
// Gestion des exceptions non catchées
// =====================

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// =====================
// Démarrage du serveur
// =====================

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Aether Mail Backend running on port ${PORT}`);
});

export default app;