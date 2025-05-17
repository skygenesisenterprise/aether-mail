import { Router } from 'express';
import { sendMail, getInbox, deleteMail } from '../controllers/mailController';
import authMiddleware from '../middlewares/authMiddleware';
import { validateSendMail } from '../middlewares/validateMiddleware';

const router = Router();
router.use(authMiddleware);

// router.post('/send', validateSendMail, sendMail);
router.post('/send', sendMail);
router.get('/inbox', getInbox);
router.delete('/:emailId', deleteMail);

export default router;