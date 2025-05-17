import type { Request, Response, NextFunction } from 'express';
import { createCpanelAccount, validateCpanelLogin } from '../services/authService';
import { loginWithExternalAuth } from '../services/authService';

export async function register(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Missing fields.' });
    return;
  }

  const result = await createCpanelAccount({ username, email: `${username}@${process.env.CPANEL_DOMAIN}`, password });
  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'Missing fields.' });

    const isValid = await validateCpanelLogin({ username, email: `${username}@${process.env.CPANEL_DOMAIN}`, password });
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
