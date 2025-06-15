import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const logger: Logger = req.app.locals.logger || console;
  
  logger.error('Error handling request', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  // Handle specific error types
  if (err.response?.status === 401) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or missing API key'
    });
  }

  if (err.response?.status === 404) {
    return res.status(404).json({
      error: 'Resource not found',
      message: err.message
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Unable to connect to Metabase'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred processing your request'
  });
}