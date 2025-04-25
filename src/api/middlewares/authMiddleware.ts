import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../utils/config';

export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Missing authorization token.' });
    return;
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
}
