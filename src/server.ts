import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from 'redis';
import winston from 'winston';
import dotenv from 'dotenv';
import { MCPServer } from './mcp/MCPServer';
import { MetabaseClient } from './clients/MetabaseClient';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '0.1.0' });
});

// Initialize MCP Server
async function initializeMCPServer() {
  try {
    // Create Redis client
    const redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    
    await redisClient.connect();
    logger.info('Connected to Redis');

    // Create Metabase client
    const metabaseClient = new MetabaseClient({
      baseUrl: process.env.METABASE_URL!,
      apiKey: process.env.METABASE_API_KEY!,
    });

    // Initialize MCP Server
    const mcpServer = new MCPServer({
      metabaseClient,
      redisClient,
      logger,
    });

    // Mount MCP routes
    app.use('/mcp', mcpServer.getRouter());

    logger.info('MCP Server initialized');
  } catch (error) {
    logger.error('Failed to initialize MCP Server:', error);
    process.exit(1);
  }
}

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  await initializeMCPServer();
  
  app.listen(PORT, () => {
    logger.info(`MMS Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});