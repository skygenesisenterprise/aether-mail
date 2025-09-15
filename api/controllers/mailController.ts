import type { Request, Response } from 'express';
import Joi from 'joi';

const sendMailSchema = Joi.object({
  to: Joi.string().email().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
});

const emailIdSchema = Joi.object({
  emailId: Joi.string().required(),
});

export const sendMail = async (req: Request, res: Response) => {
  const { error } = sendMailSchema.validate(req.body);
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message });
    return;
  }

  const { to, subject, body } = req.body;
  res.json({ success: true, to, subject, body });
};

export const getInbox = async (req: Request, res: Response) => {
  res.json({ emails: [{ id: 1, from: 'alice@example.com', subject: 'Hi', read: false }] });
};

export const deleteMail = async (req: Request, res: Response) => {
  const { error } = emailIdSchema.validate(req.params);
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message });
    return;
  }

  const { emailId } = req.params;
  res.json({ success: true, emailId });
};
