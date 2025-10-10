// api/controllers/emailController.ts
import { Request, Response } from "express";
import { prisma } from "../../app/lib/prisma";
import { sendMail } from "../services/smtpService";
import Joi from "joi";
import multer from "multer";
import fs from "fs";
import path from "path";

const sendEmailSchema = Joi.object({
  to: Joi.string().email().required(),
  cc: Joi.string().email().optional(),
  bcc: Joi.string().email().optional(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  password: Joi.string().required(), // For SMTP auth
  attachments: Joi.array()
    .items(
      Joi.object({
        filename: Joi.string().required(),
        content: Joi.string().required(), // base64
        contentType: Joi.string().required(),
      }),
    )
    .optional(),
});

export const getEmails = async (req: Request, res: Response) => {
  const { folder } = req.query;

  // Validate and convert the folder variable
  if (typeof folder !== "string") {
    return res
      .status(400)
      .json({ error: "Folder query parameter must be a string" });
  }

  try {
    let emails = await prisma.email.findMany({
      where: {
        folder: {
          name: folder, // Assuming 'name' is the field in the Folder model
        },
      },
      include: {
        attachments: true,
      },
    });

    // Données de test pour le développement
    if (process.env.NODE_ENV !== "production" && emails.length === 0) {
      emails = [
        {
          id: 1,
          subject: "Bienvenue dans Aether Mail",
          body: "<p>Bonjour,</p><p>Bienvenue dans votre nouveau client email Aether Mail. Cette application vous permet de gérer vos emails de manière sécurisée et moderne.</p><p>Cordialement,<br>L'équipe Aether</p>",
          from: "support@aethermail.com",
          to: "admin@aethermail.com",
          cc: null,
          bcc: null,
          sentAt: new Date(),
          folderId: 1,
          userId: 999,
          isRead: false,
          isStarred: false,
          isEncrypted: false,
          hasAttachments: false,
          labels: [],
          attachments: [],
        },
        {
          id: 2,
          subject: "Test avec pièce jointe",
          body: "<p>Voici un email de test avec une pièce jointe.</p>",
          from: "test@example.com",
          to: "admin@aethermail.com",
          cc: "cc@example.com",
          bcc: null,
          sentAt: new Date(Date.now() - 3600000),
          folderId: 1,
          userId: 999,
          isRead: true,
          isStarred: true,
          isEncrypted: false,
          hasAttachments: true,
          labels: ["important"],
          attachments: [
            {
              id: 1,
              filename: "document.pdf",
              filetype: "application/pdf",
              filesize: 2500000,
              emailId: 2,
            },
          ],
        },
      ] as any; // Type assertion pour les données mockées
    }

    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

export const sendEmail = async (req: Request, res: Response) => {
  const { error } = sendEmailSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  const { to, cc, bcc, subject, body, password, attachments } = req.body;

  try {
    // Assume user is authenticated and get SMTP config from DB
    const userId = (req as any).user?.id; // From auth middleware
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const smtpConfig = await prisma.smtpConfig.findUnique({
      where: { userId },
    });

    if (!smtpConfig) {
      return res
        .status(400)
        .json({ success: false, error: "SMTP config not found" });
    }

    const smtp = {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: `${(req as any).user.username}@${process.env.MAIL_DOMAIN}`,
        pass: password,
      },
    };

    const mailOptions: any = {
      from: smtp.auth.user,
      to,
      subject,
      text: body,
      html: body, // For now, assume body is HTML
    };

    if (cc) mailOptions.cc = cc;
    if (bcc) mailOptions.bcc = bcc;

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att: any) => ({
        filename: att.filename,
        content: Buffer.from(att.content, "base64"),
        contentType: att.contentType,
      }));
    }

    const info = await sendMail(
      smtp,
      mailOptions.from,
      to,
      subject,
      body,
      body,
    );

    // Save to DB
    const folder = await prisma.folder.findFirst({
      where: { userId, name: "Sent" },
    });

    if (folder) {
      await prisma.email.create({
        data: {
          subject,
          body,
          from: mailOptions.from,
          to,
          cc: cc || "",
          bcc: bcc || "",
          folderId: folder.id,
          userId,
          attachments: attachments
            ? {
                create: attachments.map((att: any) => ({
                  filename: att.filename,
                  filetype: att.contentType,
                  filesize: Buffer.byteLength(att.content, "base64"),
                })),
              }
            : undefined,
        },
      });
    }

    res.json({ success: true, messageId: info.messageId });
  } catch (err: any) {
    console.error("Send email error:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
};
