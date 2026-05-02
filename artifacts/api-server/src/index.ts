import app from "./app";
import { logger } from "./lib/logger";
import { appConfig, isProduction } from "./lib/config";
import { shutdownManager } from "./lib/graceful-shutdown";
import { health } from "./routes/health";

const port = appConfig.port;

// Startup sequence
async function startup() {
  try {
    logger.info("🚀 Starting application...");
    
    // Log configuration (without sensitive data)
    logger.info({
      port,
      nodeEnv: appConfig.nodeEnv,
      logLevel: appConfig.logLevel,
      databaseUrl: appConfig.database.url.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // Hide credentials
      corsOrigins: appConfig.cors.origins,
    }, "📋 Configuration loaded");

    // Start server
    const server = app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "❌ Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "🌐 Server listening");
      
      // Mark service as ready
      health.setReady(true);
      logger.info("✅ Application ready to serve traffic");
    });

    // Register server with graceful shutdown manager
    shutdownManager.trackServer(server);

    // Register cleanup handlers (add more as needed)
    shutdownManager.registerCleanup('logger', async () => {
      // Flush any pending logs
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      health.setTerminating();
      shutdownManager.shutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      health.setTerminating();
      shutdownManager.shutdown('SIGINT');
    });

    return server;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMessage }, '💥 Startup failed');
    process.exit(1);
  }
}

// Start the application
startup().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error({ error: errorMessage }, '💥 Fatal startup error');
  process.exit(1);
});
