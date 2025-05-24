import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  const errorId = randomUUID();
  logger.error(`[${errorId}] Unhandled Error`, {
    message: err.message,
    stack: err.stack,
    status: err.status,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    errorId,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
