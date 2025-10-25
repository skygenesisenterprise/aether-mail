// api/controllers/emailController.ts
import { Request, Response } from "express";
import { prisma } from "../../app/lib/prisma";
import { sendMail } from "../services/smtpService";
import { emailApiService, EmailApiResponse } from "../services/emailApiService";
import { fetchInboxMails } from "../services/mailService";
import Joi from "joi";

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
  const { folder, limit, offset, search, sortBy, sortOrder } = req.query;
  const { imapConfig } = req.body;

  // Validate and convert the folder variable
  if (typeof folder !== "string") {
    return res
      .status(400)
      .json({ error: "Folder query parameter must be a string" });
  }

  try {
    let emails: any[];

    // Si des configs IMAP sont fournies, utiliser IMAP directement
    if (imapConfig) {
      const mails = await fetchInboxMails({
        username: imapConfig.imapUser,
        password: imapConfig.imapPass,
        host: imapConfig.imapHost,
        port: imapConfig.imapPort,
        tls: imapConfig.imapTls,
      });
      emails = mails.map((mail: any) => ({
        id: Math.random().toString(36).substr(2, 9), // Generate temp ID
        subject: mail.subject || "No subject",
        body: mail.html || mail.text || "",
        from: { name: "", email: mail.from || "" },
        to: "",
        timestamp: mail.date || new Date(),
        isRead: false,
        isStarred: false,
        isEncrypted: false,
        hasAttachments: false,
        attachments: [],
      }));
    } else if (
      process.env.NODE_ENV === "production" &&
      emailApiService.isAvailable()
    ) {
      try {
        const apiEmails = await emailApiService.getEmails(folder, {
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
          search: search as string,
          sortBy: sortBy as "date" | "subject" | "sender",
          sortOrder: sortOrder as "asc" | "desc",
        });
        emails = apiEmails.map(transformApiEmailToFrontend);
      } catch (apiError) {
        console.error("API Error, falling back to local data:", apiError);
        // En cas d'erreur API, on utilise les données locales
        emails = await getEmailsFromDatabase(folder);
      }
    } else {
      // En développement ou si l'API n'est pas disponible, utiliser la base de données locale
      emails = await getEmailsFromDatabase(folder);
    }

    res.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

/**
 * Fonction utilitaire pour récupérer les emails depuis la base de données locale
 */
async function getEmailsFromDatabase(folder: string): Promise<any> {
  let emails = await prisma.email.findMany({
    where: {
      folder: {
        name: folder,
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
        id: "1",
        subject: "Bienvenue dans Aether Mail",
        body: "<p>Bonjour,</p><p>Bienvenue dans votre nouveau client email Aether Mail. Cette application vous permet de gérer vos emails de manière sécurisée et moderne.</p><p>Cordialement,<br>L'équipe Aether</p>",
        from: {
          name: "Support",
          email: "support@aethermail.com",
          verified: true,
        },
        to: "admin@aethermail.com",
        timestamp: new Date(),
        isRead: false,
        isStarred: false,
        isEncrypted: false,
        hasAttachments: false,
        attachments: [],
      },
      {
        id: "2",
        subject: "Test avec pièce jointe",
        body: "<p>Voici un email de test avec une pièce jointe.</p>",
        from: { name: "Test User", email: "test@example.com" },
        to: "admin@aethermail.com",
        cc: "cc@example.com",
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
        isStarred: true,
        isEncrypted: false,
        hasAttachments: true,
        attachments: [
          {
            id: "1",
            filename: "document.pdf",
            filetype: "application/pdf",
            filesize: 2500000,
          },
        ],
      },
    ] as any;
  }

  return emails;
}

/**
 * Transforme un email de l'API vers le format attendu par le frontend
 */
function transformApiEmailToFrontend(apiEmail: EmailApiResponse): any {
  return {
    id: apiEmail.id,
    subject: apiEmail.subject,
    body: apiEmail.body,
    from: typeof apiEmail.from === "string" ? apiEmail.from : apiEmail.from,
    to: apiEmail.to,
    cc: apiEmail.cc,
    bcc: apiEmail.bcc,
    timestamp: new Date(apiEmail.timestamp),
    isRead: apiEmail.isRead,
    isStarred: apiEmail.isStarred,
    isEncrypted: apiEmail.isEncrypted,
    hasAttachments: apiEmail.hasAttachments,
    labels: apiEmail.labels || [],
    attachments: apiEmail.attachments || [],
  };
}

export const sendEmail = async (req: Request, res: Response) => {
  const { error } = sendEmailSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  const { to, cc, bcc, subject, body, password, attachments } = req.body;

  try {
    // En production, utiliser l'API officielle
    if (
      process.env.NODE_ENV === "production" &&
      emailApiService.isAvailable()
    ) {
      try {
        const result = await emailApiService.sendEmail({
          to,
          cc,
          bcc,
          subject,
          body,
          attachments,
        });
        return res.json(result);
      } catch (apiError) {
        console.error("API Error, falling back to SMTP:", apiError);
        // En cas d'erreur API, on utilise SMTP local
      }
    }

    // Fallback vers SMTP local (développement ou erreur API)
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

/**
 * Marque un email comme lu/non lu (API uniquement en production)
 */
export const markAsRead = async (req: Request, res: Response) => {
  const { emailId } = req.params;
  const { read = true } = req.body;

  try {
    if (
      process.env.NODE_ENV === "production" &&
      emailApiService.isAvailable()
    ) {
      const result = await emailApiService.markAsRead(emailId, read);
      return res.json(result);
    }

    // En développement, simuler le succès
    res.json({ success: true, message: "Email marked as read (dev mode)" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark email as read" });
  }
};

/**
 * Marque un email comme favori/non favori (API uniquement en production)
 */
export const toggleStar = async (req: Request, res: Response) => {
  const { emailId } = req.params;
  const { starred } = req.body;

  try {
    if (
      process.env.NODE_ENV === "production" &&
      emailApiService.isAvailable()
    ) {
      const result = await emailApiService.toggleStar(emailId, starred);
      return res.json(result);
    }

    // En développement, simuler le succès
    res.json({ success: true, message: "Email star toggled (dev mode)" });
  } catch (error) {
    console.error("Toggle star error:", error);
    res.status(500).json({ error: "Failed to toggle star" });
  }
};

/**
 * Supprime un email (API uniquement en production)
 */
export const deleteEmail = async (req: Request, res: Response) => {
  const { emailId } = req.params;
  const { permanent = false } = req.query;

  try {
    if (
      process.env.NODE_ENV === "production" &&
      emailApiService.isAvailable()
    ) {
      const result = await emailApiService.deleteEmail(
        emailId,
        permanent === "true",
      );
      return res.json(result);
    }

    // En développement, simuler le succès
    res.json({ success: true, message: "Email deleted (dev mode)" });
  } catch (error) {
    console.error("Delete email error:", error);
    res.status(500).json({ error: "Failed to delete email" });
  }
};

/**
 * Recherche d'emails (API uniquement en production)
 */
export const searchEmails = async (req: Request, res: Response) => {
  const { q: query, folder, limit = 50, offset = 0 } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    if (
      process.env.NODE_ENV === "production" &&
      emailApiService.isAvailable()
    ) {
      const results = await emailApiService.searchEmails(query, {
        folder: folder as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      return res.json(results.map(transformApiEmailToFrontend));
    }

    // En développement, retourner des résultats vides
    res.json([]);
  } catch (error) {
    console.error("Search emails error:", error);
    res.status(500).json({ error: "Failed to search emails" });
  }
};

/**
 * Récupère les statistiques des emails (API uniquement en production)
 */
export const getEmailStats = async (req: Request, res: Response) => {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      emailApiService.isAvailable()
    ) {
      const stats = await emailApiService.getStats();
      return res.json(stats);
    }

    // En développement, retourner des stats mockées
    res.json({
      totalEmails: 150,
      unreadCount: 12,
      folders: {
        inbox: { total: 45, unread: 8 },
        sent: { total: 32, unread: 0 },
        drafts: { total: 5, unread: 0 },
        trash: { total: 23, unread: 4 },
      },
    });
  } catch (error) {
    console.error("Get email stats error:", error);
    res.status(500).json({ error: "Failed to get email stats" });
  }
};

/**
 * Télécharge une pièce jointe (API uniquement en production)
 */
export const downloadAttachment = async (req: Request, res: Response) => {
  const { emailId, attachmentId } = req.params;

  try {
    if (
      process.env.NODE_ENV === "production" &&
      emailApiService.isAvailable()
    ) {
      const buffer = await emailApiService.downloadAttachment(
        emailId,
        attachmentId,
      );
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="attachment-${attachmentId}"`,
      );
      return res.send(buffer);
    }

    // En développement, retourner une erreur
    res
      .status(404)
      .json({ error: "Attachment download not available in development mode" });
  } catch (error) {
    console.error("Download attachment error:", error);
    res.status(500).json({ error: "Failed to download attachment" });
  }
};
