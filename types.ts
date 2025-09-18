
export interface Email {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  read: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
}