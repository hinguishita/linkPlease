import { Contact } from './contact';

export type ConversationStatus = "open" | "pending" | "closed";
export type SenderType = "user" | "contact" | "system";

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: SenderType;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  contact_id: number;
  status: ConversationStatus;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  messages: Message[];
  unread_count?: number;
}

export interface CreateMessagePayload {
  content: string;
  sender_type?: SenderType;
}
