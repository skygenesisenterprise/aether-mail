import { Request, Response } from "express";
import { MailService, MailServerConfig } from "../services/mailService";

export class MailController {
  static async testConnection(req: Request, res: Response) {
    try {
      const { email, password, imapConfig, smtpConfig } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const config: MailServerConfig = {
        imap: imapConfig || {
          host: "imap.gmail.com",
          port: 993,
          tls: true,
          user: email,
          password,
        },
        smtp: smtpConfig || {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          user: email,
          password,
        },
      };

      const [imapOk, smtpOk] = await Promise.all([
        MailService.testImapConnection(config.imap),
        MailService.testSmtpConnection(config.smtp),
      ]);

      res.json({
        success: imapOk && smtpOk,
        imap: imapOk,
        smtp: smtpOk,
        message:
          imapOk && smtpOk
            ? "Connection successful"
            : `Connection failed - IMAP: ${imapOk ? "OK" : "Failed"}, SMTP: ${smtpOk ? "OK" : "Failed"}`,
      });
    } catch (error) {
      res.status(500).json({
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async connect(req: Request, res: Response) {
    try {
      const { email, password, imapConfig, smtpConfig } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const config: MailServerConfig = {
        imap: imapConfig || {
          host: "imap.gmail.com",
          port: 993,
          tls: true,
          user: email,
          password,
        },
        smtp: smtpConfig || {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          user: email,
          password,
        },
      };

      const userId = Buffer.from(email).toString("base64").replace(/=/g, "");

      const connection = await MailService.createConnection(userId, config);

      res.json({
        success: true,
        message: "Connected successfully",
        connectionId: userId,
      });
    } catch (error) {
      res.status(500).json({
        error: "Connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async disconnect(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (userId) {
        await MailService.closeConnection(userId);
      }

      res.json({
        success: true,
        message: "Disconnected successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Disconnection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getFolders(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const folders = await MailService.getImapFolders(connection.imap);

      res.json({
        success: true,
        folders,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch folders",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getEmails(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { folder = "INBOX", limit = 50 } = req.query;

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const emails = await MailService.fetchEmails(
        connection.imap,
        folder as string,
        parseInt(limit as string),
      );

      res.json({
        success: true,
        emails,
        count: emails.length,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch emails",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async sendEmail(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;
      const userEmail = req.headers["x-user-email"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { to, subject, text, html, attachments } = req.body;

      if (!to || !subject) {
        return res.status(400).json({ error: "To and subject are required" });
      }

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const mailOptions = {
        from: userEmail,
        to,
        subject,
        text,
        html,
        attachments,
      };

      const result = await connection.smtp.sendMail(mailOptions);

      res.json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async moveEmail(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { uid, fromFolder, toFolder } = req.body;

      if (!uid || !fromFolder || !toFolder) {
        return res
          .status(400)
          .json({ error: "uid, fromFolder, and toFolder are required" });
      }

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const success = await MailService.moveEmail(
        connection.imap,
        uid,
        fromFolder,
        toFolder,
      );

      res.json({
        success,
        message: success ? "Email moved successfully" : "Failed to move email",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to move email",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async copyEmail(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { uid, fromFolder, toFolder } = req.body;

      if (!uid || !fromFolder || !toFolder) {
        return res
          .status(400)
          .json({ error: "uid, fromFolder, and toFolder are required" });
      }

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const success = await MailService.copyEmail(
        connection.imap,
        uid,
        fromFolder,
        toFolder,
      );

      res.json({
        success,
        message: success ? "Email copied successfully" : "Failed to copy email",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to copy email",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async deleteEmail(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { uid, folder } = req.body;

      if (!uid || !folder) {
        return res.status(400).json({ error: "uid and folder are required" });
      }

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const success = await MailService.deleteEmail(
        connection.imap,
        uid,
        folder,
      );

      res.json({
        success,
        message: success
          ? "Email deleted successfully"
          : "Failed to delete email",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to delete email",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async markEmailAsRead(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { uid, folder } = req.body;

      if (!uid || !folder) {
        return res.status(400).json({ error: "uid and folder are required" });
      }

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const success = await MailService.markEmailAsRead(
        connection.imap,
        uid,
        folder,
      );

      res.json({
        success,
        message: success
          ? "Email marked as read"
          : "Failed to mark email as read",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to mark email as read",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async markEmailAsUnread(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { uid, folder } = req.body;

      if (!uid || !folder) {
        return res.status(400).json({ error: "uid and folder are required" });
      }

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const success = await MailService.markEmailAsUnread(
        connection.imap,
        uid,
        folder,
      );

      res.json({
        success,
        message: success
          ? "Email marked as unread"
          : "Failed to mark email as unread",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to mark email as unread",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async toggleEmailStar(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { uid, folder, isStarred } = req.body;

      if (!uid || !folder || isStarred === undefined) {
        return res
          .status(400)
          .json({ error: "uid, folder, and isStarred are required" });
      }

      const connection = MailService.getConnection(userId);
      if (!connection) {
        return res.status(400).json({ error: "No active connection" });
      }

      const success = await MailService.toggleEmailStar(
        connection.imap,
        uid,
        folder,
        isStarred,
      );

      res.json({
        success,
        message: success
          ? `Email ${isStarred ? "starred" : "unstarred"} successfully`
          : "Failed to toggle email star",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to toggle email star",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
