import { Request, Response, NextFunction } from 'express';

// Exemple de middleware pour vérifier l'authentification (à adapter avec JWT ou session)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Exemple : vérifier un token dans l'en-tête Authorization
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

  // Ici tu pourrais vérifier le token (JWT, etc.)
  // if (isValidToken(token)) { next(); } else { ... }
  next();
}
