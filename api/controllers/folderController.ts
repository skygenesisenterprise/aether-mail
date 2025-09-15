import type { Request, Response } from 'express';
import Joi from 'joi';

const folderSchema = Joi.object({
  name: Joi.string().required(),
});

const folderIdSchema = Joi.object({
  folderId: Joi.string().required(),
});

export const listFolders = async (req: Request, res: Response) => {
  res.json({ folders: ['Inbox', 'Sent', 'Drafts', 'Trash'] });
};

export const createFolder = async (req: Request, res: Response) => {
  const { error } = folderSchema.validate(req.body);
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message });
    return;
  }

  const { name } = req.body;
  res.status(201).json({ success: true, folder: name });
};

export const deleteFolder = async (req: Request, res: Response) => {
  const { error } = folderIdSchema.validate(req.params);
  if (error) {
    res.status(400).json({ success: false, error: error.details[0].message });
    return;
  }

  const { folderId } = req.params;
  res.json({ success: true, folderId });
};
