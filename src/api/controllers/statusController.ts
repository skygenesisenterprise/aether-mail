import type { Request, Response } from 'express';

export const markRead = async (req: Request, res: Response) => {
  const { emailId } = req.params;
  res.json({ success: true, emailId, status: 'read' });
};

export const markUnread = async (req: Request, res: Response) => {
  const { emailId } = req.params;
  res.json({ success: true, emailId, status: 'unread' });
};
