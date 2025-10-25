// =====================
// Imports
// =====================
import express, { Application, Request, Response } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import session from "express-session";
import cookieParser from "cookie-parser";
import { body, validationResult } from "express-validator";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.json" assert { type: "json" };
import passport from "./passport";

// ====================
// Routes API
// =====================
import authRoutes from "./routes/auth.Routes";
import betterAuthRoutes from "./routes/auth";
import folderRoutes from "./routes/folder.Routes";
import mailRoutes from "./routes/mail.Routes";
import statusRoutes from "./routes/status.Routes";
import imapRoutes from "./routes/imap.Routes";
import emailRoutes from "./routes/email.Routes";
// import settingRoutes from './routes/settingRoutes';

// Documentation

// Middlewares
import { errorMiddleware } from "./middlewares/errorMiddleware";

// =====================
// Chargement de l'env & validation
// =====================
dotenv.config();

const validateEnv = () => {
  if (!process.env.PORT) process.env.PORT = "3000";
  if (
    !process.env.MAIL_USER ||
    !process.env.MAIL_TOKEN ||
    !process.env.MAIL_DOMAIN ||
    !process.env.MAIL_HOST
  ) {
    console.warn(
      "Attention : certaines variables Mail ne sont pas définies dans .env",
    );
  }
};
validateEnv();

// =====================
// Initialisation
// =====================
const app = express();

// =====================
// Middlewares globaux (sécurité, parsing, logs)
// =====================
app.use(helmet());
app.use(helmet.frameguard({ action: "deny" })); // Protection clickjacking
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(mongoSanitize());
app.use(cookieParser());
app.use(compression());

// Activation conditionnelle de xss-clean et csurf selon l'environnement
if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const xss = require("xss-clean");
  app.use(xss());
  // Si tu utilises une session/cookie-parser :
  // const csurf = require('csurf');
  // app.use(csurf());
}

app.disable("x-powered-by");

// =====================
// CORS dynamique selon l'environnement
// =====================
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGIN?.split(",") || [""]
    : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  }),
);

// =====================
// Middlewares spécifiques à la prod
// =====================

// Forcer HTTPS en production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// Bloquer les routes de test en production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.path.startsWith("/test")) {
    return res.status(403).json({ error: "Forbidden in production" });
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
  message: "Trop de tentatives, réessayez plus tard.",
});
app.use("/api/v1/login", authLimiter);

// =====================
// Session
// =====================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

// =====================
// Servir les fichiers statiques du frontend
// =====================
app.use(express.static(path.join(__dirname, "../frontend")));

// Fallback pour SPA - servir index.html pour toutes les routes non-API
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../index.html"));
  }
});

// =====================
// Routing API
// =====================
const apiRouter = express.Router();
apiRouter.use(betterAuthRoutes);
apiRouter.use(authRoutes);
apiRouter.use(folderRoutes);
apiRouter.use(mailRoutes);
apiRouter.use(statusRoutes);
apiRouter.use(imapRoutes);
apiRouter.use(emailRoutes);
// apiRouter.use(settingRoutes);

app.use("/api/v1", apiRouter);

// =====================
// Passport initialization
// =====================
app.use(passport.initialize());
app.use(passport.session());

// =====================
// Documentation API
// =====================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// =====================
// Gestion des erreurs & 404
// =====================
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorMiddleware);

// =====================
// Gestion des exceptions non catchées
// =====================
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// =====================
// Démarrage du serveur
// =====================
const PORT = Number(process.env.PORT) || 3000;

try {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Aether Mail Backend running on port ${PORT}`);
  });

  // Gestion des erreurs au niveau du serveur HTTP
  server.on("error", (err) => {
    console.error("❌ Erreur lors du démarrage du serveur :", err);
    process.exit(1);
  });
} catch (err) {
  console.error("❌ Exception synchrone lors du démarrage du serveur :", err);
  process.exit(1);
}

export default app;
