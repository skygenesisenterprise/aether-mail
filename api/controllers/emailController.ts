// api/controllers/emailController.ts
import { Request, Response } from 'express';
import { prisma } from '../../app/lib/prisma';

export const getEmails = async (req: Request, res: Response) => {
  const { folder } = req.query;

  // Validate and convert the folder variable
  if (typeof folder !== 'string') {
    return res.status(400).json({ error: 'Folder query parameter must be a string' });
  }

  try {
    const emails = await prisma.email.findMany({
      where: {
        folder: {
          name: folder, // Assuming 'name' is the field in the Folder model
        },
      },
    });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};