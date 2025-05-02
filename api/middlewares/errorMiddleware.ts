import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled Error', { err });
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
