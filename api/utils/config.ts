import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  jwtSecret: string;
  ssoService: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  imapHost: string;
  imapPort: number;
  imapTls: boolean;
  mailUser: string;
  mailToken: string;
  mailDomain: string;
  mailHost: string;
}

// Fonction pour charger la configuration à partir des variables d'environnement
const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'production',  // Défaut à 'production'
  port: Number(process.env.PORT) || 4000,  // Défaut à 4000
  jwtSecret: process.env.JWT_SECRET || 'changeme',  // Aucune valeur par défaut pour JWT secret
  ssoService: process.env.SSO_SERVICE || '',  // URL de l'authentification de Sky Genesis Enterprise
  smtpHost: process.env.SMTP_HOST || '',  // Serveur SMTP
  smtpPort: Number(process.env.SMTP_PORT) || 465,  // Port SMTP
  smtpSecure: process.env.SMTP_SECURE === 'false' ? false : true,  // Sécurité SMTP
  imapHost: process.env.IMAP_HOST || '',  // Serveur IMAP
  imapPort: Number(process.env.IMAP_PORT) || 993,  // Port IMAP
  imapTls: process.env.IMAP_TLS === 'false' ? false : true,  // TLS IMAP
  mailUser: process.env.MAIL_USER || '',  // Mail User Service
  mailToken: process.env.MAIL_TOKEN || '',  // Token Mail Server
  mailDomain: process.env.MAIL_DOMAIN || '',  // Mail Domain Service
  mailHost: process.env.MAIL_HOST || '',  // Mail Host Service
};

// Fonction générique pour générer les identifiants SMTP/IMAP
export function generateUserCredentials({
  username,
  domain,
  password,
}: {
  username: string;
  domain: string;
  password: string;
}) {
  return {
    smtpUser: `${username}@${domain}`,
    smtpPass: password,
    imapUser: `${username}@${domain}`,
    imapPass: password,
  };
}

export default config;
