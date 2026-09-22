import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  PieChart,
  Target,
  BarChart3,
  CalendarClock,
  Sparkles,
  Settings,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { ActiveView } from '../types';

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const {
    activeView,
    setActiveView,
    budgets,
    bills,
    openTransactionModal,
    openBudgetModal,
    openGoalModal,
    openAccountModal,
  } = useFinance();

  const handleNav = (viewId: ActiveView) => {
    setActiveView(viewId);
    onNavigate?.();
  };

  // Badges: budgets exceeded
  const exceededBudgetsCount = budgets.filter((b) => b.spent > b.limit).length;
  // Unpaid bills count
  const unpaidBillsCount = bills.filter((b) => !b.isPaidThisMonth).length;

  const navItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'accounts', label: 'Accounts', icon: Landmark },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: PieChart,
      badge: exceededBudgetsCount > 0 ? `${exceededBudgetsCount} Alert` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
    },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {
      id: 'bills',
      label: 'Bills',
      icon: CalendarClock,
      badge: unpaidBillsCount > 0 ? unpaidBillsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: Sparkles,
      badge: 'Gemini 3.8',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen"
    >
      {/* Brand logo & title */}
      <div className="p-6 pb-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-base shadow-sm">
          A
        </div>
        <div>
          <div className="text-sm font-black text-white tracking-tight leading-none flex items-center gap-1.5">
            APEX FINANCE
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Smart Wealth OS</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-emerald-700/80 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick actions section in sidebar */}
        <div className="pt-6 px-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                openTransactionModal();
                onNavigate?.();
              }}
              className="p-2 text-left bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700/50 transition-colors"
            >
              + Expense
            </button>
            <button
              type="button"
              onClick={() => {
                openBudgetModal();
                onNavigate?.();
              }}
              className="p-2 text-left bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700/50 transition-colors"
            >
              + Budget
            </button>
            <button
              type="button"
              onClick={() => {
                openGoalModal();
                onNavigate?.();
              }}
              className="p-2 text-left bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700/50 transition-colors"
            >
              + Goal
            </button>
            <button
              type="button"
              onClick={() => {
                openAccountModal();
                onNavigate?.();
              }}
              className="p-2 text-left bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700/50 transition-colors"
            >
              + Account
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner at sidebar bottom */}
      <div className="p-4 border-t border-slate-800/80">
        <div
          onClick={() => handleNav('assistant')}
          className="p-3.5 bg-gradient-to-br from-emerald-950/60 to-slate-800/80 border border-emerald-800/40 rounded-2xl cursor-pointer hover:border-emerald-500/60 transition-all group"
        >
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apex AI Assistant</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Ask questions about monthly spend, budgets, or forecast savings.
          </p>
        </div>
      </div>
    </aside>
  );
};
