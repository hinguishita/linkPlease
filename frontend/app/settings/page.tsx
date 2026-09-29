'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { User as UserIcon, Mail, Lock, Key, Globe, ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';
import { getStoredUser, setStoredUser } from '@/lib/auth';
import { updateCurrentUser } from '@/lib/api';
import { User } from '@/types/auth';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Social integrations toggle states
  const [integrations, setIntegrations] = useState({
    instagram: true,
    twitter: true,
    linkedin: false,
    whatsapp: true,
  });

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setUser(u);
      setName(u.name);
      setEmail(u.email);
      setAvatar(u.avatar || '');
    }
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const payload: any = { name, email, avatar };
      if (password) payload.password = password;

      const updated = await updateCurrentUser(payload);
      setUser(updated);
      setStoredUser(updated);
      setMessage('Profile settings saved successfully!');
      setPassword('');
    } catch (err: any) {
      setMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('lp_live_9f8a3b7c2d1e405a6b7c8d9e0f1a2b3c');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Account & System Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Manage your account profile, social channels, and developer webhooks.</p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {message}
          </div>
        )}

        {/* Section 1: Profile Information */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-600" /> Personal Profile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Update your display name and login credentials.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label="Avatar Image URL"
              placeholder="https://images.unsplash.com/..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              helperText="URL to profile picture displayed across dashboard."
            />

            <Input
              label="New Password (Leave blank to keep current)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={isSaving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Section 2: Channel Integrations */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" /> Connected Social Channels
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage channel webhooks and automated messaging endpoints.</p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'instagram', name: 'Instagram Direct', desc: 'Auto-reply to direct messages and post comments.', connected: integrations.instagram },
              { id: 'twitter', name: 'Twitter / X DM', desc: 'Sync mentions and private messages in real-time.', connected: integrations.twitter },
              { id: 'linkedin', name: 'LinkedIn Messages', desc: 'B2B lead generation auto-responses.', connected: integrations.linkedin },
              { id: 'whatsapp', name: 'WhatsApp Business API', desc: 'Send transactional alerts and automated customer support.', connected: integrations.whatsapp },
            ].map((channel) => (
              <div key={channel.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{channel.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{channel.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIntegrations((prev) => ({ ...prev, [channel.id]: !prev[channel.id as keyof typeof prev] }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    channel.connected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-600 border border-slate-300'
                  }`}
                >
                  {channel.connected ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: API & Webhooks */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" /> Developer API & Webhooks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Access tokens for custom system integrations.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Live Secret API Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="lp_live_9f8a3b7c2d1e405a6b7c8d9e0f1a2b3c"
                  className="flex-1 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-700 select-all"
                />
                <Button type="button" variant="outline" onClick={handleCopyApiKey} icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Incoming Webhook Payload URL</label>
              <input
                type="text"
                readOnly
                value="http://localhost:8000/api/inbox/webhook"
                className="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-700"
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
