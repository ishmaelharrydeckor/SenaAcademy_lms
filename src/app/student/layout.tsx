'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { LoadingScreen, Button } from '@/components/UI';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  History,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StudentLayoutContent>{children}</StudentLayoutContent>
    </ThemeProvider>
  );
}

function StudentLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Role Gating
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (profile && profile.role !== 'student') {
        // Redirect non-students to their respective dashboards
        if (profile.role === 'admin') router.push('/admin');
        else if (profile.role === 'facilitator') router.push('/facilitator');
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile || profile.role !== 'student') {
    return <LoadingScreen message="Gating Student Area..." />;
  }

  const navLinks = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Course Modules', href: '/student/modules', icon: BookOpen },
    { name: 'Project History', href: '/student/history', icon: History },
  ];

  // Design Token CSS class mappings
  const bgClass = 'bg-bg-canvas text-text-primary';
  const sidebarClass = 'bg-bg-surface border-border-brand';
  const mobileDrawerClass = 'bg-bg-surface border-border-brand shadow-xl';
  const headerClass = 'bg-bg-canvas/80 border-border-brand shadow-sm';
  const textClass = 'text-text-primary';
  const userCardBorderClass = 'border-border-brand';
  const userAvatarClass = 'bg-bg-surface-hover border-border-brand text-text-primary';
  const userTitleClass = 'text-text-primary';
  const userSubtitleClass = 'text-text-secondary';
  const signOutClass = 'text-text-secondary hover:text-red-500 hover:bg-red-500/5';
  const topBarTextClass = 'text-text-secondary';
  const topBarActiveTextClass = 'text-text-primary';

  const getLinkStyle = (active: boolean) => {
    if (active) {
      return 'bg-bg-surface-hover text-text-primary border-l-2 border-l-accent-primary font-semibold shadow-inner';
    }
    return 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/50';
  };

  const getIconStyle = (active: boolean) => {
    if (active) return 'text-accent-primary';
    return 'text-text-secondary';
  };

  return (
    <div className={`min-h-screen flex ${bgClass} ${theme} relative transition-colors duration-250`}>
      {/* Background radial highlights (only in dark mode for premium look) */}
      {theme === 'dark' && (
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 border-r ${sidebarClass} p-6 justify-between shrink-0 transition-colors duration-250`}>
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <>
                <div className="h-8 w-8 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                  <img src="/logo_icon.jpg" alt="Sena Logo Icon" className="h-full w-full object-contain" />
                </div>
                <span className={`text-sm font-bold tracking-tight ${textClass}`}>SENA STUDENT</span>
              </>
            ) : (
              <img src="/logo_full.jpg" alt="Sena Academy Logo" className="h-8 md:h-9 object-contain" />
            )}
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || (link.href !== '/student' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${getLinkStyle(active)}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${getIconStyle(active)}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`space-y-4 pt-6 border-t ${userCardBorderClass}`}>
          <div className="flex items-center gap-3 px-2">
            <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold ${userAvatarClass}`}>
              {profile.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${userTitleClass}`}>{profile.full_name}</p>
              <p className={`text-[10px] truncate ${userSubtitleClass}`}>{profile.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className={`flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${signOutClass}`}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className={`relative flex flex-col w-64 max-w-xs border-r p-6 justify-between z-10 animate-fade-in ${mobileDrawerClass} transition-colors duration-250`}>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <img src="/logo_icon.jpg" alt="Sena Logo Icon" className="h-full w-full object-contain" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${textClass}`}>Student Portal</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${getLinkStyle(active)}`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${getIconStyle(active)}`} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className={`space-y-4 pt-6 border-t ${userCardBorderClass}`}>
              <div className="flex items-center gap-3 px-2">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold ${userAvatarClass}`}>
                  {profile.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${userTitleClass}`}>{profile.full_name}</p>
                  <p className={`text-[10px] truncate ${userSubtitleClass}`}>{profile.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className={`flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${signOutClass}`}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar header */}
        <header className={`h-16 border-b flex items-center justify-between px-6 backdrop-blur sticky top-0 z-30 ${headerClass} transition-colors duration-250`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-text-secondary hover:text-text-primary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className={`text-xs font-mono ${topBarTextClass}`}>Student Space</span>
              <span className="text-text-secondary/40">/</span>
              <span className={`text-xs capitalize ${topBarActiveTextClass}`}>{pathname.split('/').pop() || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/50"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Realtime Notifications Trigger Button */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-lg transition-colors text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/50"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-primary ring-2 ring-bg-canvas animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* In-App Real-time Notifications Drawer (Right Overlay) */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay background */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setNotificationsOpen(false)}
          ></div>

          {/* Slider Panel */}
          <div className={`relative w-full max-w-md border-l flex flex-col justify-between h-full z-10 animate-fade-in shadow-2xl bg-bg-surface border-border-brand`}>
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-6 border-b flex items-center justify-between border-border-brand bg-bg-surface/40">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">Manage your updates and project grades.</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[10px] text-accent-primary hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {notifications.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <Bell className="h-8 w-8 text-text-secondary opacity-40 stroke-[1.5] mb-2" />
                    <p className="text-xs text-text-secondary">You are all caught up.</p>
                    <p className="text-[10px] text-text-secondary opacity-60 mt-1">No alerts or grades received yet.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.is_read) markAsRead(notif.id);
                        if (notif.link) {
                          setNotificationsOpen(false);
                          router.push(notif.link);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        notif.is_read
                          ? 'border-border-brand/40 bg-bg-surface-hover/10 text-text-secondary hover:bg-bg-surface-hover/20'
                          : 'border-border-brand bg-bg-surface-hover/40 text-text-primary hover:bg-bg-surface-hover/60 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-text-primary">
                            {notif.title}
                          </h4>
                          <p className="text-[11px] leading-relaxed text-text-secondary">{notif.message}</p>
                          <span className="text-[9px] font-mono text-text-secondary opacity-60 block mt-1">
                            {new Date(notif.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {!notif.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-primary mt-1 shrink-0"></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
