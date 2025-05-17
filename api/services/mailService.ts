import Imap from 'imap';
import { simpleParser } from 'mailparser';

interface ImapConfig {
  username: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

export async function sendMailForUser(userId: string, to: string, subject: string, body: string) {
  return { success: true, to, subject, body };
}

export async function getInboxForUser(userId: string) {
  return [{ id: 1, from: 'alice@example.com', subject: 'Hi', read: false }];
}

export async function deleteMailForUser(userId: string, emailId: string) {
  return { success: true, emailId };
}

export async function fetchInboxMails(config: ImapConfig): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: config.username,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
    });

    function openInbox(cb: any) {
      imap.openBox('INBOX', true, cb);
    }

    imap.once('ready', function () {
      openInbox(function (err: any, box: any) {
        if (err) return reject(err);
        const fetchRange = box.messages.total > 20 ? `${box.messages.total - 19}:*` : '1:*';
        const f = imap.seq.fetch(fetchRange, { bodies: '' });
        const mails: any[] = [];
        f.on('message', function (msg: any) {
          let mailBuffer = '';
          msg.on('body', function (stream: any) {
            stream.on('data', function (chunk: any) {
              mailBuffer += chunk.toString('utf8');
            });
          });
          msg.once('end', async function () {
            try {
              const parsed = await simpleParser(mailBuffer);
              mails.push({
                subject: parsed.subject,
                from: parsed.from?.text,
                date: parsed.date,
                text: parsed.text,
                html: parsed.html,
              });
            } catch (e) {
              // ignore parse errors for individual mails
            }
          });
        });
        f.once('end', function () {
          imap.end();
          resolve(mails.reverse());
        });
      });
    });

    imap.once('error', function (err: any) {
      reject(err);
    });

    imap.connect();
  });
}
