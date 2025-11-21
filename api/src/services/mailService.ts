import Imap from "node-imap";
import nodemailer from "nodemailer";

export interface MailConnection {
  imap: Imap;
  smtp: nodemailer.Transporter;
}

export interface MailServerConfig {
  imap: {
    host: string;
    port: number;
    tls: boolean;
    user: string;
    password: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
}

export class MailService {
  private static connections: Map<string, MailConnection> = new Map();

  static async createConnection(
    userId: string,
    config: MailServerConfig,
  ): Promise<MailConnection> {
    try {
      // IMAP connection
      const imap = new Imap({
        host: config.imap.host,
        port: config.imap.port,
        tls: config.imap.tls,
        user: config.imap.user,
        password: config.imap.password,
        tlsOptions: {
          rejectUnauthorized: false,
        },
      });

      // SMTP connection
      const smtp = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.password,
        },
      });

      // Test IMAP connection
      await new Promise<void>((resolve, reject) => {
        imap.once("ready", () => {
          resolve();
        });

        imap.once("error", (err: Error) => {
          reject(err);
        });

        imap.connect();
      });

      // Skip SMTP verification for now - focus on IMAP email access
      console.log("Skipping SMTP verification in createConnection");

      const connection: MailConnection = { imap, smtp };
      MailService.connections.set(userId, connection);

      return connection;
    } catch (error) {
      throw new Error(
        `Failed to create mail connection: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  static getConnection(userId: string): MailConnection | undefined {
    return MailService.connections.get(userId);
  }

  static async closeConnection(userId: string): Promise<void> {
    const connection = MailService.connections.get(userId);
    if (connection) {
      connection.imap.end();
      connection.smtp.close();
      MailService.connections.delete(userId);
    }
  }

  static async testImapConnection(
    config: MailServerConfig["imap"],
  ): Promise<boolean> {
    // Connexion IMAP réelle pour production
    console.log(
      `Testing IMAP connection to ${config.host}:${config.port} for user ${config.user}`,
    );

    return new Promise((resolve) => {
      const imap = new Imap({
        host: config.host,
        port: config.port,
        tls: config.tls,
        user: config.user,
        password: config.password,
        tlsOptions: {
          rejectUnauthorized: false,
          // Pour Sky Genesis Enterprise, ignorer les erreurs de certificat en développement
          servername: config.host,
        },
      });

      imap.once("ready", () => {
        console.log(`IMAP connection to ${config.host} successful`);
        imap.end();
        resolve(true);
      });

      imap.once("error", (err: Error) => {
        console.error(`IMAP connection to ${config.host} failed:`, err.message);
        resolve(false);
      });

      imap.connect();
    });
  }

  static async testSmtpConnection(
    config: MailServerConfig["smtp"],
  ): Promise<boolean> {
    // Connexion SMTP réelle pour production
    console.log(
      `Testing SMTP connection to ${config.host}:${config.port} for user ${config.user}`,
    );

    return new Promise((resolve) => {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });

      transporter.verify((error, success) => {
        if (error) {
          console.error(
            `SMTP connection to ${config.host}:${config.port} failed:`,
            error.message,
          );
          resolve(false);
        } else {
          console.log(
            `SMTP connection to ${config.host}:${config.port} successful`,
          );
          resolve(true);
        }
      });
    });
  }

  static getImapFolders(imap: Imap): Promise<string[]> {
    return new Promise((resolve, reject) => {
      imap.getBoxes((err: any, boxes: any) => {
        if (err) {
          reject(err);
          return;
        }

        const folders: string[] = [];

        const extractFolders = (boxObj: any, prefix = "") => {
          Object.keys(boxObj).forEach((name) => {
            const box = boxObj[name];
            const fullName = prefix ? `${prefix}${box.delimiter}${name}` : name;

            // Ajouter tous les dossiers, y compris ceux avec des enfants
            folders.push(fullName);

            if (box.children && Object.keys(box.children).length > 0) {
              extractFolders(box.children, fullName);
            }
          });
        };

        extractFolders(boxes);

        // Trier les dossiers par ordre alphabétique
        folders.sort((a, b) => {
          // Mettre INBOX en premier
          if (a.toUpperCase() === "INBOX") return -1;
          if (b.toUpperCase() === "INBOX") return 1;

          // Mettre les dossiers système courants en premier
          const systemFolders = [
            "INBOX",
            "Sent",
            "Drafts",
            "Trash",
            "Spam",
            "Archive",
          ];
          const aIsSystem = systemFolders.some((f) =>
            a.toUpperCase().includes(f.toUpperCase()),
          );
          const bIsSystem = systemFolders.some((f) =>
            b.toUpperCase().includes(f.toUpperCase()),
          );

          if (aIsSystem && !bIsSystem) return -1;
          if (!aIsSystem && bIsSystem) return 1;

          return a.localeCompare(b);
        });

        resolve(folders);
      });
    });
  }

  static async fetchEmails(
    imap: Imap,
    folder: string = "INBOX",
    limit: number = 50,
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      imap.openBox(folder, false, (err: any, box: any) => {
        if (err) {
          reject(err);
          return;
        }

        const emails: any[] = [];

        // Récupérer les emails les plus récents
        const startSeq = Math.max(1, box.messages.total - limit + 1);
        const fetch = imap.seq.fetch(`${startSeq}:*`, {
          bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)", "1"], // 1 = premier octet pour preview
          struct: true,
          envelope: true,
        });

        fetch.on("message", (msg: any, seqno: any) => {
          const email: any = { seqno, folder };

          msg.on("body", (stream: any, info: any) => {
            if (
              info.which === "HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)"
            ) {
              let buffer = "";
              stream.on("data", (chunk: any) => {
                buffer += chunk.toString("ascii");
              });
              stream.once("end", () => {
                email.headers = Imap.parseHeader(buffer);
              });
            } else if (info.which === "1") {
              let buffer = "";
              stream.on("data", (chunk: any) => {
                buffer += chunk.toString("ascii");
              });
              stream.once("end", () => {
                // Créer un preview simple (premiers 200 caractères)
                email.preview = buffer
                  .substring(0, 200)
                  .replace(/\s+/g, " ")
                  .trim();
                if (buffer.length > 200) email.preview += "...";
              });
            }
          });

          msg.once("attributes", (attrs: any) => {
            email.attributes = attrs;
            email.uid = attrs.uid;
            email.flags = attrs.flags || [];
            email.date = attrs.date;
            email.size = attrs.size;
          });

          msg.once("envelope", (envelope: any) => {
            email.envelope = envelope;
            // Extraire les informations de l'enveloppe
            if (envelope.from && envelope.from.length > 0) {
              email.from = envelope.from[0];
            }
            if (envelope.to && envelope.to.length > 0) {
              email.to = envelope.to;
            }
            if (envelope.subject) {
              email.subject = envelope.subject;
            }
            if (envelope.messageId) {
              email.messageId = envelope.messageId;
            }
          });

          msg.once("end", () => {
            emails.push(email);
          });
        });

        fetch.once("error", reject);
        fetch.once("end", () => {
          // Trier les emails par date (plus récents en premier)
          emails.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB.getTime() - dateA.getTime();
          });
          resolve(emails);
        });
      });
    });
  }

  static async moveEmail(
    imap: Imap,
    uid: number,
    fromFolder: string,
    toFolder: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Ouvrir le dossier source
      imap.openBox(fromFolder, false, (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Déplacer l'email
        imap.move(uid, toFolder, (err: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      });
    });
  }

  static async copyEmail(
    imap: Imap,
    uid: number,
    fromFolder: string,
    toFolder: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Ouvrir le dossier source
      imap.openBox(fromFolder, false, (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Copier l'email
        imap.copy(uid, toFolder, (err: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      });
    });
  }

  static async deleteEmail(
    imap: Imap,
    uid: number,
    folder: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Ouvrir le dossier
      imap.openBox(folder, false, (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Marquer l'email pour suppression
        imap.addFlags(uid, ["\\Deleted"], (err: any) => {
          if (err) {
            reject(err);
            return;
          }

          // Exécuter l'expunge (suppression permanente)
          imap.expunge((err: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(true);
          });
        });
      });
    });
  }

  static async markEmailAsRead(
    imap: Imap,
    uid: number,
    folder: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Ouvrir le dossier
      imap.openBox(folder, false, (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Marquer comme lu
        imap.addFlags(uid, ["\\Seen"], (err: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      });
    });
  }

  static async markEmailAsUnread(
    imap: Imap,
    uid: number,
    folder: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Ouvrir le dossier
      imap.openBox(folder, false, (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Retirer le flag \\Seen
        imap.delFlags(uid, ["\\Seen"], (err: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      });
    });
  }

  static async toggleEmailStar(
    imap: Imap,
    uid: number,
    folder: string,
    isStarred: boolean,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Ouvrir le dossier
      imap.openBox(folder, false, (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (isStarred) {
          // Ajouter le flag \\Flagged
          imap.addFlags(uid, ["\\Flagged"], (err: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(true);
          });
        } else {
          // Retirer le flag \\Flagged
          imap.delFlags(uid, ["\\Flagged"], (err: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(true);
          });
        }
      });
    });
  }
}
