import { Server } from 'http';
import { logger } from './logger';

export interface CleanupHandler {
  name: string;
  handler: () => Promise<void>;
}

export class GracefulShutdownManager {
  private isShuttingDown = false;
  private connections = new Set<Server>();
  private cleanupHandlers: CleanupHandler[] = [];
  private shutdownTimeout: number;

  constructor(options: { timeout?: number } = {}) {
    this.shutdownTimeout = options.timeout || 30000; // 30 seconds default
  }

  /**
   * Register a resource that needs cleanup
   */
  registerCleanup(name: string, handler: () => Promise<void>): void {
    this.cleanupHandlers.push({ name, handler });
    logger.debug({ name }, 'Registered cleanup handler');
  }

  /**
   * Track HTTP server for connection management
   */
  trackServer(server: Server): void {
    this.connections.add(server);
    
    // Track connections for proper draining
    server.on('connection', (socket) => {
      logger.debug('New connection established');
      
      socket.on('close', () => {
        logger.debug('Connection closed');
      });
    });

    logger.info('Server registered for graceful shutdown');
  }

  /**
   * Check if shutdown is in progress
   */
  isTerminating(): boolean {
    return this.isShuttingDown;
  }

  /**
   * Main shutdown handler
   */
  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    logger.info({ signal }, '🔄 Starting graceful shutdown');
    this.isShuttingDown = true;

    const startTime = Date.now();

    // Set up force shutdown timeout
    const forceShutdownTimer = setTimeout(() => {
      logger.error('⏰ Shutdown timeout exceeded, forcing exit');
      process.exit(1);
    }, this.shutdownTimeout);

    try {
      // Step 1: Stop accepting new connections
      logger.info('🛑 Stopping HTTP servers...');
      await this.closeServers();
      logger.info('✅ HTTP servers stopped');

      // Step 2: Run cleanup handlers in reverse order (LIFO)
      logger.info(`🧹 Running ${this.cleanupHandlers.length} cleanup handlers...`);
      for (let i = this.cleanupHandlers.length - 1; i >= 0; i--) {
        const { name, handler } = this.cleanupHandlers[i];
        logger.info(`🔧 Cleaning up: ${name}...`);
        
        try {
          await Promise.race([
            handler(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Cleanup timeout')), 5000)
            ),
          ]);
          logger.info({ name }, '✅ Cleanup completed');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error({ name, error: errorMessage }, '❌ Cleanup failed');
          // Continue with other cleanup handlers
        }
      }

      const duration = Date.now() - startTime;
      logger.info({ duration }, '✅ Graceful shutdown completed');
      
      clearTimeout(forceShutdownTimer);
      process.exit(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error: errorMessage }, '❌ Error during shutdown');
      clearTimeout(forceShutdownTimer);
      process.exit(1);
    }
  }

  /**
   * Close all tracked servers
   */
  private closeServers(): Promise<void> {
    const closePromises = Array.from(this.connections).map(server => 
      new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error({ error: err.message }, 'Error closing server');
            reject(err);
          } else {
            resolve();
          }
        });
      })
    );

    return Promise.all(closePromises).then(() => {
      this.connections.clear();
    });
  }
}

// Create singleton instance
export const shutdownManager = new GracefulShutdownManager({
  timeout: parseInt(process.env.SHUTDOWN_TIMEOUT || '30000', 10),
});

// Register signal handlers
process.on('SIGTERM', () => shutdownManager.shutdown('SIGTERM'));
process.on('SIGINT', () => shutdownManager.shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error: error.message, stack: error.stack }, '💥 Uncaught Exception');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, '💥 Unhandled Promise Rejection');
  process.exit(1);
});

export default shutdownManager;
