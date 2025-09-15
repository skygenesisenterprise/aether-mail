import type { Request, Response, NextFunction } from 'express';
import { createMailAccount, validateMailLogin } from '../services/authService';
import { loginWithExternalAuth } from '../services/authService';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export async function register(req: Request, res: Response) {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message });
    return;
  }

  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await createMailAccount({ username, email: `${username}@${process.env.MAIL_DOMAIN}`, password: hashedPassword });
  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, error: error.details[0].message });
      return;
    }

    const { username, password } = req.body;
    const isValid = await validateMailLogin({ username, email: `${username}@${process.env.MAIL_DOMAIN}`, password });
    if (isValid) {
      // Ici tu pourrais générer un JWT ou une session
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ success: true });
};
