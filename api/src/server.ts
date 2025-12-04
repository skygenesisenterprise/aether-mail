import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import {
  config,
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Import routes after dotenv config
import mailRoutes from "./routes/mailRoute.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";

app.use("/api/v1/mail", mailRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", userRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: "1.0.0",
    services: {
      database: "connected",
      api: "running",
      monitoring: "active",
    },
  });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", err);

  res.status(err.status || 500).json({
    error:
      config.nodeEnv === "production" ? "Internal server error" : err.message,
    ...(config.nodeEnv !== "production" && { stack: err.stack }),
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(config.port, () => {
      console.log(`🚀 API Server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(
        `📝 API Documentation: http://localhost:${config.port}/api/v1/docs`,
      );
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        console.log("🔌 HTTP server closed");
        await disconnectDatabase();
        console.log("👋 Server shut down complete");
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error("❌ Forced shutdown due to timeout");
        process.exit(1);
      }, 30000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;