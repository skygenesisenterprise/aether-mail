import { Router } from 'express';
import { markRead, markUnread } from '../controllers/statusController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.patch('/read/:emailId', markRead);
router.patch('/unread/:emailId', markUnread);

export default router;
