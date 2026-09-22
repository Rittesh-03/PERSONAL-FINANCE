import { createClient, SupabaseClient } from '@supabase/supabase-js';

// URL Normalizer: handles trailing slashes, /rest/v1 suffixes, whitespace, and quotes
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip surrounding quotes if present
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // Strip /rest/v1 or /rest/v1/ if user pasted the REST API URL from Supabase dashboard
  url = url.replace(/\/rest\/v1\/?$/, '');
  // Final strip of any remaining trailing slash
  url = url.replace(/\/+$/, '');
  return url;
}

export function getSupabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL || '';
  const url = normalizeSupabaseUrl(rawUrl);
  let key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return { url, key, rawUrl };
}

let supabaseClient: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;
let connectionTested = false;
let isConnected = false;
let lastError: string | null = null;

export function getSupabase(forceRefresh = false): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    supabaseClient = null;
    return null;
  }

  if (supabaseClient && !forceRefresh && cachedUrl === url && cachedKey === key) {
    return supabaseClient;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedUrl = url;
    cachedKey = key;
    return supabaseClient;
  } catch (err: any) {
    console.error('Failed to initialize Supabase client:', err.message);
    lastError = err.message;
    supabaseClient = null;
    return null;
  }
}

export async function testSupabaseConnection(forceRefresh = false): Promise<{
  configured: boolean;
  connected: boolean;
  url: string | null;
  error: string | null;
}> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return {
      configured: false,
      connected: false,
      url: null,
      error: 'SUPABASE_URL and SUPABASE_ANON_KEY are not configured.',
    };
  }

  const client = getSupabase(forceRefresh);
  if (!client) {
    return {
      configured: true,
      connected: false,
      url: url.replace(/^(https?:\/\/[^/]+).*$/, '$1'),
      error: lastError || 'Failed to initialize Supabase client.',
    };
  }

  try {
    // Attempt a quick lightweight query on categories or accounts
    const { error } = await client.from('categories').select('id').limit(1);
    if (error) {
      // If table does not exist, connection is valid but schema may not be created yet
      if (error.code === '42P01') {
        isConnected = true;
        lastError = 'Connected to PostgreSQL, but tables need to be created. Please run schema.sql.';
        return {
          configured: true,
          connected: true,
          url: url.replace(/^(https?:\/\/[^/]+).*$/, '$1'),
          error: lastError,
        };
      }
      isConnected = false;
      lastError = error.message;
      return {
        configured: true,
        connected: false,
        url: url.replace(/^(https?:\/\/[^/]+).*$/, '$1'),
        error: error.message,
      };
    }

    isConnected = true;
    lastError = null;
    connectionTested = true;
    return {
      configured: true,
      connected: true,
      url: url.replace(/^(https?:\/\/[^/]+).*$/, '$1'),
      error: null,
    };
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
    return {
      configured: true,
      connected: false,
      url: url ? url.replace(/^(https?:\/\/[^/]+).*$/, '$1') : null,
      error: err.message,
    };
  }
}

// In-Memory Fallback State when Supabase is not yet configured by user
export class FallbackStore {
  user: any = null;
  settings: any = null;
  accounts: any[] = [];
  transactions: any[] = [];
  budgets: any[] = [];
  goals: any[] = [];
  bills: any[] = [];
  categories: any[] = [];
  notifications: any[] = [];

  init(data: any) {
    this.user = { ...data.INITIAL_USER };
    this.settings = { ...data.INITIAL_SETTINGS };
    this.accounts = [...data.INITIAL_ACCOUNTS];
    this.transactions = [...data.INITIAL_TRANSACTIONS];
    this.budgets = [...data.INITIAL_BUDGETS];
    this.goals = [...data.INITIAL_GOALS];
    this.bills = [...data.INITIAL_BILLS];
    this.categories = [...data.INITIAL_CATEGORIES];
    this.notifications = [...data.INITIAL_NOTIFICATIONS];
  }
}

export const fallbackStore = new FallbackStore();

// ==========================================
// Adapters: CamelCase <-> SnakeCase Mappings
// ==========================================

export function toAccountRow(acc: any) {
  return {
    id: acc.id,
    name: acc.name,
    type: acc.type,
    balance: acc.balance,
    account_number: acc.accountNumber || null,
    institution: acc.institution,
    color: acc.color,
    currency: acc.currency,
    credit_limit: acc.creditLimit || null,
    updated_at: acc.updatedAt || new Date().toISOString(),
  };
}

export function fromAccountRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    balance: Number(row.balance),
    accountNumber: row.account_number || undefined,
    institution: row.institution,
    color: row.color,
    currency: row.currency,
    creditLimit: row.credit_limit ? Number(row.credit_limit) : undefined,
    updatedAt: row.updated_at,
  };
}

export function toTransactionRow(tx: any) {
  return {
    id: tx.id,
    date: tx.date,
    title: tx.title,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    account_id: tx.accountId,
    payment_method: tx.paymentMethod,
    notes: tx.notes || null,
    is_recurring: Boolean(tx.isRecurring),
    status: tx.status || 'completed',
  };
}

export function fromTransactionRow(row: any) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    accountId: row.account_id,
    paymentMethod: row.payment_method,
    notes: row.notes || undefined,
    isRecurring: Boolean(row.is_recurring),
    status: row.status,
  };
}

export function toBudgetRow(b: any) {
  return {
    id: b.id,
    category: b.category,
    limit_amount: b.limit,
    spent: b.spent || 0,
    period: b.period || 'monthly',
    start_date: b.startDate || null,
    end_date: b.endDate || null,
    alert_threshold: b.alertThreshold || 0.8,
  };
}

export function fromBudgetRow(row: any) {
  return {
    id: row.id,
    category: row.category,
    limit: Number(row.limit_amount),
    spent: Number(row.spent || 0),
    period: row.period,
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    alertThreshold: Number(row.alert_threshold),
  };
}

export function toGoalRow(g: any) {
  return {
    id: g.id,
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount || 0,
    deadline: g.deadline,
    category: g.category,
    priority: g.priority,
    color: g.color,
    monthly_contribution: g.monthlyContribution || null,
    notes: g.notes || null,
  };
}

export function fromGoalRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount || 0),
    deadline: row.deadline,
    category: row.category,
    priority: row.priority,
    color: row.color,
    monthlyContribution: row.monthly_contribution ? Number(row.monthly_contribution) : undefined,
    notes: row.notes || undefined,
  };
}

export function toBillRow(b: any) {
  return {
    id: b.id,
    name: b.name,
    amount: b.amount,
    category: b.category,
    due_date: b.dueDate,
    frequency: b.frequency,
    account_id: b.accountId || null,
    auto_pay: Boolean(b.autoPay),
    is_paid_this_month: Boolean(b.isPaidThisMonth),
    provider_logo: b.providerLogo || null,
  };
}

export function fromBillRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    category: row.category,
    dueDate: row.due_date,
    frequency: row.frequency,
    accountId: row.account_id || '',
    autoPay: Boolean(row.auto_pay),
    isPaidThisMonth: Boolean(row.is_paid_this_month),
    providerLogo: row.provider_logo || undefined,
  };
}

export function toCategoryRow(c: any) {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon || 'Folder',
    color: c.color || '#64748b',
    budget_limit: c.budgetLimit || null,
  };
}

export function fromCategoryRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    color: row.color,
    budgetLimit: row.budget_limit ? Number(row.budget_limit) : undefined,
  };
}

export function toNotificationRow(n: any) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    date: n.date || new Date().toISOString(),
    read: Boolean(n.read),
    severity: n.severity,
    link_to_view: n.linkToView || null,
  };
}

export function fromNotificationRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    date: row.date,
    read: Boolean(row.read),
    severity: row.severity,
    linkToView: row.link_to_view || undefined,
  };
}

export function toUserRow(u: any) {
  return {
    id: 'current-user',
    name: u.name,
    email: u.email,
    role: u.role,
    avatar_url: u.avatarUrl || null,
    joined_date: u.joinedDate,
    updated_at: new Date().toISOString(),
  };
}

export function fromUserRow(row: any) {
  return {
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url || undefined,
    joinedDate: row.joined_date,
  };
}

export function toSettingsRow(s: any) {
  return {
    id: 'current-settings',
    currency: s.currency,
    currency_symbol: s.currencySymbol,
    theme: s.theme,
    enable_budget_alerts: Boolean(s.enableBudgetAlerts),
    enable_bill_reminders: Boolean(s.enableBillReminders),
    enable_goal_milestones: Boolean(s.enableGoalMilestones),
    enable_weekly_summary: Boolean(s.enableWeeklySummary),
    compact_view: Boolean(s.compactView),
    two_factor_enabled: Boolean(s.twoFactorEnabled),
    updated_at: new Date().toISOString(),
  };
}

export function fromSettingsRow(row: any) {
  return {
    currency: row.currency,
    currencySymbol: row.currency_symbol,
    theme: row.theme,
    enableBudgetAlerts: Boolean(row.enable_budget_alerts),
    enableBillReminders: Boolean(row.enable_bill_reminders),
    enableGoalMilestones: Boolean(row.enable_goal_milestones),
    enableWeeklySummary: Boolean(row.enable_weekly_summary),
    compactView: Boolean(row.compact_view),
    twoFactorEnabled: Boolean(row.two_factor_enabled),
  };
}
