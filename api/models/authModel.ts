export interface ImapConfig {
  host: string;
  port: number;
  tls: boolean;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
}

export interface User {
  username: string;
  email: string;
  password?: string;
  imap?: ImapConfig;
  smtp?: SmtpConfig;
}

export interface ExternalAuthResponse {
  token: string;
  username: string;
  email: string;
  password?: string;
  imap?: ImapConfig;
  smtp?: SmtpConfig;
}