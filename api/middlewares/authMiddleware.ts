import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
    const decoded = jwt.verify(token, config.jwtSecret);

    // Logique spécifique pour statusRoutes
    if (req.baseUrl.includes('/status')) {
      // Exemple : restreindre à un rôle précis
      // if (!decoded || decoded.role !== 'user') {
      //   return res.status(403).json({ success: false, error: 'Forbidden for status routes' });
      // }
      // Tu peux aussi ajouter d'autres vérifications ici
    }

    // Ajoute les infos utilisateur à la requête si besoin
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

export default authMiddleware;