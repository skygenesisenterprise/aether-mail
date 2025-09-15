import { body, type ValidationChain, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

const validateLogin: ValidationChain[] = [
  body('username').isString().notEmpty().withMessage('Username is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

const validateCreateFolder: ValidationChain[] = [
  body('name').isString().notEmpty().withMessage('Folder name is required'),
];

const validateSendMail: ValidationChain[] = [
  body('to').isEmail().withMessage('Valid email is required'),
  body('subject').isString().notEmpty().withMessage('Subject is required'),
  body('body').isString().notEmpty().withMessage('Body is required'),
];

function validateMiddleware(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { validateLogin, validateCreateFolder, validateSendMail, validateMiddleware };
