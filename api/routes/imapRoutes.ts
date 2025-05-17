import { Router, Request, Response } from 'express';
import { fetchInboxMails } from '../services/mailService';
import config from '../utils/config';

// Cette route suppose que l'utilisateur est authentifié et que ses identifiants IMAP sont disponibles dans req.body ou req.user
const router = Router();

router.post('/inbox', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Missing username or password.' });
  }

  try {
    const mails = await fetchInboxMails({
      username: `${username}@${config.cpanelDomain}`,
      password,
      host: config.imapHost,
      port: config.imapPort,
      tls: config.imapTls,
    });
    res.json({ success: true, mails });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Unable to fetch inbox.' });
  }
});

export default router;