import { Router } from 'express';
import { login, logout } from '../controllers/authController';
import { validateLogin } from '../middlewares/validateMiddleware';

const router = Router();

router.post('/login', validateLogin, login);
router.post('/logout', logout);

export default router;
