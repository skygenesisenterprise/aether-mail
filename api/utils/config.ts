import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  jwtSecret: string;
  skygenesisAuthUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  imapHost: string;
  imapPort: number;
  imapTls: boolean;
  cpanelUser: string;
  cpanelToken: string;
  cpanelDomain: string;
  cpanelHost: string;
}

// Fonction pour charger la configuration à partir des variables d'environnement
const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'production',  // Défaut à 'production'
  port: Number(process.env.PORT) || 4000,  // Défaut à 4000
  jwtSecret: process.env.JWT_SECRET || 'changeme',  // Aucune valeur par défaut pour JWT secret
  skygenesisAuthUrl: process.env.SKYG_AUTH_URL || '',  // URL de l'authentification de SkyGenesis
  smtpHost: process.env.SMTP_HOST || '',  // Serveur SMTP
  smtpPort: Number(process.env.SMTP_PORT) || 465,  // Port SMTP
  smtpSecure: process.env.SMTP_SECURE === 'false' ? false : true,  // Sécurité SMTP
  imapHost: process.env.IMAP_HOST || '',  // Serveur IMAP
  imapPort: Number(process.env.IMAP_PORT) || 993,  // Port IMAP
  imapTls: process.env.IMAP_TLS === 'false' ? false : true,  // TLS IMAP
  cpanelUser: process.env.CPANEL_USER || '',  // Utilisateur cPanel
  cpanelToken: process.env.CPANEL_TOKEN || '',  // Token cPanel
  cpanelDomain: process.env.CPANEL_DOMAIN || '',  // Domaine cPanel
  cpanelHost: process.env.CPANEL_HOST || '',  // Hôte cPanel
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
