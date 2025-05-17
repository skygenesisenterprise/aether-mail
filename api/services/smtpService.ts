import nodemailer from 'nodemailer';

// In real implementation, this manages SMTP connection and email sending
export function noop() { return null; }

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export async function sendMail(
  config: SmtpConfig,
  from: string,
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  const transporter = nodemailer.createTransport(config);

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return info;
}
