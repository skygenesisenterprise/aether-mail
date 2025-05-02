import type { Request, Response } from 'express';

export const sendMail = async (req: Request, res: Response) => {
  const { to, subject, body } = req.body;
  res.json({ success: true, to, subject, body });
};

export const getInbox = async (req: Request, res: Response) => {
  res.json({ emails: [{ id: 1, from: 'alice@example.com', subject: 'Hi', read: false }] });
};

export const deleteMail = async (req: Request, res: Response) => {
  const { emailId } = req.params;
  res.json({ success: true, emailId });
};
