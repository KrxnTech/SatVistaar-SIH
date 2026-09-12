import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import requestIdMiddleware from './middleware/requestId.middleware.js';
import notFoundMiddleware from './middleware/notFound.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// 1. Security middleware
app.use(helmet());

// 2. CORS configuration supporting localhost, Vercel deployments, and custom domains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, uptime monitors)
      if (!origin) return callback(null, true);

      // Allow local development
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, origin);
      }

      // Allow any Vercel deployment (*.vercel.app or sat-vistaar.vercel.app)
      if (origin.endsWith('.vercel.app') || origin.includes('vercel.app')) {
        return callback(null, origin);
      }

      // Allow explicitly configured clientUrl
      if (config.clientUrl && (origin.toLowerCase() === config.clientUrl.toLowerCase() || config.clientUrl === '*')) {
        return callback(null, origin);
      }

      // Fallback: reflect the origin to allow credentials
      return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  })
);

// 3. Cookie Parsing middleware
app.use(cookieParser(config.cookieSecret || undefined));

// 4. Request ID middleware (must run before logging & routes)
app.use(requestIdMiddleware);

// 4. Request Logging middleware (Morgan) with custom request-id token
morgan.token('request-id', (req) => req.requestId || 'N/A');
const morganFormat = config.isProduction
  ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] [reqId: :request-id]'
  : ':method :url :status :res[content-length] - :response-time ms [reqId: :request-id]';

app.use(morgan(morganFormat));

// 5. Body Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.resolve(config.uploadDir || 'uploads')));

// Root status endpoint for deployment health verification
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'SatVistaar Remote Sensing AI Backend',
    version: '1.0.0',
    status: 'operational',
    health: `${config.apiPrefix}/health`,
    apiPrefix: config.apiPrefix,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// 6. API Route mounting
// Primary prefix: e.g. /api/v1
app.use(config.apiPrefix, apiRoutes);

// Fallback prefix: /api (if primary prefix is /api/v1) for convenience
if (config.apiPrefix !== '/api') {
  app.use('/api', apiRoutes);
}

// 7. 404 Handler for unmatched routes
app.use(notFoundMiddleware);

// 8. Centralized Error Handler
app.use(errorMiddleware);

export default app;
