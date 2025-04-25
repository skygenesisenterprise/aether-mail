import dotenv from 'dotenv';
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  jwtSecret: string;
  skygenesisAuthUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  imapHost: string;
  imapPort: number;
  imapUser: string;
  imapPass: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
  skygenesisAuthUrl: process.env.SKYG_AUTH_URL || 'https://secure.skygenesisenterprise.com/auth/login',
  smtpHost: process.env.SMTP_HOST || 'radis.o2switch.net',
  smtpPort: Number.parseInt(process.env.SMTP_PORT || '465', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  imapHost: process.env.IMAP_HOST || 'radis.o2switch.net',
  imapPort: Number.parseInt(process.env.IMAP_PORT || '993', 10),
  imapUser: process.env.IMAP_USER || '',
  imapPass: process.env.IMAP_PASS || '',
};

export default config;
