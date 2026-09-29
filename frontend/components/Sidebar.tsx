'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { getStoredUser, removeStoredToken } from '@/lib/auth';
import { User } from '@/types/auth';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Automations', href: '/automations', icon: Bot },
    { name: 'Inbox', href: '/inbox', icon: MessageSquare },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const secondaryNavItems = [
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    removeStoredToken();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/25 shrink-0">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-white tracking-tight transition-opacity duration-200">
              LinkPlease
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className={cn('px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider', collapsed && 'sr-only')}>
          Main Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-colors', isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200')} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        <div className="pt-6 my-2 border-t border-slate-800/80">
          <div className={cn('px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider', collapsed && 'sr-only')}>
            Preferences
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group',
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn('w-5 h-5 shrink-0 transition-colors', isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pro Badge Card */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-3.5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <Sparkles className="w-4 h-4" /> Pro Automation Active
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Internal DB triggers & responses connected.
          </p>
        </div>
      )}

      {/* User Profile / Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className={cn('flex items-center justify-between gap-2', collapsed && 'justify-center')}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 border border-emerald-400/30">
              {user?.name ? getInitials(user.name) : 'AM'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden text-left">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Alex Morgan'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'demo@linkplease.com'}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-tight">LinkPlease</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:block sticky top-0 h-screen transition-all duration-300 z-30 shrink-0 border-r border-slate-800',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};
