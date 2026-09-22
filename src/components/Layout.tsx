import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { AccountsView } from './views/AccountsView';
import { BudgetsView } from './views/BudgetsView';
import { SavingsGoalsView } from './views/SavingsGoalsView';
import { AnalyticsView } from './views/AnalyticsView';
import { BillsView } from './views/BillsView';
import { AIAssistantView } from './views/AIAssistantView';
import { SettingsView } from './views/SettingsView';

// Modals
import { TransactionModal } from './modals/TransactionModal';
import { BudgetModal } from './modals/BudgetModal';
import { GoalModal } from './modals/GoalModal';
import { DepositModal } from './modals/DepositModal';
import { AccountModal } from './modals/AccountModal';
import { TransferModal } from './modals/TransferModal';
import { BillModal } from './modals/BillModal';
import { AuthModal } from './modals/AuthModal';
import { OnboardingModal } from './modals/OnboardingModal';
import { GlobalSearchModal } from './GlobalSearchModal';
import { ToastContainer } from './Toast';
import { OfflineIndicator } from './pwa/OfflineIndicator';
import {
  Menu,
  X,
  LayoutDashboard,
  Receipt,
  Landmark,
  PieChart,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { activeView, setActiveView } = useFinance();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'accounts':
        return <AccountsView />;
      case 'budgets':
        return <BudgetsView />;
      case 'goals':
        return <SavingsGoalsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'bills':
        return <BillsView />;
      case 'assistant':
        return <AIAssistantView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const mobileBottomNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: Receipt },
    { id: 'accounts', label: 'Accounts', icon: Landmark },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'assistant', label: 'AI Advisor', icon: Sparkles },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-72 max-w-[85vw] h-full bg-slate-900 flex flex-col relative shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global sticky header with integrated mobile menu toggle */}
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Scrollable View container with mobile bottom-nav padding */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-1.5 shadow-lg safe-area-bottom"
      >
        {mobileBottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all touch-manipulation min-h-[44px] ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] leading-tight truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}

        {/* More/Menu button on mobile bar */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium touch-manipulation min-h-[44px]"
        >
          <MoreHorizontal className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">More</span>
        </button>
      </nav>

      {/* All Modal Overlays */}
      <TransactionModal />
      <BudgetModal />
      <GoalModal />
      <DepositModal />
      <AccountModal />
      <TransferModal />
      <BillModal />
      <AuthModal />
      <OnboardingModal />
      <GlobalSearchModal />
      <OfflineIndicator />
      <ToastContainer />
    </div>
  );
};
