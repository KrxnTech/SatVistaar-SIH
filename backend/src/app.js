import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import requestIdMiddleware from './middleware/requestId.middleware.js';
import notFoundMiddleware from './middleware/notFound.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// 1. Security middleware
app.use(helmet());

// 2. CORS configuration using CLIENT_URL from environment
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  })
);

// 3. Request ID middleware (must run before logging & routes)
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
