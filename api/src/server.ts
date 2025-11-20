import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes after dotenv config
import mailRoutes from "./routes/mailRoute";
import authRoutes from "./routes/authRoute";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/mail", mailRoutes);
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  },
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Aether Mail API server running on port ${PORT}`);
  console.log(
    `📧 Mail endpoints available at http://localhost:${PORT}/api/mail`,
  );
  console.log(
    `🔐 Auth endpoints available at http://localhost:${PORT}/api/auth`,
  );
});
