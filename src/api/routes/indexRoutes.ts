import { Router } from 'express';

const router = Router();
import type { Request, Response } from 'express';

router.get('/status', (_req: Request, res: Response) => res.json({ status: 'ok' }));

export default router;
