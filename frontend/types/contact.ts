export interface Contact {
  id: number;
  user_id: number;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  platform: string;
  avatar?: string;
  tags?: string;
  last_interaction?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactPayload {
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  platform?: string;
  avatar?: string;
  tags?: string;
}

export interface UpdateContactPayload {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  platform?: string;
  avatar?: string;
  tags?: string;
}
