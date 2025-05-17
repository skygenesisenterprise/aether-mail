import { Router, Request, Response } from 'express';
import { sendMail } from '../services/smtpService';

const router = Router();

router.post('/send', async (req: Request, res: Response) => {
  const { smtpUser, smtpPass, to, subject, text, html } = req.body;

  if (!smtpUser || !smtpPass || !to || !subject || !text) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  try {
    const info = await sendMail(
      {
        host: process.env.SMTP_HOST || '',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      },
      smtpUser,
      to,
      subject,
      text,
      html
    );
    res.json({ success: true, info });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;