import type { Request, Response } from 'express';

export const listFolders = async (req: Request, res: Response) => {
  res.json({ folders: ['Inbox', 'Sent', 'Drafts', 'Trash'] });
};

export const createFolder = async (req: Request, res: Response) => {
  const { name } = req.body;
  res.status(201).json({ success: true, folder: name });
};

export const deleteFolder = async (req: Request, res: Response) => {
  const { folderId } = req.params;
  res.json({ success: true, folderId });
};
