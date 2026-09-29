'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton } from '@/components/Loading';
import { Users, Plus, Search, Filter, Trash2, Edit3, MessageSquare, Mail, Phone, Tag } from 'lucide-react';
import { getContacts, createContact, updateContact, deleteContact } from '@/lib/api';
import { Contact, CreateContactPayload } from '@/types/contact';
import { formatDate } from '@/lib/utils';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPlatform, setContactPlatform] = useState('Instagram');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const data = await getContacts(search, platform);
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, platform]);

  const resetForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setContactPlatform('Instagram');
    setTags('');
    setEditingId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Contact) => {
    setEditingId(c.id);
    setName(c.name);
    setUsername(c.username || '');
    setEmail(c.email || '');
    setPhone(c.phone || '');
    setContactPlatform(c.platform);
    setTags(c.tags || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSaving(true);
    try {
      const payload: CreateContactPayload = {
        name,
        username,
        email,
        phone,
        platform: contactPlatform,
        tags,
      };

      if (editingId) {
        await updateContact(editingId, payload);
      } else {
        await createContact(payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchContacts();
    } catch (err) {
      console.error('Failed to save contact:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        fetchContacts();
      } catch (err) {
        console.error('Failed to delete contact:', err);
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Contact Directory <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{contacts.length}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Manage leads, customers, and cross-platform contacts.</p>
          </div>

          <Button onClick={handleOpenCreateModal} icon={<Plus className="w-4 h-4" />}>
            Add Contact
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          <select
            className="w-full sm:w-48 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none shadow-sm"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>

        {/* Contacts Data Grid / Table */}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No contacts found"
            description="Add your first contact or clear filters to view existing directory records."
            actionText="Add Contact"
            onAction={handleOpenCreateModal}
          />
        ) : (
          <Table headers={['Contact Info', 'Platform', 'Tags', 'Last Interaction', 'Actions']}>
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                      {c.name ? c.name.substring(0, 2).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{c.username || c.email || 'No handle'}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c.platform}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {c.tags ? (
                    <div className="flex flex-wrap gap-1">
                      {c.tags.split(',').map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </td>

                <td className="px-6 py-4 text-xs text-slate-500">
                  {formatDate(c.last_interaction)}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push('/inbox')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Start Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit Contact"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {/* Modal for Add / Edit Contact */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Contact' : 'Add New Contact'}
          description="Store details for your lead or social media contact."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Social Username / Handle"
              placeholder="e.g. @rahul_tech"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Platform</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                value={contactPlatform}
                onChange={(e) => setContactPlatform(e.target.value)}
              >
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            <Input
              label="Tags (Comma separated)"
              placeholder="e.g. VIP, High Intent, Lead"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              icon={<Tag className="w-4 h-4" />}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {editingId ? 'Save Changes' : 'Add Contact'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
