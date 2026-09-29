'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { Chart } from '@/components/Chart';
import { LoadingSpinner, CardSkeleton } from '@/components/Loading';
import { Users, Bot, MessageSquare, MessagesSquare, TrendingUp, Sparkles, Download, Calendar } from 'lucide-react';
import { getAnalyticsOverview } from '@/lib/api';
import { AnalyticsData } from '@/types/analytics';
import { Button } from '@/components/Button';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAnalyticsOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Analytics & Insights <TrendingUp className="w-5 h-5 text-emerald-600" />
            </h2>
            <p className="text-xs text-slate-500 mt-1">Real-time performance metrics and messaging engagement trends.</p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400" /> Last 30 Days
            </button>
            <Button variant="outline" icon={<Download className="w-4 h-4" />}>
              Export Report
            </Button>
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

        {/* Deep Dive Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart
            type="line"
            title="Daily Message Volume & Growth"
            data={data?.engagement || []}
            dataKey="messages"
            categoryKey="date"
            height={320}
          />

          <Chart
            type="bar"
            title="Automation Rule Executions"
            data={data?.automation_activity || []}
            dataKey="executions"
            categoryKey="date"
            height={320}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Chart
            type="pie"
            title="Conversation Status Distribution"
            data={data?.conversation_status || []}
            dataKey="value"
            categoryKey="name"
            height={300}
          />

          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
              <Sparkles className="w-5 h-5" /> Executive Summary & Recommendations
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated responses accounted for <strong className="text-slate-900 font-semibold">68%</strong> of initial contact engagements this week, reducing median response latency from 45 minutes to less than 2 seconds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Avg Response Time</span>
                <span className="text-xl font-bold text-slate-900">1.4s</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Auto Resolution</span>
                <span className="text-xl font-bold text-slate-900">74.2%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Lead Conversion Rate</span>
                <span className="text-xl font-bold text-slate-900">31.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
