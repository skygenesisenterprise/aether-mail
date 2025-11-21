export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  content?: string;
}

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  preview: string;
  date: string;
  originalDate?: string; // Date ISO originale pour un tri précis
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  folder: string;
  attachments?: Attachment[];
}
