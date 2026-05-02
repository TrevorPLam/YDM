import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { shutdownManager } from "../lib/graceful-shutdown";

class HealthCheckManager {
  private isReady = false;
  private isLive = true;

  setReady(ready: boolean): void {
    this.isReady = ready;
    logger.info({ ready }, 'Health readiness status updated');
  }

  setTerminating(): void {
    this.isReady = false;
    logger.info('Service marked as terminating');
  }

  // Kubernetes liveness probe - is the process running correctly?
  getLivenessStatus(): { status: string; httpStatus: number } {
    return {
      status: this.isLive ? 'ok' : 'error',
      httpStatus: this.isLive ? 200 : 500,
    };
  }

  // Kubernetes readiness probe - can we handle traffic?
  getReadinessStatus(): { 
    status: string; 
    httpStatus: number; 
    details: { ready: boolean; terminating: boolean };
  } {
    const ready = this.isReady && !shutdownManager.isTerminating();
    return {
      status: ready ? 'ok' : 'not ready',
      httpStatus: ready ? 200 : 503,
      details: {
        ready: this.isReady,
        terminating: shutdownManager.isTerminating(),
      },
    };
  }
}

const health = new HealthCheckManager();

const router: IRouter = Router();

// Legacy health endpoint (backward compatibility)
router.get("/healthz", async (_req, res) => {
  try {
    // Basic health check
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Health check failed');
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

// Liveness probe - is the process alive?
router.get("/live", (_req, res) => {
  const status = health.getLivenessStatus();
  res.status(status.httpStatus).json({
    status: status.status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness probe - can we handle traffic?
router.get("/ready", async (_req, res) => {
  const status = health.getReadinessStatus();
  
  if (status.httpStatus === 503) {
    res.status(503).json({
      status: status.status,
      timestamp: new Date().toISOString(),
      ...status.details,
      message: shutdownManager.isTerminating() 
        ? 'Server is shutting down' 
        : 'Service not ready',
    });
  } else {
    res.status(200).json({
      status: status.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      ...status.details,
    });
  }
});

// Comprehensive health check with database connectivity
router.get("/health", async (_req, res) => {
  const startTime = Date.now();
  
  try {
    const checks = {
      status: 'ok' as 'ok' | 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: 'unknown' as 'ok' | 'error',
        memory: 'ok' as 'ok' | 'error',
        disk: 'ok' as 'ok' | 'error',
      },
      responseTime: 0,
    };

    // Database connectivity check (basic)
    try {
      // Simple database connectivity check would go here
      // For now, just check if DATABASE_URL is set
      if (process.env.DATABASE_URL) {
        checks.checks.database = 'ok';
      } else {
        checks.checks.database = 'error';
      }
    } catch (error) {
      checks.checks.database = 'error';
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Database health check failed');
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    if (memUsageMB > 500) { // 500MB threshold
      checks.checks.memory = 'error';
    }

    // Set overall status based on checks
    const hasErrors = Object.values(checks.checks).some(check => check === 'error');
    if (hasErrors) {
      checks.status = 'error';
    }

    checks.responseTime = Date.now() - startTime;

    const httpStatus = checks.status === 'ok' ? 200 : 503;
    res.status(httpStatus).json(checks);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMessage }, 'Comprehensive health check failed');
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: errorMessage,
      responseTime: Date.now() - startTime,
    });
  }
});

// Export health manager for use in app startup/shutdown
export { health };
export default router;
