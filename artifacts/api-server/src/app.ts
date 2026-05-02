import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { appConfig, isDevelopment } from "./lib/config";
import { shutdownManager } from "./lib/graceful-shutdown";
import { defaultSecurityHeaders, developmentSecurityHeaders } from "./middleware/security";
import { generalRateLimit } from "./middlewares/rateLimit";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Apply security headers
app.use(isDevelopment ? developmentSecurityHeaders : defaultSecurityHeaders);

// Apply rate limiting
app.use(generalRateLimit);

// Middleware to reject new requests during shutdown
app.use((req, res, next) => {
  if (shutdownManager.isTerminating()) {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Server is shutting down',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
});

// Configure CORS with environment-specific origins
app.use(cors({
  origin: appConfig.cors.origins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Root route
app.get("/", (_req, res) => {
  res.json({
    message: "API Server is running",
    endpoints: {
      health: "/api/healthz",
      api: "/api"
    }
  });
});

export default app;
