// src/api/routes/indexRoutes.ts
import { Router } from 'express';
import authRoutes from './authRoutes';
import folderRoutes from './folderRoutes';
import mailRoutes from './mailRoutes';
import statusRoutes from './statusRoutes';

const router = Router();

// Route d'index pour tester que l'API fonctionne
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Aether Mail API!' });
});

// Point d'entrée des routes d'authentification
router.use('/auth', authRoutes);

// Point d'entrée des routes de gestion des dossiers
router.use('/folders', folderRoutes);

// Point d'entrée des routes de gestion des mails
router.use('/mails', mailRoutes);

// Point d'entrée des routes de gestion des statuts des mails
router.use('/status', statusRoutes);

export default router;
