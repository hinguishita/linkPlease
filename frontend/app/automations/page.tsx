'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { EmptyState } from '@/components/EmptyState';
import { TableSkeleton } from '@/components/Loading';
import { Bot, Plus, Play, Pause, Trash2, Edit3, Copy, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { getAutomations, createAutomation, updateAutomation, toggleAutomationStatus, deleteAutomation } from '@/lib/api';
import { Automation, CreateAutomationPayload } from '@/types/automation';
import { cn, formatDate } from '@/lib/utils';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('keyword_match');
  const [condition, setCondition] = useState('contains "price"');
  const [actionType, setActionType] = useState('send_reply');
  const [actionValue, setActionValue] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'draft'>('active');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAutomations = async () => {
    setIsLoading(true);
    try {
      const data = await getAutomations();
      setAutomations(data);
    } catch (err) {
      console.error('Failed to load automations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTriggerType('keyword_match');
    setCondition('contains "price"');
    setActionType('send_reply');
    setActionValue('');
    setStatus('active');
    setEditingId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (auto: Automation) => {
    setEditingId(auto.id);
    setName(auto.name);
    setDescription(auto.description || '');
    setTriggerType(auto.trigger_type);
    setCondition(auto.condition || '');
    setActionType(auto.action_type);
    setActionValue(auto.action_value || '');
    setStatus(auto.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !triggerType || !actionType) return;

    setIsSaving(true);
    try {
      const payload: CreateAutomationPayload = {
        name,
        description,
        trigger_type: triggerType,
        condition,
        action_type: actionType,
        action_value: actionValue,
        status,
      };

      if (editingId) {
        await updateAutomation(editingId, payload);
      } else {
        await createAutomation(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchAutomations();
    } catch (err) {
      console.error('Failed to save automation:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (auto: Automation) => {
    const nextStatus = auto.status === 'active' ? 'paused' : 'active';
    try {
      await toggleAutomationStatus(auto.id, nextStatus);
      fetchAutomations();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      try {
        await deleteAutomation(id);
        fetchAutomations();
      } catch (err) {
        console.error('Failed to delete automation:', err);
      }
    }
  };

  const handleDuplicate = async (auto: Automation) => {
    try {
      await createAutomation({
        name: `${auto.name} (Copy)`,
        description: auto.description,
        trigger_type: auto.trigger_type,
        condition: auto.condition,
        action_type: auto.action_type,
        action_value: auto.action_value,
        status: 'draft',
      });
      fetchAutomations();
    } catch (err) {
      console.error('Failed to duplicate automation:', err);
    }
  };

  const filteredAutomations = automations.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Automations <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{automations.length}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Configure auto-responders, trigger rules, and message workflows.</p>
          </div>

          <Button onClick={handleOpenCreateModal} icon={<Plus className="w-4 h-4" />}>
            Create Automation
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
          {(['all', 'active', 'paused', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all',
                filter === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : filteredAutomations.length === 0 ? (
          <EmptyState
            icon={<Bot className="w-8 h-8" />}
            title="No automations yet"
            description="Create your first automation to start automatically responding to incoming customer messages."
            actionText="Create Automation"
            onAction={handleOpenCreateModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAutomations.map((auto) => (
              <div
                key={auto.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold',
                          auto.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : auto.status === 'paused'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-base">{auto.name}</h3>
                        <span
                          className={cn(
                            'inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            auto.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : auto.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          )}
                        >
                          {auto.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleStatus(auto)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title={auto.status === 'active' ? 'Pause Automation' : 'Activate Automation'}
                      >
                        {auto.status === 'active' ? <Pause className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => handleDuplicate(auto)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(auto)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(auto.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {auto.description && (
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">{auto.description}</p>
                  )}

                  {/* Rules Summary */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-400">Trigger:</span>
                      <span className="font-semibold text-slate-800">{auto.trigger_type}</span>
                    </div>
                    {auto.condition && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-400">Condition:</span>
                        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px] text-slate-700">
                          {auto.condition}
                        </span>
                      </div>
                    )}
                    {auto.action_value && (
                      <div className="pt-1 border-t border-slate-200/60">
                        <span className="font-medium text-slate-400 block mb-0.5">Response Payload:</span>
                        <p className="text-slate-700 font-sans italic bg-white p-2 rounded border border-slate-200 text-[11px] truncate">
                          "{auto.action_value}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Executions: <strong className="text-slate-700 font-semibold">{auto.execution_count.toLocaleString()}</strong></span>
                  <span>Updated {formatDate(auto.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Edit Automation' : 'Create New Automation'}
          description="Configure your trigger conditions and automated response workflow."
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Automation Name"
              placeholder="e.g. Price Inquiry Auto-Responder"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={2}
                placeholder="Briefly describe what this rule automates..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trigger Event</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                >
                  <option value="keyword_match">Keyword Match</option>
                  <option value="new_message">New Incoming Message</option>
                  <option value="new_follower">New Follower / Contact</option>
                  <option value="after_hours">After Hours Trigger</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Action Type</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                >
                  <option value="send_reply">Send Automated Reply</option>
                  <option value="add_tag">Add Tag to Contact</option>
                  <option value="notify_email">Notify Team via Email</option>
                </select>
              </div>
            </div>

            <Input
              label="Condition"
              placeholder='e.g. contains "price"'
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              helperText="Condition checked against incoming message content."
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Response / Action Value</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={3}
                placeholder="Enter the response message sent to the contact..."
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Initial Status</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {editingId ? 'Save Changes' : 'Create Automation'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
