import type { Request, Response, NextFunction } from 'express';
import { loginWithExternalAuth } from '../services/authService';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Call service to authenticate with SkyGenesis
    const { username, password } = req.body;
    const result = await loginWithExternalAuth(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  // To be expanded if stateful auth added
  res.json({ success: true });
};
