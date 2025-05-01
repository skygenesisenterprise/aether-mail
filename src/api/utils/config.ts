import dotenv from 'dotenv';
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

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'production',
  port: Number.parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
  skygenesisAuthUrl: process.env.SKYG_AUTH_URL || 'https://secure.skygenesisenterprise.com/auth/login',
  smtpHost: process.env.SMTP_HOST || 'radis.o2switch.net',
  smtpPort: Number.parseInt(process.env.SMTP_PORT || '465', 10),
  imapHost: process.env.IMAP_HOST || 'radis.o2switch.net',
  imapPort: Number.parseInt(process.env.IMAP_PORT || '993', 10),
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
