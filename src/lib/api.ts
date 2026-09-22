import {
  Account,
  AppSettings,
  Budget,
  Category,
  NotificationItem,
  RecurringBill,
  SavingsGoal,
  Transaction,
  UserProfile,
} from '../types';

export interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  url: string | null;
  error: string | null;
  tableStats?: Record<string, number>;
  storageType?: string;
}

export interface FullStateResponse {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  bills: RecurringBill[];
  categories: Category[];
  notifications: NotificationItem[];
  user: UserProfile;
  settings: AppSettings;
  supabaseStatus: SupabaseStatus;
}

// Full State
export async function apiGetState(): Promise<FullStateResponse> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Failed to fetch financial state');
  return res.json();
}

// Supabase Status
export async function apiGetSupabaseStatus(refresh = false): Promise<SupabaseStatus> {
  const res = await fetch(`/api/supabase/status${refresh ? '?refresh=true' : ''}`);
  if (!res.ok) throw new Error('Failed to fetch Supabase status');
  return res.json();
}

// Supabase Schema SQL
export async function apiGetSupabaseSchema(): Promise<string> {
  const res = await fetch('/api/supabase/schema');
  if (!res.ok) throw new Error('Failed to fetch Supabase schema');
  return res.text();
}

// Seed Database
export async function apiSeedSupabase(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/supabase/seed', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed Supabase database');
  return res.json();
}

// Reset Database
export async function apiResetData(): Promise<{ success: boolean; message: string; state?: FullStateResponse }> {
  const res = await fetch('/api/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

// Accounts
export async function apiCreateAccount(account: Account): Promise<Account> {
  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  });
  if (!res.ok) throw new Error('Failed to create account');
  return res.json();
}

export async function apiUpdateAccount(id: string, updates: Partial<Account>): Promise<Account> {
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update account');
  return res.json();
}

export async function apiDeleteAccount(id: string): Promise<void> {
  await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
}

// Transactions
export async function apiCreateTransaction(tx: Transaction): Promise<Transaction> {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  return res.json();
}

export async function apiUpdateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  const res = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update transaction');
  return res.json();
}

export async function apiDeleteTransaction(id: string): Promise<void> {
  await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
}

// Budgets
export async function apiCreateBudget(budget: Budget): Promise<Budget> {
  const res = await fetch('/api/budgets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(budget),
  });
  if (!res.ok) throw new Error('Failed to create budget');
  return res.json();
}

export async function apiUpdateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
  const res = await fetch(`/api/budgets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update budget');
  return res.json();
}

export async function apiDeleteBudget(id: string): Promise<void> {
  await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
}

// Savings Goals
export async function apiCreateGoal(goal: SavingsGoal): Promise<SavingsGoal> {
  const res = await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  });
  if (!res.ok) throw new Error('Failed to create goal');
  return res.json();
}

export async function apiUpdateGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
  const res = await fetch(`/api/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update goal');
  return res.json();
}

export async function apiDeleteGoal(id: string): Promise<void> {
  await fetch(`/api/goals/${id}`, { method: 'DELETE' });
}

// Recurring Bills
export async function apiCreateBill(bill: RecurringBill): Promise<RecurringBill> {
  const res = await fetch('/api/bills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bill),
  });
  if (!res.ok) throw new Error('Failed to create bill');
  return res.json();
}

export async function apiUpdateBill(id: string, updates: Partial<RecurringBill>): Promise<RecurringBill> {
  const res = await fetch(`/api/bills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update bill');
  return res.json();
}

export async function apiDeleteBill(id: string): Promise<void> {
  await fetch(`/api/bills/${id}`, { method: 'DELETE' });
}

// Categories
export async function apiCreateCategory(cat: Category): Promise<Category> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cat),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function apiDeleteCategory(id: string): Promise<void> {
  await fetch(`/api/categories/${id}`, { method: 'DELETE' });
}

// Notifications
export async function apiCreateNotification(n: NotificationItem): Promise<NotificationItem> {
  const res = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(n),
  });
  if (!res.ok) throw new Error('Failed to create notification');
  return res.json();
}

export async function apiUpdateNotification(id: string, updates: Partial<NotificationItem>): Promise<NotificationItem> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update notification');
  return res.json();
}

export async function apiDeleteNotification(id: string): Promise<void> {
  await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
}

// User Profile
export async function apiUpdateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
}

// App Settings
export async function apiUpdateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}
