import axios from 'axios';
import { getStoredToken } from './auth';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth';
import { Automation, CreateAutomationPayload, UpdateAutomationPayload } from '@/types/automation';
import { Contact, CreateContactPayload, UpdateContactPayload } from '@/types/contact';
import { Conversation, Message, CreateMessagePayload } from '@/types/inbox';
import { AnalyticsData } from '@/types/analytics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't auto-redirect if on login or signup
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', payload);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/register', payload);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/api/auth/me');
  return response.data;
}

export async function updateCurrentUser(data: Partial<User & { password?: string }>): Promise<User> {
  const response = await api.put<User>('/api/users/me', data);
  return response.data;
}

// --- Automations APIs ---
export async function getAutomations(): Promise<Automation[]> {
  const response = await api.get<Automation[]>('/api/automations');
  return response.data;
}

export async function createAutomation(payload: CreateAutomationPayload): Promise<Automation> {
  const response = await api.post<Automation>('/api/automations', payload);
  return response.data;
}

export async function updateAutomation(id: number, payload: UpdateAutomationPayload): Promise<Automation> {
  const response = await api.put<Automation>(`/api/automations/${id}`, payload);
  return response.data;
}

export async function toggleAutomationStatus(id: number, status: 'active' | 'paused' | 'draft'): Promise<Automation> {
  const response = await api.patch<Automation>(`/api/automations/${id}/status`, { status });
  return response.data;
}

export async function deleteAutomation(id: number): Promise<void> {
  await api.delete(`/api/automations/${id}`);
}

// --- Contacts APIs ---
export async function getContacts(search?: string, platform?: string): Promise<Contact[]> {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (platform) params.platform = platform;
  const response = await api.get<Contact[]>('/api/contacts', { params });
  return response.data;
}

export async function createContact(payload: CreateContactPayload): Promise<Contact> {
  const response = await api.post<Contact>('/api/contacts', payload);
  return response.data;
}

export async function updateContact(id: number, payload: UpdateContactPayload): Promise<Contact> {
  const response = await api.put<Contact>(`/api/contacts/${id}`, payload);
  return response.data;
}

export async function deleteContact(id: number): Promise<void> {
  await api.delete(`/api/contacts/${id}`);
}

// --- Inbox APIs ---
export async function getConversations(search?: string, status?: string): Promise<Conversation[]> {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (status) params.status = status;
  const response = await api.get<Conversation[]>('/api/inbox/conversations', { params });
  return response.data;
}

export async function getConversation(id: number): Promise<Conversation> {
  const response = await api.get<Conversation>(`/api/inbox/conversations/${id}`);
  return response.data;
}

export async function sendMessage(conversationId: number, payload: CreateMessagePayload): Promise<Message> {
  const response = await api.post<Message>(`/api/inbox/conversations/${conversationId}/messages`, payload);
  return response.data;
}

export async function updateConversationStatus(id: number, status: 'open' | 'pending' | 'closed'): Promise<Conversation> {
  const response = await api.patch<Conversation>(`/api/inbox/conversations/${id}/status`, { status });
  return response.data;
}

// --- Analytics APIs ---
export async function getAnalyticsOverview(): Promise<AnalyticsData> {
  const response = await api.get<AnalyticsData>('/api/analytics/overview');
  return response.data;
}

export default api;
