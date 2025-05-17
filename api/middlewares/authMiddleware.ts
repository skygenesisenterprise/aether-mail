import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    // Vérifie le token JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Logique spécifique pour statusRoutes
    if (req.baseUrl.includes('/status')) {
      // Exemple : restreindre à un rôle précis
      // if (!decoded || decoded.role !== 'user') {
      //   return res.status(403).json({ success: false, error: 'Forbidden for status routes' });
      // }
      // Tu peux aussi ajouter d'autres vérifications ici
    }

    // Ajoute les infos utilisateur à la requête si besoin
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

export default authMiddleware;