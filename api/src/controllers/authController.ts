import type { Request, Response } from "express";
import { MailService } from "../services/mailService.js";
import { MailConfigService } from "../services/mailConfigService.js";

export class AuthController {
  static async authenticateMail(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Obtenir la configuration du serveur depuis les variables d'environnement
      const serverConfig = MailConfigService.getServerConfig(email);

      if (!serverConfig) {
        return res.status(400).json({
          success: false,
          error: "No mail server configuration found for this domain",
        });
      }

      // Ajouter les identifiants à la configuration
      const fullConfig = {
        imap: {
          ...serverConfig.imap,
          user: email,
          password,
        },
        smtp: {
          ...serverConfig.smtp,
          user: email,
          password,
        },
      };

      // Tester la connexion IMAP
      const imapConnected = await MailService.testImapConnection(
        fullConfig.imap,
      );

      if (!imapConnected) {
        return res.status(401).json({
          success: false,
          error: "IMAP authentication failed. Check your credentials.",
        });
      }

      // Skip SMTP test for now to focus on IMAP email fetching
      console.log("Skipping SMTP test - focusing on IMAP email access");
      const smtpConnected = true; // Temporarily skip SMTP test

      // Créer une session utilisateur
      const userId = Buffer.from(email).toString("base64").replace(/=/g, "");

      // Connecter aux serveurs mail
      const connection = await MailService.createConnection(userId, fullConfig);

      res.json({
        success: true,
        message: "Mail authentication successful",
        data: {
          userId,
          email,
          serverInfo: {
            imap: {
              host: serverConfig.imap.host,
              port: serverConfig.imap.port,
              tls: serverConfig.imap.tls,
            },
            smtp: {
              host: serverConfig.smtp.host,
              port: serverConfig.smtp.port,
              secure: serverConfig.smtp.secure,
            },
          },
        },
      });
    } catch (error) {
      console.error("Mail authentication error:", error);
      res.status(500).json({
        success: false,
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getSupportedProviders(req: Request, res: Response) {
    try {
      const providers = MailConfigService.getSupportedProviders();

      res.json({
        success: true,
        data: providers.map((provider) => ({
          name: provider.name,
          domain: provider.domain,
          imap: {
            host: provider.config.imap.host,
            port: provider.config.imap.port,
            tls: provider.config.imap.tls,
          },
          smtp: {
            host: provider.config.smtp.host,
            port: provider.config.smtp.port,
            secure: provider.config.smtp.secure,
          },
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to get providers",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.headers["x-user-id"] as string;

      if (userId) {
        await MailService.closeConnection(userId);
      }

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Logout failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
