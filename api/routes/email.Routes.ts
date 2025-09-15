// api/routes/email.Routes.ts
import { Router } from 'express';
import { getEmails } from '../controllers/emailController';

const router = Router();

router.get('/emails', getEmails);

export default router;