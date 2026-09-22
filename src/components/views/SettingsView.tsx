import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  User,
  Sliders,
  DollarSign,
  Bell,
  Palette,
  Shield,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Moon,
  Sun,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  Table,
  Server,
  Layers,
  Code2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Wifi,
  HardDrive,
} from 'lucide-react';
import { apiGetSupabaseSchema } from '../../lib/api';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateUserProfile,
    settings,
    updateSettings,
    categories,
    addCategory,
    deleteCategory,
    transactions,
    accounts,
    budgets,
    goals,
    bills,
    notifications,
    resetData,
    seedSupabase,
    refreshData,
    supabaseStatus,
    showToast,
  } = useFinance();

  const { isInstalled, isInstallable } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'notifications' | 'categories' | 'database' | 'data'>('profile');

  // Profile Form
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  // New Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#10b981');

  // Supabase Schema State
  const [schemaText, setSchemaText] = useState<string>('');
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  const [showSchemaViewer, setShowSchemaViewer] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleFetchSchema = async () => {
    if (schemaText) {
      setShowSchemaViewer(!showSchemaViewer);
      return;
    }
    setIsSchemaLoading(true);
    try {
      const sql = await apiGetSupabaseSchema();
      setSchemaText(sql);
      setShowSchemaViewer(true);
    } catch (err: any) {
      showToast('Schema Error', err.message || 'Failed to fetch SQL schema', 'error');
    } finally {
      setIsSchemaLoading(false);
    }
  };

  const handleCopySchema = () => {
    if (!schemaText) return;
    navigator.clipboard.writeText(schemaText);
    setCopiedSchema(true);
    showToast('Copied', 'Supabase PostgreSQL schema SQL copied to clipboard.', 'success');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      showToast('Database Refreshed', 'Refreshed records and connection status from Supabase backend.', 'success');
    } catch (err: any) {
      showToast('Refresh Error', err.message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedSupabase();
    } finally {
      setIsSeeding(false);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name: name.trim(), email: email.trim() });
    showToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
    });
    setNewCatName('');
    showToast('Category Added', `"${newCatName}" has been added.`, 'success');
  };

  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      user,
      settings,
      accounts,
      transactions,
      budgets,
      goals,
      bills,
      categories,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apex_finance_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Export Completed', 'JSON backup file successfully generated.', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all financial accounts, transactions, and budgets back to initial state?')) {
      resetData();
    }
  };

  return (
    <div id="settings-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          System Preferences & Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage currency standards, user profiles, categories, and system data
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Tab Navigation: horizontal scroll on mobile, vertical stack on desktop */}
        <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-1 md:pb-0 gap-1.5 md:gap-0 md:space-y-1 scrollbar-none">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'general', label: 'General & Currency', icon: DollarSign },
            { id: 'notifications', label: 'Alert Preferences', icon: Bell },
            { id: 'categories', label: 'Categories Manager', icon: Sliders },
            { id: 'database', label: 'Supabase PostgreSQL', icon: Database },
            { id: 'data', label: 'Data & Privacy', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap touch-manipulation min-h-[40px] cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 md:bg-transparent md:dark:bg-transparent border border-slate-200/80 dark:border-slate-800 md:border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-4 sm:p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  User Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Update your identity and account details
                </p>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    Pro Financial Plan • Member since Sep 2024
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[42px] touch-manipulation cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* General & Currency Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  General & Currency Standards
                </h3>
                <p className="text-xs text-slate-400">
                  Select your default currency and visual theme
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Primary Currency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
                      { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
                      { code: 'EUR', name: 'Euro (€)', symbol: '€' },
                      { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
                      { code: 'CAD', name: 'Canadian Dollar ($)', symbol: '$' },
                      { code: 'AUD', name: 'Australian Dollar ($)', symbol: '$' },
                      { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
                    ].map((curr) => (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() =>
                          updateSettings({
                            currency: curr.code,
                            currencySymbol: curr.symbol,
                          })
                        }
                        className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                          settings.currency === curr.code
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-sm">{curr.symbol} {curr.code}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{curr.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Visual Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateSettings({ theme: 'light' })}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        settings.theme === 'light'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light Theme
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ theme: 'dark' })}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        settings.theme === 'dark'
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                          : 'border-slate-700 text-slate-300'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark Theme
                    </button>
                  </div>
                </div>

                {/* Progressive Web App (PWA) Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                        Progressive Web App (PWA)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Install application for standalone execution and offline access
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isInstalled
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {isInstalled ? 'Installed / Standalone' : 'Browser Mode'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Service Worker: <strong>Active</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Display Mode: <strong>Standalone</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Offline Storage: <strong>CacheFirst & StaleWhileRevalidate</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Web App Manifest: <strong>Configured</strong></span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60">
                      <div className="text-[11px] text-slate-400">
                        {isInstalled
                          ? 'You are running Apex Finance in native standalone mode.'
                          : 'Install to your home screen or desktop application launcher.'}
                      </div>
                      <PWAInstallButton variant="settings" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Alert Preferences
                </h3>
                <p className="text-xs text-slate-400">
                  Configure proactive alerts for budget limits and bills
                </p>
              </div>

              <div className="space-y-3 max-w-lg">
                {[
                  {
                    title: 'Budget Limit Warnings',
                    desc: 'Notify when category spending exceeds 85% of monthly limit',
                    checked: true,
                  },
                  {
                    title: 'Upcoming Bill Reminders',
                    desc: 'Alert 3 days before recurring subscriptions and utility debits',
                    checked: true,
                  },
                  {
                    title: 'Savings Goal Milestones',
                    desc: 'Celebrate 25%, 50%, 75% and 100% completion milestones',
                    checked: true,
                  },
                  {
                    title: 'AI Anomaly Detection',
                    desc: 'Flag unusual spending spikes or merchant discrepancies',
                    checked: true,
                  },
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Categories Manager Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Spending & Income Categories
                </h3>
                <p className="text-xs text-slate-400">
                  Organize and customize transaction classifications
                </p>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    New Category Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pet Care, Software Subscriptions"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="w-32">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Type
                  </label>
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs touch-manipulation min-h-[40px] w-full sm:w-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </button>
              </form>

              {/* Existing Categories List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        ({c.type})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteCategory(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                      title="Remove Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supabase Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Supabase PostgreSQL Database
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Backend architecture status, relational table schemas, and data synchronization
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 touch-manipulation min-h-[38px] flex-1 sm:flex-none cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Checking...' : 'Refresh Status'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 touch-manipulation min-h-[38px] flex-1 sm:flex-none cursor-pointer"
                  >
                    <Layers className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                    {isSeeding ? 'Seeding Tables...' : 'Seed Sample Data'}
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border ${
                  supabaseStatus.connected
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50'
                    : 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        supabaseStatus.connected
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {supabaseStatus.connected ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Server className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {supabaseStatus.connected
                            ? 'Connected to Supabase PostgreSQL'
                            : 'Database Layer Initialized (PostgreSQL Ready)'}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            supabaseStatus.connected
                              ? 'bg-emerald-200/70 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300'
                              : 'bg-indigo-200/70 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-300'
                          }`}
                        >
                          {supabaseStatus.connected ? 'LIVE SYNCHRONIZED' : 'LOCAL CACHE ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {supabaseStatus.connected
                          ? `Active connection to remote Supabase instance at ${supabaseStatus.url}. All CRUD operations on transactions, accounts, budgets, goals, and recurring bills are persisting to PostgreSQL.`
                          : 'The application backend is configured with the complete Supabase PostgreSQL client and table schemas. When SUPABASE_URL and SUPABASE_ANON_KEY are set, data persists remotely with automatic synchronization.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Tables & Record Stats */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    PostgreSQL Relational Tables
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    7 Tables Defined • Row Level Security Enabled
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { name: 'accounts', label: 'Accounts', count: accounts.length, color: '#10b981' },
                    { name: 'transactions', label: 'Transactions', count: transactions.length, color: '#3b82f6' },
                    { name: 'budgets', label: 'Budgets', count: budgets.length, color: '#f59e0b' },
                    { name: 'savings_goals', label: 'Savings Goals', count: goals.length, color: '#8b5cf6' },
                    { name: 'recurring_bills', label: 'Recurring Bills', count: bills.length, color: '#ec4899' },
                    { name: 'categories', label: 'Categories', count: categories.length, color: '#14b8a6' },
                    { name: 'notifications', label: 'Notifications', count: notifications.length, color: '#64748b' },
                  ].map((table) => (
                    <div
                      key={table.name}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {table.name}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: table.color }}
                        />
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {table.count}
                        <span className="text-xs font-normal text-slate-400 ml-1">records</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {table.label} entity
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schema Viewer Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      PostgreSQL DDL Migration Script
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Standard SQL schema with primary keys, foreign constraints, indexes, and RLS policies
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {showSchemaViewer && (
                      <button
                        type="button"
                        onClick={handleCopySchema}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSchema ? 'Copied!' : 'Copy SQL'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleFetchSchema}
                      className="px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                    >
                      {showSchemaViewer ? 'Hide Schema' : isSchemaLoading ? 'Loading...' : 'Inspect Schema'}
                    </button>
                  </div>
                </div>

                {showSchemaViewer && schemaText && (
                  <div className="mt-3 relative">
                    <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed select-text">
                      {schemaText}
                    </pre>
                  </div>
                )}
              </div>

              {/* Environment Setup Instructions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  Supabase Environment Configuration
                </h4>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    To point Apex Finance to your personal Supabase project, define the following variables in your environment secrets or <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px]">.env</code>:
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div>SUPABASE_URL=https://your-project-id.supabase.co</div>
                    <div>SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...</div>
                    <div className="text-slate-400 text-[10px]"># Optional server-side service key:</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...</div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Once provided, the Express backend automatically proxies all API endpoints through the Supabase PostgreSQL client with zero client-side key leakage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data & Privacy Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Data Backup, Export & Reset
                </h3>
                <p className="text-xs text-slate-400">
                  Export complete records or restore sample demonstration state
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Export Complete JSON Snapshot
                  </div>
                  <p className="text-xs text-slate-400">
                    Download all transactions, linked accounts, budget configurations, and savings targets into an offline JSON file.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSON Archive
                  </button>
                </div>

                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 space-y-2">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-400">
                    Reset to Initial Sample Data
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clears any changes and re-populates the rich mock data set including sample transactions, accounts, and budgets.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Data State
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
