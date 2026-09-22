import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  CheckCheck,
  ChevronDown,
  User,
  Sparkles,
  ExternalLink,
  Shield,
  Sliders,
  LogOut,
  Database,
  Menu,
} from 'lucide-react';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const {
    user,
    settings,
    updateSettings,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openTransactionModal,
    setIsSearchOpen,
    setActiveView,
    openAuthModal,
    openOnboarding,
    supabaseStatus,
  } = useFinance();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const currentDateFormatted = 'Wednesday, Sep 16, 2026';

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80"
    >
      {/* Left: Menu toggle (mobile) + Date / Greeting context */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
              Hello, {user.name.split(' ')[0]}
            </h1>
            <button
              type="button"
              onClick={() => setActiveView('settings')}
              title={supabaseStatus.connected ? `Connected to Supabase PostgreSQL: ${supabaseStatus.url || ''}` : 'Database storage status (click for details)'}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                supabaseStatus.connected
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                  : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/60'
              }`}
            >
              <Database className="w-3 h-3" />
              <span className="hidden xs:inline">{supabaseStatus.connected ? 'Supabase PG' : 'PostgreSQL Ready'}</span>
              <span className="xs:hidden">{supabaseStatus.connected ? 'PG' : 'PG Ready'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${supabaseStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate hidden xs:block">
            {currentDateFormatted} • Financial Overview
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Mobile search icon button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search records"
          className="sm:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Desktop Search button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-2xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search records...</span>
          <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton variant="header" />

        {/* Quick Add Transaction */}
        <button
          type="button"
          onClick={() => openTransactionModal()}
          aria-label="Add transaction"
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Transaction</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
            className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkToView) {
                          setActiveView(notif.linkToView);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </div>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline">
              {user.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('login');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Switch Account / Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openOnboarding();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Run Onboarding Setup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  Preferences & Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
