export type AccountType = 'checking' | 'savings' | 'credit' | 'wallet' | 'investment' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  accountNumber?: string;
  institution: string;
  color: string;
  currency: string;
  creditLimit?: number; // for credit accounts
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  paymentMethod: string;
  notes?: string;
  isRecurring?: boolean;
  status: 'completed' | 'pending';
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
  alertThreshold: number; // e.g., 0.8 (80%)
}

export type GoalPriority = 'high' | 'medium' | 'low';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: GoalPriority;
  color: string;
  monthlyContribution?: number;
  notes?: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string; // e.g. "2026-09-25" or day of month
  frequency: 'monthly' | 'yearly' | 'weekly';
  accountId: string;
  autoPay: boolean;
  isPaidThisMonth: boolean;
  providerLogo?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  budgetLimit?: number;
}

export type NotificationType = 
  | 'budget_alert' 
  | 'bill_reminder' 
  | 'goal_milestone' 
  | 'unusual_spending' 
  | 'summary';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  read: boolean;
  severity: 'info' | 'warning' | 'danger' | 'success';
  linkToView?: ActiveView;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  joinedDate: string;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  theme: 'light' | 'dark';
  enableBudgetAlerts: boolean;
  enableBillReminders: boolean;
  enableGoalMilestones: boolean;
  enableWeeklySummary: boolean;
  compactView: boolean;
  twoFactorEnabled: boolean;
}

export type ActiveView = 
  | 'dashboard' 
  | 'transactions' 
  | 'accounts' 
  | 'budgets' 
  | 'goals' 
  | 'analytics' 
  | 'bills' 
  | 'assistant' 
  | 'settings';

export interface FinancialHealthScore {
  score: number; // 0 to 100
  label: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  status: string;
  factors: {
    savingsRate: number;
    budgetAdherence: number;
    debtRatio: number;
    emergencyFundMonths: number;
  };
  recommendations: string[];
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AISearchResult {
  query: string;
  matchedIds: string[];
  explanation: string;
  extractedFilters?: {
    type?: 'income' | 'expense' | 'all';
    category?: string | null;
    minAmount?: number | null;
    maxAmount?: number | null;
    accountName?: string | null;
    paymentMethod?: string | null;
    keywords?: string[];
  };
  totalMatchedAmount?: number;
  source?: 'gemini' | 'heuristic';
}

