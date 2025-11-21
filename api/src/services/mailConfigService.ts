import type { MailServerConfig } from "./mailService.js";

export class MailConfigService {
  static getServerConfig(email: string): MailServerConfig | null {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return null;

    // Convertir le domaine en format de variable d'environnement
    const domainVar = domain.replace(/\./g, "_").toUpperCase();

    // Vérifier la configuration spécifique au domaine
    const domainConfig = MailConfigService.getDomainConfig(domainVar);
    if (domainConfig) {
      return domainConfig;
    }

    // Vérifier les domaines Sky Genesis Enterprise
    if (
      domain.includes("skygenesisenterprise.com") ||
      domain.includes("radis.o2switch.net")
    ) {
      return {
        imap: {
          host:
            process.env.SKYGENESISENTERPRISE_COM_IMAP_HOST ||
            "radis.o2switch.net",
          port: parseInt(
            process.env.SKYGENESISENTERPRISE_COM_IMAP_PORT || "993",
          ),
          tls: process.env.SKYGENESISENTERPRISE_COM_IMAP_TLS === "true",
          user: email,
          password: "", // Sera rempli plus tard
        },
        smtp: {
          host:
            process.env.SKYGENESISENTERPRISE_COM_SMTP_HOST ||
            "radis.o2switch.net",
          port: parseInt(
            process.env.SKYGENESISENTERPRISE_COM_SMTP_PORT || "465",
          ),
          secure: process.env.SKYGENESISENTERPRISE_COM_SMTP_SECURE !== "false",
          user: email,
          password: "", // Sera rempli plus tard
        },
      };
    }

    // Vérifier la configuration par défaut
    const defaultConfig = MailConfigService.getDefaultConfig();
    if (defaultConfig) {
      return defaultConfig;
    }

    // Configuration générique basée sur le domaine
    return {
      imap: {
        host: `imap.${domain}`,
        port: 993,
        tls: true,
        user: email,
        password: "", // Sera rempli plus tard
      },
      smtp: {
        host: `smtp.${domain}`,
        port: 465,
        secure: true,
        user: email,
        password: "", // Sera rempli plus tard
      },
    };
  }

  private static getDomainConfig(domainVar: string): MailServerConfig | null {
    const imapHost = process.env[`${domainVar}_IMAP_HOST`];
    const imapPort = process.env[`${domainVar}_IMAP_PORT`];
    const imapTls = process.env[`${domainVar}_IMAP_TLS`];
    const smtpHost = process.env[`${domainVar}_SMTP_HOST`];
    const smtpPort = process.env[`${domainVar}_SMTP_PORT`];
    const smtpSecure = process.env[`${domainVar}_SMTP_SECURE`];

    if (!imapHost || !smtpHost) return null;

    return {
      imap: {
        host: imapHost,
        port: parseInt(imapPort || "993"),
        tls: imapTls === "true",
        user: "", // Sera rempli plus tard
        password: "", // Sera rempli plus tard
      },
      smtp: {
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpSecure === "true",
        user: "", // Sera rempli plus tard
        password: "", // Sera rempli plus tard
      },
    };
  }

  private static getDefaultConfig(): MailServerConfig | null {
    const imapHost = process.env.DEFAULT_IMAP_HOST;
    const imapPort = process.env.DEFAULT_IMAP_PORT;
    const imapTls = process.env.DEFAULT_IMAP_TLS;
    const smtpHost = process.env.DEFAULT_SMTP_HOST;
    const smtpPort = process.env.DEFAULT_SMTP_PORT;
    const smtpSecure = process.env.DEFAULT_SMTP_SECURE;

    if (!imapHost || !smtpHost) return null;

    return {
      imap: {
        host: imapHost,
        port: parseInt(imapPort || "993"),
        tls: imapTls === "true",
        user: "", // Sera rempli plus tard
        password: "", // Sera rempli plus tard
      },
      smtp: {
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpSecure === "true",
        user: "", // Sera rempli plus tard
        password: "", // Sera rempli plus tard
      },
    };
  }

  static getSupportedProviders(): Array<{
    name: string;
    domain: string;
    config: MailServerConfig;
  }> {
    const providers: Array<{
      name: string;
      domain: string;
      config: MailServerConfig;
    }> = [];

    // Ajouter les fournisseurs configurés via variables d'environnement
    Object.keys(process.env).forEach((key) => {
      if (key.endsWith("_IMAP_HOST")) {
        const domain = key
          .replace("_IMAP_HOST", "")
          .toLowerCase()
          .replace(/_/g, ".");
        const config = MailConfigService.getDomainConfig(
          key.replace("_IMAP_HOST", ""),
        );
        if (config) {
          providers.push({
            name: domain,
            domain,
            config,
          });
        }
      }
    });

    return providers;
  }
}
