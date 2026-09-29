'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { Chart } from '@/components/Chart';
import { LoadingSpinner, CardSkeleton } from '@/components/Loading';
import { Users, Bot, MessageSquare, MessagesSquare, ArrowRight, Zap, Clock } from 'lucide-react';
import { getAnalyticsOverview, getConversations } from '@/lib/api';
import { AnalyticsData } from '@/types/analytics';
import { Conversation } from '@/types/inbox';
import { getStoredUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, convsRes] = await Promise.all([
          getAnalyticsOverview(),
          getConversations(),
        ]);
        setData(overviewRes);
        setRecentConversations(convsRes.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5" /> Live Account Overview
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {user?.name || 'Alex'} 👋
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Here's what's happening with your messaging automations and customer contacts today.
            </p>
          </div>

          <div className="mt-6 sm:mt-0 flex gap-3">
            <Link
              href="/automations"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" /> Manage Automations
            </Link>
            <Link
              href="/inbox"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> Open Inbox
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title={data?.overview.total_contacts.title || 'Total Contacts'}
              value={data?.overview.total_contacts.value || '2,486'}
              icon={<Users className="w-5 h-5 text-emerald-600" />}
              change={data?.overview.total_contacts.change || '+12.5%'}
              isPositive={data?.overview.total_contacts.is_positive ?? true}
              comparison={data?.overview.total_contacts.comparison || 'vs last month'}
            />
            <StatCard
              title={data?.overview.active_automations.title || 'Active Automations'}
              value={data?.overview.active_automations.value || '8'}
              icon={<Bot className="w-5 h-5 text-emerald-600" />}
              change={data?.overview.active_automations.change || '+8.3%'}
              isPositive={data?.overview.active_automations.is_positive ?? true}
              comparison={data?.overview.active_automations.comparison || 'vs last month'}
            />
            <StatCard
              title={data?.overview.total_conversations.title || 'Total Conversations'}
              value={data?.overview.total_conversations.value || '1,240'}
              icon={<MessageSquare className="w-5 h-5 text-emerald-600" />}
              change={data?.overview.total_conversations.change || '+18.2%'}
              isPositive={data?.overview.total_conversations.is_positive ?? true}
              comparison={data?.overview.total_conversations.comparison || 'vs last month'}
            />
            <StatCard
              title={data?.overview.total_messages.title || 'Messages Sent'}
              value={data?.overview.total_messages.value || '14,890'}
              icon={<MessagesSquare className="w-5 h-5 text-emerald-600" />}
              change={data?.overview.total_messages.change || '+24.0%'}
              isPositive={data?.overview.total_messages.is_positive ?? true}
              comparison={data?.overview.total_messages.comparison || 'vs last month'}
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Chart
              type="line"
              title="Messaging Engagement Trend"
              data={data?.engagement || []}
              dataKey="messages"
              categoryKey="date"
              height={280}
            />
            <Chart
              type="bar"
              title="Automation Execution Activity"
              data={data?.automation_activity || []}
              dataKey="executions"
              categoryKey="date"
              height={260}
            />
          </div>

          <div className="space-y-6">
            <Chart
              type="pie"
              title="Conversation Status Breakdown"
              data={data?.conversation_status || []}
              dataKey="value"
              categoryKey="name"
              height={280}
            />

            {/* Recent Activity Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">Recent Conversations</h3>
                <Link href="/inbox" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {recentConversations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent conversations yet.</p>
                ) : (
                  recentConversations.map((conv) => (
                    <div key={conv.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {conv.contact?.name ? conv.contact.name.substring(0, 2).toUpperCase() : 'C'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {conv.contact?.name || 'Contact'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {conv.last_message || 'No message'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(conv.last_message_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
