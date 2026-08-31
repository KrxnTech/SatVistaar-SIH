import app from './app.js';
import config from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`=================================`);
  console.log(`🚀 SatQuery AI Backend Running `);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port:        ${config.port}`);
  console.log(`API Prefix:  ${config.apiPrefix}`);
  console.log(`Health Check: http://localhost:${config.port}${config.apiPrefix}/health`);
  console.log(`=================================`);
});

// Server error handling (e.g., EADDRINUSE)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use.`);
  } else {
    console.error('Server error:', err);
  }
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

if (config.nodeEnv === 'production') {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});
