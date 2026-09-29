'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/Loading';
import { Search, Send, MessageSquare, CheckCircle, Clock, Archive, User as UserIcon, Bot, Tag, Filter } from 'lucide-react';
import { getConversations, getConversation, sendMessage, updateConversationStatus } from '@/lib/api';
import { Conversation, Message } from '@/types/inbox';
import { cn, formatDate } from '@/lib/utils';

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchConversations = async () => {
    try {
      const data = await getConversations(search, statusFilter);
      setConversations(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [search, statusFilter]);

  const loadActiveThread = async (id: number) => {
    try {
      const conv = await getConversation(id);
      setSelectedConversation(conv);
    } catch (err) {
      console.error('Failed to load conversation thread:', err);
    }
  };

  useEffect(() => {
    if (selectedId) {
      loadActiveThread(selectedId);
    }
  }, [selectedId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedId) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      await sendMessage(selectedId, { content: textToSend, sender_type: 'user' });
      await loadActiveThread(selectedId);
      await fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: 'open' | 'pending' | 'closed') => {
    if (!selectedId) return;
    try {
      await updateConversationStatus(selectedId, newStatus);
      await loadActiveThread(selectedId);
      await fetchConversations();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto flex flex-col md:flex-row bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Left Conversations Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
              Inbox
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                {conversations.length} Threads
              </span>
            </h2>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1">
              {(['all', 'open', 'pending', 'closed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all',
                    statusFilter === tab
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-200/60'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <LoadingSpinner />
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No conversations found.</div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'p-4 flex items-start gap-3 cursor-pointer transition-colors',
                      isSelected ? 'bg-white border-l-4 border-emerald-600 shadow-sm' : 'hover:bg-slate-100/70'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                      {conv.contact?.name ? conv.contact.name.substring(0, 2).toUpperCase() : 'C'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {conv.contact?.name || 'Contact'}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDate(conv.last_message_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.last_message || 'No messages yet'}
                      </p>

                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                            conv.status === 'open'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : conv.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          )}
                        >
                          {conv.status}
                        </span>
                        {conv.contact?.platform && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {conv.contact.platform}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Conversation View */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border border-emerald-500 shadow-sm">
                    {selectedConversation.contact?.name
                      ? selectedConversation.contact.name.substring(0, 2).toUpperCase()
                      : 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedConversation.contact?.name || 'Contact Thread'}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{selectedConversation.contact?.username || selectedConversation.contact?.email}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">
                        Platform: {selectedConversation.contact?.platform || 'Instagram'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thread Actions */}
                <div className="flex items-center space-x-2">
                  <select
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
                    value={selectedConversation.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Message History Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                {selectedConversation.messages.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">No messages in this thread yet.</p>
                ) : (
                  selectedConversation.messages.map((msg) => {
                    const isUser = msg.sender_type === 'user';
                    const isSystem = msg.sender_type === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
                            <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{msg.content}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={cn('flex items-end gap-2.5', isUser ? 'justify-end' : 'justify-start')}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {selectedConversation.contact?.name
                              ? selectedConversation.contact.name.substring(0, 2).toUpperCase()
                              : 'C'}
                          </div>
                        )}

                        <div className="max-w-md space-y-1">
                          <div
                            className={cn(
                              'p-3.5 rounded-2xl text-xs shadow-sm leading-relaxed',
                              isUser
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            )}
                          >
                            {msg.content}
                          </div>
                          <span
                            className={cn(
                              'block text-[10px] text-slate-400 px-1',
                              isUser ? 'text-right' : 'text-left'
                            )}
                          >
                            {formatDate(msg.created_at)}
                          </span>
                        </div>

                        {isUser && (
                          <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            YOU
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <Button type="submit" isLoading={isSending} icon={<Send className="w-4 h-4" />}>
                    Send
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-700">Select a conversation</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Choose a contact thread from the list on the left to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
