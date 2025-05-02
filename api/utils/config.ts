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
  imapHost: string;
  imapPort: number;
}

// Fonction pour charger la configuration à partir des variables d'environnement
const config: Config = {
  nodeEnv: process.env.NODE_ENV || '',  // Défaut à 'production'
  port: Number.parseInt(process.env.PORT || '', 10),  // Défaut à 4000
  jwtSecret: process.env.JWT_SECRET || '',  // Aucune valeur par défaut pour JWT secret
  skygenesisAuthUrl: process.env.SKYG_AUTH_URL || '',  // URL de l'authentification de SkyGenesis
  smtpHost: process.env.SMTP_HOST || '',  // Serveur SMTP
  smtpPort: Number.parseInt(process.env.SMTP_PORT || '', 10),  // Port SMTP
  imapHost: process.env.IMAP_HOST || '',  // Serveur IMAP
  imapPort: Number.parseInt(process.env.IMAP_PORT || '', 10),  // Port IMAP
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
