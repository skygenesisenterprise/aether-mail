export interface Email {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  cc?: {
    name: string;
    email: string;
  }[];
  bcc?: {
    name: string;
    email: string;
  }[];
  date: string;
  preview: string;
  body: string;
  isRead: boolean;
  isFlagged: boolean;
  isDraft: boolean;
  attachments?: Attachment[];
  folderId?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  inline: boolean;
}

export interface EmailListResponse {
  success: boolean;
  data?: {
    emails: Email[];
    total: number;
    offset: number;
    limit: number;
  };
  error?: string;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  totalEmails: number;
  unreadEmails: number;
  isSelectable: boolean;
  subscribed: boolean;
}

export interface FolderListResponse {
  success: boolean;
  data?: {
    folders: Folder[];
  };
  error?: string;
}
