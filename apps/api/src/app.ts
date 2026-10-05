import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    const start = performance.now();
    res.on('finish', () => {
      const duration = (performance.now() - start).toFixed(1);
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // Root health probe
  app.get('/', (req, res) => {
    res.json({
      name: 'Intelligent Adaptive Route Optimization & Personal Route Intelligence Platform API',
      status: 'ONLINE',
      version: '1.0.0',
      apiPrefix: config.apiPrefix,
      docs: `${config.apiPrefix}/system/health`
    });
  });

  // Mount API Router
  app.use(config.apiPrefix, apiRouter);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
      }
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
