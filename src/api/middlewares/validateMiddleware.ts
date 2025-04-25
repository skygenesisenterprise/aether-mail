import { body, type ValidationChain, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

export const validateLogin: ValidationChain[] = [
  body('username').isString().notEmpty(),
  body('password').isString().notEmpty(),
];

export const validateCreateFolder: ValidationChain[] = [
  body('name').isString().notEmpty(),
];

export const validateSendMail: ValidationChain[] = [
  body('to').isEmail(),
  body('subject').isString().notEmpty(),
  body('body').isString().notEmpty(),
];

export function validateMiddleware(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
