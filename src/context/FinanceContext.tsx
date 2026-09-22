import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  Account,
  AppSettings,
  Budget,
  Category,
  FinancialHealthScore,
  NotificationItem,
  RecurringBill,
  SavingsGoal,
  Transaction,
  UserProfile,
  ActiveView,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BILLS,
  INITIAL_BUDGETS,
  INITIAL_CATEGORIES,
  INITIAL_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
} from '../data/mockData';
import {
  apiGetState,
  apiGetSupabaseStatus,
  apiCreateAccount,
  apiUpdateAccount,
  apiDeleteAccount,
  apiCreateTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiCreateBudget,
  apiUpdateBudget,
  apiDeleteBudget,
  apiCreateGoal,
  apiUpdateGoal,
  apiDeleteGoal,
  apiCreateBill,
  apiUpdateBill,
  apiDeleteBill,
  apiCreateCategory,
  apiDeleteCategory,
  apiCreateNotification,
  apiUpdateNotification,
  apiDeleteNotification,
  apiUpdateUserProfile,
  apiUpdateSettings,
  apiSeedSupabase,
  apiResetData,
  SupabaseStatus,
} from '../lib/api';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface FinanceContextType {
  // State
  user: UserProfile;
  settings: AppSettings;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  bills: RecurringBill[];
  categories: Category[];
  notifications: NotificationItem[];
  activeView: ActiveView;
  searchQuery: string;
  isSearchOpen: boolean;
  toasts: ToastMessage[];
  supabaseStatus: SupabaseStatus;

  // Supabase Database Actions
  refreshData: () => Promise<void>;
  seedSupabase: () => Promise<void>;
  resetData: () => Promise<void>;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Navigation
  setActiveView: (view: ActiveView) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  showToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Modals
  isTransactionModalOpen: boolean;
  editingTransaction: Transaction | null;
  openTransactionModal: (tx?: Transaction) => void;
  closeTransactionModal: () => void;

  isBudgetModalOpen: boolean;
  editingBudget: Budget | null;
  openBudgetModal: (budget?: Budget) => void;
  closeBudgetModal: () => void;

  isGoalModalOpen: boolean;
  editingGoal: SavingsGoal | null;
  openGoalModal: (goal?: SavingsGoal) => void;
  closeGoalModal: () => void;

  isDepositModalOpen: boolean;
  depositGoal: SavingsGoal | null;
  openDepositModal: (goal: SavingsGoal) => void;
  closeDepositModal: () => void;

  isAccountModalOpen: boolean;
  editingAccount: Account | null;
  openAccountModal: (acc?: Account) => void;
  closeAccountModal: () => void;

  isTransferModalOpen: boolean;
  openTransferModal: () => void;
  closeTransferModal: () => void;

  isBillModalOpen: boolean;
  editingBill: RecurringBill | null;
  openBillModal: (bill?: RecurringBill) => void;
  closeBillModal: () => void;

  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup' | 'forgot' | 'reset';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot' | 'reset') => void;
  closeAuthModal: () => void;

  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addAccount: (acc: Omit<Account, 'id' | 'updatedAt'>) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, notes?: string) => boolean;

  addBudget: (b: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  addGoal: (g: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, fromAccountId: string) => boolean;

  addBill: (bill: Omit<RecurringBill, 'id'>) => void;
  updateBill: (id: string, bill: Partial<RecurringBill>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  resetToSampleData: () => void;
  exportData: (format: 'json' | 'csv') => void;

  // Derived metrics
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  availableCash: number;
  financialHealth: FinancialHealthScore;
  categorySpending: Array<{ category: string; amount: number; percentage: number; color: string }>;
  formatMoney: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getMonthlyTrendData: () => Array<{ month: string; income: number; expenses: number; net: number }>;
  getCategorySpendingData: () => Array<{ name: string; category: string; value: number; amount: number; percentage: number; color: string }>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'pfms_user_v1',
  SETTINGS: 'pfms_settings_v1',
  ACCOUNTS: 'pfms_accounts_v1',
  TRANSACTIONS: 'pfms_transactions_v1',
  BUDGETS: 'pfms_budgets_v1',
  GOALS: 'pfms_goals_v1',
  BILLS: 'pfms_bills_v1',
  CATEGORIES: 'pfms_categories_v1',
  NOTIFICATIONS: 'pfms_notifications_v1',
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Primary States with localStorage hydration
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [bills, setBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
      return saved ? JSON.parse(saved) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    configured: false,
    connected: false,
    url: null,
    error: null,
    storageType: 'Connecting...',
  });

  // Hydrate full state from Supabase PostgreSQL (via backend API)
  const refreshData = async () => {
    try {
      const fullState = await apiGetState();
      if (fullState) {
        if (fullState.accounts?.length) setAccounts(fullState.accounts);
        if (fullState.transactions?.length) setTransactions(fullState.transactions);
        if (fullState.budgets?.length) setBudgets(fullState.budgets);
        if (fullState.goals?.length) setGoals(fullState.goals);
        if (fullState.bills?.length) setBills(fullState.bills);
        if (fullState.categories?.length) setCategories(fullState.categories);
        if (fullState.notifications?.length) setNotifications(fullState.notifications);
        if (fullState.user) setUser(fullState.user);
        if (fullState.settings) setSettings(fullState.settings);
        if (fullState.supabaseStatus) setSupabaseStatus(fullState.supabaseStatus);
      }
    } catch (err: any) {
      console.warn('Could not hydrate full state from API:', err.message);
      // Still fetch status
      try {
        const status = await apiGetSupabaseStatus();
        setSupabaseStatus(status);
      } catch {}
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }, [bills]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Toast Helpers
  const showToast = (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Currency Formatter
  const formatMoney = (amount: number): string => {
    const symbol = settings.currencySymbol || '₹';
    const isNegative = amount < 0;
    const absValue = Math.abs(amount);
    const locale = settings.currency === 'INR' ? 'en-IN' : undefined;
    return `${isNegative ? '-' : ''}${symbol}${absValue.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Date Formatter
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return '';
    try {
      const parts = dateString.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, monthIndex, day);
        return d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      const d = new Date(dateString);
      return isNaN(d.getTime())
        ? dateString
        : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  }, []);

  // Financial Calculations
  const currentMonthPrefix = '2026-09'; // Matches current active simulated month

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => {
      return sum + acc.balance;
    }, 0);
  }, [accounts]);

  const availableCash = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'checking' || a.type === 'wallet' || a.type === 'cash')
      .reduce((sum, acc) => sum + Math.max(0, acc.balance), 0);
  }, [accounts]);

  const monthlyIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income' && tx.date.startsWith(currentMonthPrefix))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthPrefix))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const monthlySavings = useMemo(() => {
    return monthlyIncome - monthlyExpenses;
  }, [monthlyIncome, monthlyExpenses]);

  const savingsRate = useMemo(() => {
    if (monthlyIncome <= 0) return 0;
    return Math.max(0, Math.round((monthlySavings / monthlyIncome) * 100));
  }, [monthlyIncome, monthlySavings]);

  // Recalculate spending per budget category based on current month
  const categorySpending = useMemo(() => {
    const map = new Map<string, number>();
    let totalExp = 0;

    for (const tx of transactions) {
      if (tx.type === 'expense' && tx.date.startsWith(currentMonthPrefix)) {
        totalExp += tx.amount;
        map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
      }
    }

    const result = Array.from(map.entries()).map(([category, amount]) => {
      const catObj = categories.find((c) => c.name === category);
      return {
        category,
        amount,
        percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
        color: catObj?.color || '#64748b',
      };
    });

    return result.sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  // Category spending data formatted for Recharts and dashboard widgets
  const getCategorySpendingData = useCallback(() => {
    if (categorySpending.length > 0) {
      return categorySpending.map((c) => ({
        name: c.category,
        category: c.category,
        value: c.amount,
        amount: c.amount,
        percentage: c.percentage,
        color: c.color,
      }));
    }

    return categories
      .filter((c) => c.type === 'expense')
      .slice(0, 6)
      .map((c, i) => ({
        name: c.name,
        category: c.name,
        value: (6 - i) * 150,
        amount: (6 - i) * 150,
        percentage: Math.round(100 / 6),
        color: c.color,
      }));
  }, [categorySpending, categories]);

  // Monthly trend data for multi-month income vs expense charts
  const getMonthlyTrendData = useCallback(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const refYear = 2026;
    const refMonth = 8; // September (0-indexed)

    // Standard baseline benchmarks for past months with minimal transaction records
    const historicalDefaults: Record<string, { income: number; expenses: number }> = {
      Apr: { income: 7800, expenses: 3950 },
      May: { income: 8200, expenses: 4100 },
      Jun: { income: 8100, expenses: 4400 },
      Jul: { income: 8480, expenses: 4250 },
      Aug: { income: 8300, expenses: 3880 },
    };

    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(refYear, refMonth - i, 1);
      const mName = monthNames[d.getMonth()];
      const y = d.getFullYear();
      const prefix = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      // Sum transactions matching this month prefix
      let inc = 0;
      let exp = 0;
      let hasTx = false;
      for (const tx of transactions) {
        if (tx.date.startsWith(prefix)) {
          hasTx = true;
          if (tx.type === 'income') inc += tx.amount;
          else if (tx.type === 'expense') exp += tx.amount;
        }
      }

      if (!hasTx && historicalDefaults[mName]) {
        inc = historicalDefaults[mName].income;
        exp = historicalDefaults[mName].expenses;
      }

      trends.push({
        month: mName,
        income: Number(inc.toFixed(2)),
        expenses: Number(exp.toFixed(2)),
        net: Number((inc - exp).toFixed(2)),
      });
    }

    return trends;
  }, [transactions]);

  // Financial Health Score Algorithm
  const financialHealth: FinancialHealthScore = useMemo(() => {
    // 1. Savings rate score (up to 30 pts)
    const rateScore = Math.min(30, (savingsRate / 20) * 30);

    // 2. Budget adherence score (up to 30 pts)
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const adherenceRatio = totalBudgetLimit > 0 ? totalBudgetSpent / totalBudgetLimit : 0.8;
    const adherenceScore = adherenceRatio <= 1 ? 30 - Math.max(0, (adherenceRatio - 0.7) * 50) : Math.max(5, 30 - (adherenceRatio - 1) * 100);

    // 3. Emergency fund cushion (months of expenses covered) (up to 25 pts)
    const avgMonthlyBurn = Math.max(1500, monthlyExpenses);
    const emergencyFunds = accounts
      .filter((a) => a.type === 'savings' || a.type === 'checking')
      .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
    const monthsCovered = emergencyFunds / avgMonthlyBurn;
    const emergencyScore = Math.min(25, (monthsCovered / 6) * 25);

    // 4. Debt-to-asset health (credit balance vs total assets) (up to 15 pts)
    const totalDebt = accounts
      .filter((a) => a.type === 'credit' && a.balance < 0)
      .reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const debtRatio = totalBalance > 0 ? totalDebt / totalBalance : 0.2;
    const debtScore = debtRatio < 0.1 ? 15 : Math.max(0, 15 - debtRatio * 30);

    const rawScore = Math.round(rateScore + adherenceScore + emergencyScore + debtScore);
    const score = Math.min(100, Math.max(20, rawScore));

    let label: FinancialHealthScore['label'] = 'Good';
    if (score >= 85) label = 'Excellent';
    else if (score >= 70) label = 'Good';
    else if (score >= 55) label = 'Fair';
    else label = 'Needs Attention';

    const recommendations: string[] = [];
    if (savingsRate < 20) {
      recommendations.push('Aim to increase your savings rate towards 20% by trimming discretionary spending.');
    } else {
      recommendations.push('Strong savings momentum! Consider dollar-cost averaging surplus cash into index portfolios.');
    }
    if (monthsCovered < 3) {
      recommendations.push('Build a stronger emergency cushion to cover at least 3-6 months of necessary living costs.');
    } else {
      recommendations.push('Healthy emergency cash cushion maintained across liquid checking and savings.');
    }
    if (adherenceRatio > 0.9) {
      recommendations.push('Keep a watchful eye on dining and shopping budgets to prevent end-of-month limit overruns.');
    } else {
      recommendations.push('Disciplined spending habits observed with healthy margins under active category limits.');
    }

    return {
      score,
      label,
      status: label,
      factors: {
        savingsRate,
        budgetAdherence: Math.round(adherenceRatio * 100),
        debtRatio: Math.round(debtRatio * 100),
        emergencyFundMonths: Number(monthsCovered.toFixed(1)),
      },
      recommendations,
    };
  }, [savingsRate, budgets, monthlyExpenses, accounts, totalBalance]);

  // Modal Openers
  const openTransactionModal = (tx?: Transaction) => {
    setEditingTransaction(tx || null);
    setIsTransactionModalOpen(true);
  };
  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const openBudgetModal = (budget?: Budget) => {
    setEditingBudget(budget || null);
    setIsBudgetModalOpen(true);
  };
  const closeBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const openGoalModal = (goal?: SavingsGoal) => {
    setEditingGoal(goal || null);
    setIsGoalModalOpen(true);
  };
  const closeGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const openDepositModal = (goal: SavingsGoal) => {
    setDepositGoal(goal);
    setIsDepositModalOpen(true);
  };
  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setDepositGoal(null);
  };

  const openAccountModal = (acc?: Account) => {
    setEditingAccount(acc || null);
    setIsAccountModalOpen(true);
  };
  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  };

  const openTransferModal = () => setIsTransferModalOpen(true);
  const closeTransferModal = () => setIsTransferModalOpen(false);

  const openBillModal = (bill?: RecurringBill) => {
    setEditingBill(bill || null);
    setIsBillModalOpen(true);
  };
  const closeBillModal = () => {
    setIsBillModalOpen(false);
    setEditingBill(null);
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' | 'reset' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  // CRUD Operations
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...txData,
      id: newId,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Persist to Supabase backend
    apiCreateTransaction(newTx).catch((e) => console.warn('Supabase sync tx error:', e));

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txData.accountId) {
          const delta = txData.type === 'income' ? txData.amount : -txData.amount;
          const updatedBalance = Number((acc.balance + delta).toFixed(2));
          const updatedAcc = {
            ...acc,
            balance: updatedBalance,
            updatedAt: new Date().toISOString(),
          };
          apiUpdateAccount(acc.id, { balance: updatedBalance, updatedAt: updatedAcc.updatedAt }).catch(() => {});
          return updatedAcc;
        }
        return acc;
      })
    );

    // Update budget spent if expense
    if (txData.type === 'expense') {
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.category.toLowerCase() === txData.category.toLowerCase()) {
            const updatedSpent = Number((b.spent + txData.amount).toFixed(2));
            apiUpdateBudget(b.id, { spent: updatedSpent }).catch(() => {});
            // Check if alert needed
            if (updatedSpent > b.limit && settings.enableBudgetAlerts) {
              addNotification({
                title: `Budget Exceeded: ${b.category}`,
                message: `You spent ${formatMoney(updatedSpent)} of your ${formatMoney(b.limit)} limit.`,
                type: 'budget_alert',
                severity: 'danger',
                linkToView: 'budgets',
              });
            } else if (updatedSpent / b.limit >= b.alertThreshold && settings.enableBudgetAlerts) {
              addNotification({
                title: `Approaching Budget: ${b.category}`,
                message: `You've used ${Math.round((updatedSpent / b.limit) * 100)}% of your ${formatMoney(b.limit)} limit.`,
                type: 'budget_alert',
                severity: 'warning',
                linkToView: 'budgets',
              });
            }
            return { ...b, spent: updatedSpent };
          }
          return b;
        })
      );
    }

    showToast('Transaction recorded', `${txData.title} (${formatMoney(txData.amount)})`, 'success');
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
    apiUpdateTransaction(id, updates).catch((e) => console.warn('Supabase update tx error:', e));
    showToast('Transaction updated', 'Changes have been saved successfully.', 'info');
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse account balance impact
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.accountId) {
          const delta = tx.type === 'income' ? -tx.amount : tx.amount;
          const updatedBalance = Number((acc.balance + delta).toFixed(2));
          apiUpdateAccount(acc.id, { balance: updatedBalance }).catch(() => {});
          return {
            ...acc,
            balance: updatedBalance,
            updatedAt: new Date().toISOString(),
          };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    apiDeleteTransaction(id).catch((e) => console.warn('Supabase delete tx error:', e));
    showToast('Transaction deleted', 'The record was removed.', 'info');
  };

  const addAccount = (accData: Omit<Account, 'id' | 'updatedAt'>) => {
    const newAccount: Account = {
      ...accData,
      id: `acc-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAccount]);
    apiCreateAccount(newAccount).catch((e) => console.warn('Supabase create account error:', e));
    showToast('Account added', `${newAccount.name} created.`, 'success');
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const updatedAt = new Date().toISOString();
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, ...updates, updatedAt } : acc
      )
    );
    apiUpdateAccount(id, { ...updates, updatedAt }).catch((e) => console.warn('Supabase update account error:', e));
    showToast('Account updated', 'Account details updated.', 'info');
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    apiDeleteAccount(id).catch((e) => console.warn('Supabase delete account error:', e));
    showToast('Account removed', 'The account has been deleted.', 'info');
  };

  const transferFunds = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string
  ): boolean => {
    if (fromAccountId === toAccountId) {
      showToast('Transfer error', 'Source and destination accounts must be different.', 'error');
      return false;
    }
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);

    if (!fromAcc || !toAcc) {
      showToast('Transfer error', 'Invalid account selected.', 'error');
      return false;
    }

    const newFromBal = Number((fromAcc.balance - amount).toFixed(2));
    const newToBal = Number((toAcc.balance + amount).toFixed(2));
    const nowIso = new Date().toISOString();

    // Deduct from source, add to destination
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId) {
          return {
            ...acc,
            balance: newFromBal,
            updatedAt: nowIso,
          };
        }
        if (acc.id === toAccountId) {
          return {
            ...acc,
            balance: newToBal,
            updatedAt: nowIso,
          };
        }
        return acc;
      })
    );

    apiUpdateAccount(fromAccountId, { balance: newFromBal, updatedAt: nowIso }).catch(() => {});
    apiUpdateAccount(toAccountId, { balance: newToBal, updatedAt: nowIso }).catch(() => {});

    const nowStr = new Date().toISOString().split('T')[0];

    // Create 2 transaction records (Debit & Credit)
    const outTx: Transaction = {
      id: `tx-tf-out-${Date.now()}`,
      date: nowStr,
      title: `Transfer to ${toAcc.name}`,
      amount,
      type: 'expense',
      category: 'Investments',
      accountId: fromAccountId,
      paymentMethod: 'Internal Transfer',
      notes: notes || `Transfer to ${toAcc.name}`,
      status: 'completed',
    };

    const inTx: Transaction = {
      id: `tx-tf-in-${Date.now()}`,
      date: nowStr,
      title: `Transfer from ${fromAcc.name}`,
      amount,
      type: 'income',
      category: 'Investments',
      accountId: toAccountId,
      paymentMethod: 'Internal Transfer',
      notes: notes || `Transfer from ${fromAcc.name}`,
      status: 'completed',
    };

    setTransactions((prev) => [outTx, inTx, ...prev]);
    apiCreateTransaction(outTx).catch(() => {});
    apiCreateTransaction(inTx).catch(() => {});

    showToast('Transfer completed', `Successfully moved ${formatMoney(amount)} from ${fromAcc.name} to ${toAcc.name}.`, 'success');
    return true;
  };

  const addBudget = (bData: Omit<Budget, 'id' | 'spent'>) => {
    // calculate current spent in category for this month
    const currentSpent = transactions
      .filter(
        (tx) =>
          tx.type === 'expense' &&
          tx.category.toLowerCase() === bData.category.toLowerCase() &&
          tx.date.startsWith(currentMonthPrefix)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const newBudget: Budget = {
      ...bData,
      id: `b-${Date.now()}`,
      spent: Number(currentSpent.toFixed(2)),
    };
    setBudgets((prev) => [...prev, newBudget]);
    apiCreateBudget(newBudget).catch((e) => console.warn('Supabase create budget error:', e));
    showToast('Budget configured', `Budget limit for ${bData.category} set to ${formatMoney(bData.limit)}.`, 'success');
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    apiUpdateBudget(id, updates).catch((e) => console.warn('Supabase update budget error:', e));
    showToast('Budget updated', 'Your spending limits have been refreshed.', 'info');
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    apiDeleteBudget(id).catch((e) => console.warn('Supabase delete budget error:', e));
    showToast('Budget removed', 'Budget category removed.', 'info');
  };

  const addGoal = (gData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...gData,
      id: `g-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
    apiCreateGoal(newGoal).catch((e) => console.warn('Supabase create goal error:', e));
    showToast('Goal established', `Goal "${gData.name}" created!`, 'success');
  };

  const updateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    apiUpdateGoal(id, updates).catch((e) => console.warn('Supabase update goal error:', e));
    showToast('Goal updated', 'Goal details saved.', 'info');
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    apiDeleteGoal(id).catch((e) => console.warn('Supabase delete goal error:', e));
    showToast('Goal deleted', 'Goal has been removed.', 'info');
  };

  const contributeToGoal = (goalId: string, amount: number, fromAccountId: string): boolean => {
    const goal = goals.find((g) => g.id === goalId);
    const acc = accounts.find((a) => a.id === fromAccountId);

    if (!goal || !acc) {
      showToast('Contribution error', 'Selected goal or funding account was not found.', 'error');
      return false;
    }

    if (acc.balance < amount && acc.type !== 'credit') {
      showToast('Insufficient funds', `Account balance (${formatMoney(acc.balance)}) is below contribution amount.`, 'warning');
      return false;
    }

    const newAccBal = Number((acc.balance - amount).toFixed(2));
    const nowIso = new Date().toISOString();

    // Deduct from account
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === fromAccountId
          ? { ...a, balance: newAccBal, updatedAt: nowIso }
          : a
      )
    );
    apiUpdateAccount(fromAccountId, { balance: newAccBal, updatedAt: nowIso }).catch(() => {});

    // Increase goal amount
    const updatedAmount = Number((goal.currentAmount + amount).toFixed(2));
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: updatedAmount } : g))
    );
    apiUpdateGoal(goalId, { currentAmount: updatedAmount }).catch(() => {});

    // Record as transaction
    const nowStr = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: `tx-goal-${Date.now()}`,
      date: nowStr,
      title: `Goal Deposit: ${goal.name}`,
      amount,
      type: 'expense',
      category: 'Investments',
      accountId: fromAccountId,
      paymentMethod: 'Goal Deposit',
      notes: `Contribution toward ${goal.name}`,
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);
    apiCreateTransaction(newTx).catch(() => {});

    // Check if goal achieved
    if (updatedAmount >= goal.targetAmount) {
      addNotification({
        title: `Goal Reached: ${goal.name}!`,
        message: `Hooray! You reached 100% of your target for ${goal.name} (${formatMoney(goal.targetAmount)}).`,
        type: 'goal_milestone',
        severity: 'success',
        linkToView: 'goals',
      });
    }

    showToast(
      'Deposit confirmed',
      `Deposited ${formatMoney(amount)} into "${goal.name}". Progress: ${Math.round(
        (updatedAmount / goal.targetAmount) * 100
      )}%`,
      'success'
    );
    return true;
  };

  const addBill = (billData: Omit<RecurringBill, 'id'>) => {
    const newBill: RecurringBill = {
      ...billData,
      id: `bill-${Date.now()}`,
    };
    setBills((prev) => [...prev, newBill]);
    apiCreateBill(newBill).catch((e) => console.warn('Supabase create bill error:', e));
    showToast('Bill scheduled', `${billData.name} (${formatMoney(billData.amount)}) added.`, 'success');
  };

  const updateBill = (id: string, updates: Partial<RecurringBill>) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    apiUpdateBill(id, updates).catch((e) => console.warn('Supabase update bill error:', e));
    showToast('Bill updated', 'Bill information refreshed.', 'info');
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    apiDeleteBill(id).catch((e) => console.warn('Supabase delete bill error:', e));
    showToast('Bill removed', 'Bill removed from tracking.', 'info');
  };

  const toggleBillPaid = (id: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newState = !b.isPaidThisMonth;
          apiUpdateBill(id, { isPaidThisMonth: newState }).catch(() => {});
          showToast(
            newState ? 'Bill marked as paid' : 'Bill marked as unpaid',
            `${b.name} (${formatMoney(b.amount)}) status updated.`,
            newState ? 'success' : 'info'
          );
          return { ...b, isPaidThisMonth: newState };
        }
        return b;
      })
    );
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    apiCreateCategory(newCat).catch((e) => console.warn('Supabase create category error:', e));
    showToast('Category added', `${newCat.name} created.`, 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    apiDeleteCategory(id).catch((e) => console.warn('Supabase delete category error:', e));
    showToast('Category removed', 'Category removed.', 'info');
  };

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    apiCreateNotification(newNotif).catch(() => {});
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    apiUpdateNotification(id, { read: true }).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notifications.forEach((n) => {
      if (!n.read) apiUpdateNotification(n.id, { read: true }).catch(() => {});
    });
    showToast('All caught up', 'All notifications marked as read.', 'info');
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    apiDeleteNotification(id).catch(() => {});
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    apiUpdateSettings(newSettings).catch((e) => console.warn('Supabase update settings error:', e));
    showToast('Preferences updated', 'Settings have been applied.', 'success');
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
    apiUpdateUserProfile(profile).catch((e) => console.warn('Supabase update profile error:', e));
    showToast('Profile updated', 'Your profile details have been saved.', 'success');
  };

  const seedSupabase = async () => {
    try {
      const res = await apiSeedSupabase();
      await refreshData();
      showToast('Database Seeded', res.message || 'Supabase tables seeded with sample data.', 'success');
    } catch (e: any) {
      showToast('Seed Failed', e.message, 'error');
    }
  };

  const resetToSampleData = async () => {
    try {
      await apiResetData();
      await refreshData();
      showToast('Data reset', 'Restored to clean baseline demonstration data in Supabase & local storage.', 'info');
    } catch {
      setUser(INITIAL_USER);
      setSettings(INITIAL_SETTINGS);
      setAccounts(INITIAL_ACCOUNTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setGoals(INITIAL_GOALS);
      setBills(INITIAL_BILLS);
      setCategories(INITIAL_CATEGORIES);
      setNotifications(INITIAL_NOTIFICATIONS);
      showToast('Data reset', 'Restored to clean baseline demonstration data.', 'info');
    }
  };

  const resetData = resetToSampleData;

  const exportData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const data = {
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
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export successful', 'JSON financial backup downloaded.', 'success');
    } else {
      // Export Transactions CSV
      const headers = ['ID', 'Date', 'Title', 'Amount', 'Type', 'Category', 'Account', 'Payment Method', 'Notes', 'Status'];
      const rows = transactions.map((t) => {
        const acc = accounts.find((a) => a.id === t.accountId);
        return [
          t.id,
          t.date,
          `"${t.title.replace(/"/g, '""')}"`,
          t.amount,
          t.type,
          `"${t.category}"`,
          `"${acc?.name || t.accountId}"`,
          `"${t.paymentMethod}"`,
          `"${(t.notes || '').replace(/"/g, '""')}"`,
          t.status,
        ].join(',');
      });
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export successful', 'Transactions CSV report downloaded.', 'success');
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        settings,
        accounts,
        transactions,
        budgets,
        goals,
        bills,
        categories,
        notifications,
        activeView,
        searchQuery,
        isSearchOpen,
        toasts,
        setActiveView,
        setSearchQuery,
        setIsSearchOpen,
        showToast,
        dismissToast,
        isTransactionModalOpen,
        editingTransaction,
        openTransactionModal,
        closeTransactionModal,
        isBudgetModalOpen,
        editingBudget,
        openBudgetModal,
        closeBudgetModal,
        isGoalModalOpen,
        editingGoal,
        openGoalModal,
        closeGoalModal,
        isDepositModalOpen,
        depositGoal,
        openDepositModal,
        closeDepositModal,
        isAccountModalOpen,
        editingAccount,
        openAccountModal,
        closeAccountModal,
        isTransferModalOpen,
        openTransferModal,
        closeTransferModal,
        isBillModalOpen,
        editingBill,
        openBillModal,
        closeBillModal,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        isOnboardingOpen,
        openOnboarding,
        closeOnboarding,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        addBill,
        updateBill,
        deleteBill,
        toggleBillPaid,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        updateSettings,
        updateUserProfile,
        resetToSampleData,
        resetData,
        seedSupabase,
        refreshData,
        supabaseStatus,
        addCategory,
        deleteCategory,
        exportData,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsRate,
        availableCash,
        financialHealth,
        categorySpending,
        formatMoney,
        formatDate,
        getMonthlyTrendData,
        getCategorySpendingData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
