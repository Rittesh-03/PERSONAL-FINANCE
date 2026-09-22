import fs from 'fs';
import path from 'path';
import {
  getSupabase,
  testSupabaseConnection,
  fallbackStore,
  toAccountRow,
  fromAccountRow,
  toTransactionRow,
  fromTransactionRow,
  toBudgetRow,
  fromBudgetRow,
  toGoalRow,
  fromGoalRow,
  toBillRow,
  fromBillRow,
  toCategoryRow,
  fromCategoryRow,
  toNotificationRow,
  fromNotificationRow,
  toUserRow,
  fromUserRow,
  toSettingsRow,
  fromSettingsRow,
} from './supabase';

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
} from '../src/data/mockData';

// Initialize fallback store with initial data
fallbackStore.init({
  INITIAL_ACCOUNTS,
  INITIAL_BILLS,
  INITIAL_BUDGETS,
  INITIAL_CATEGORIES,
  INITIAL_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
});

let isInitialized = false;

export async function initDatabase(forceRefresh = false) {
  if (isInitialized && !forceRefresh) return;
  const status = await testSupabaseConnection(forceRefresh);
  if (status.connected) {
    console.log(`Connected to Supabase PostgreSQL at ${status.url}`);
    // Check if initial seed is required
    try {
      const client = getSupabase(forceRefresh);
      if (client) {
        const { data: accData, error: accErr } = await client.from('accounts').select('id').limit(1);
        if (!accErr && (!accData || accData.length === 0)) {
          console.log('Supabase tables are empty. Seeding initial baseline data...');
          await seedDatabase();
        }
      }
    } catch (e: any) {
      console.warn('Initial seed check error:', e.message);
    }
  } else {
    console.log(`Supabase not connected (${status.error || 'unconfigured'}). Operating with in-memory store.`);
  }
  isInitialized = true;
}

export async function getDatabaseStatus(forceRefresh = false) {
  const conn = await testSupabaseConnection(forceRefresh);
  const client = getSupabase(forceRefresh);
  let tableStats: Record<string, number> = {
    accounts: fallbackStore.accounts.length,
    transactions: fallbackStore.transactions.length,
    budgets: fallbackStore.budgets.length,
    goals: fallbackStore.goals.length,
    bills: fallbackStore.bills.length,
    categories: fallbackStore.categories.length,
    notifications: fallbackStore.notifications.length,
  };

  if (conn.connected && client) {
    try {
      const [
        { count: accCount },
        { count: txCount },
        { count: bCount },
        { count: gCount },
        { count: billCount },
        { count: catCount },
        { count: notifCount },
      ] = await Promise.all([
        client.from('accounts').select('*', { count: 'exact', head: true }),
        client.from('transactions').select('*', { count: 'exact', head: true }),
        client.from('budgets').select('*', { count: 'exact', head: true }),
        client.from('savings_goals').select('*', { count: 'exact', head: true }),
        client.from('recurring_bills').select('*', { count: 'exact', head: true }),
        client.from('categories').select('*', { count: 'exact', head: true }),
        client.from('notifications').select('*', { count: 'exact', head: true }),
      ]);

      tableStats = {
        accounts: accCount ?? 0,
        transactions: txCount ?? 0,
        budgets: bCount ?? 0,
        goals: gCount ?? 0,
        bills: billCount ?? 0,
        categories: catCount ?? 0,
        notifications: notifCount ?? 0,
      };

      // If connected but tables are empty, populate baseline financial records
      if ((accCount ?? 0) === 0 && (txCount ?? 0) === 0 && (catCount ?? 0) === 0) {
        console.log('Connected to fresh Supabase project. Populating baseline financial records...');
        await seedDatabase();
        tableStats = {
          accounts: INITIAL_ACCOUNTS.length,
          transactions: INITIAL_TRANSACTIONS.length,
          budgets: INITIAL_BUDGETS.length,
          goals: INITIAL_GOALS.length,
          bills: INITIAL_BILLS.length,
          categories: INITIAL_CATEGORIES.length,
          notifications: INITIAL_NOTIFICATIONS.length,
        };
      }
    } catch (e: any) {
      console.warn('Failed to fetch table counts from Supabase:', e.message);
    }
  }

  return {
    ...conn,
    tableStats,
    storageType: conn.connected ? 'Supabase PostgreSQL' : 'Local / In-Memory Fallback',
  };
}

export function getSchemaSql(): string {
  try {
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      return fs.readFileSync(schemaPath, 'utf8');
    }
  } catch (err: any) {
    console.error('Error reading schema.sql:', err.message);
  }
  return '-- schema.sql not found';
}

export async function seedDatabase() {
  const client = getSupabase();
  if (client) {
    try {
      // 1. Categories
      const catRows = INITIAL_CATEGORIES.map(toCategoryRow);
      await client.from('categories').upsert(catRows, { onConflict: 'id' });

      // 2. Accounts
      const accRows = INITIAL_ACCOUNTS.map(toAccountRow);
      await client.from('accounts').upsert(accRows, { onConflict: 'id' });

      // 3. Transactions
      const txRows = INITIAL_TRANSACTIONS.map(toTransactionRow);
      await client.from('transactions').upsert(txRows, { onConflict: 'id' });

      // 4. Budgets
      const bRows = INITIAL_BUDGETS.map(toBudgetRow);
      await client.from('budgets').upsert(bRows, { onConflict: 'id' });

      // 5. Goals
      const gRows = INITIAL_GOALS.map(toGoalRow);
      await client.from('savings_goals').upsert(gRows, { onConflict: 'id' });

      // 6. Bills
      const billRows = INITIAL_BILLS.map(toBillRow);
      await client.from('recurring_bills').upsert(billRows, { onConflict: 'id' });

      // 7. Notifications
      const notifRows = INITIAL_NOTIFICATIONS.map(toNotificationRow);
      await client.from('notifications').upsert(notifRows, { onConflict: 'id' });

      // 8. User Profile
      const uRow = toUserRow(INITIAL_USER);
      await client.from('user_profiles').upsert([uRow], { onConflict: 'id' });

      // 9. App Settings
      const sRow = toSettingsRow(INITIAL_SETTINGS);
      await client.from('app_settings').upsert([sRow], { onConflict: 'id' });

      console.log('Seeded Supabase PostgreSQL successfully.');
    } catch (e: any) {
      console.error('Error seeding Supabase:', e.message);
      throw e;
    }
  }

  // Also reset fallback store
  fallbackStore.init({
    INITIAL_ACCOUNTS,
    INITIAL_BILLS,
    INITIAL_BUDGETS,
    INITIAL_CATEGORIES,
    INITIAL_GOALS,
    INITIAL_NOTIFICATIONS,
    INITIAL_SETTINGS,
    INITIAL_TRANSACTIONS,
    INITIAL_USER,
  });

  return { success: true, message: 'Database populated with initial dataset.' };
}

// ==========================================
// Accounts Service
// ==========================================
export async function getAccounts() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('accounts').select('*').order('name');
    if (!error && data) {
      return data.map(fromAccountRow);
    }
  }
  return fallbackStore.accounts;
}

export async function createAccount(acc: any) {
  const client = getSupabase();
  if (client) {
    const row = toAccountRow(acc);
    const { data, error } = await client.from('accounts').insert([row]).select().single();
    if (!error && data) {
      return fromAccountRow(data);
    }
  }
  fallbackStore.accounts.push(acc);
  return acc;
}

export async function updateAccount(id: string, updates: any) {
  const client = getSupabase();
  if (client) {
    const rowUpdates: any = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.type !== undefined) rowUpdates.type = updates.type;
    if (updates.balance !== undefined) rowUpdates.balance = updates.balance;
    if (updates.accountNumber !== undefined) rowUpdates.account_number = updates.accountNumber;
    if (updates.institution !== undefined) rowUpdates.institution = updates.institution;
    if (updates.color !== undefined) rowUpdates.color = updates.color;
    if (updates.currency !== undefined) rowUpdates.currency = updates.currency;
    if (updates.creditLimit !== undefined) rowUpdates.credit_limit = updates.creditLimit;
    rowUpdates.updated_at = new Date().toISOString();

    const { data, error } = await client.from('accounts').update(rowUpdates).eq('id', id).select().single();
    if (!error && data) {
      return fromAccountRow(data);
    }
  }

  const idx = fallbackStore.accounts.findIndex((a) => a.id === id);
  if (idx !== -1) {
    fallbackStore.accounts[idx] = { ...fallbackStore.accounts[idx], ...updates, updatedAt: new Date().toISOString() };
    return fallbackStore.accounts[idx];
  }
  return null;
}

export async function deleteAccount(id: string) {
  const client = getSupabase();
  if (client) {
    await client.from('accounts').delete().eq('id', id);
  }
  fallbackStore.accounts = fallbackStore.accounts.filter((a) => a.id !== id);
  return { success: true };
}

// ==========================================
// Transactions Service
// ==========================================
export async function getTransactions() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('transactions').select('*').order('date', { ascending: false });
    if (!error && data) {
      return data.map(fromTransactionRow);
    }
  }
  return fallbackStore.transactions;
}

export async function createTransaction(tx: any) {
  const client = getSupabase();
  if (client) {
    const row = toTransactionRow(tx);
    const { data, error } = await client.from('transactions').insert([row]).select().single();
    if (!error && data) {
      // Also update account balance in Supabase
      const { data: acc } = await client.from('accounts').select('balance').eq('id', tx.accountId).single();
      if (acc) {
        const delta = tx.type === 'income' ? tx.amount : -tx.amount;
        await client
          .from('accounts')
          .update({
            balance: Number((Number(acc.balance) + delta).toFixed(2)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', tx.accountId);
      }
      return fromTransactionRow(data);
    }
  }

  fallbackStore.transactions.unshift(tx);
  // Update fallback account balance
  const accIdx = fallbackStore.accounts.findIndex((a) => a.id === tx.accountId);
  if (accIdx !== -1) {
    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    fallbackStore.accounts[accIdx].balance = Number(
      (fallbackStore.accounts[accIdx].balance + delta).toFixed(2)
    );
  }
  return tx;
}

export async function updateTransaction(id: string, updates: any) {
  const client = getSupabase();
  if (client) {
    const rowUpdates: any = {};
    if (updates.date !== undefined) rowUpdates.date = updates.date;
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.amount !== undefined) rowUpdates.amount = updates.amount;
    if (updates.type !== undefined) rowUpdates.type = updates.type;
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.accountId !== undefined) rowUpdates.account_id = updates.accountId;
    if (updates.paymentMethod !== undefined) rowUpdates.payment_method = updates.paymentMethod;
    if (updates.notes !== undefined) rowUpdates.notes = updates.notes;
    if (updates.isRecurring !== undefined) rowUpdates.is_recurring = updates.isRecurring;
    if (updates.status !== undefined) rowUpdates.status = updates.status;

    const { data, error } = await client.from('transactions').update(rowUpdates).eq('id', id).select().single();
    if (!error && data) {
      return fromTransactionRow(data);
    }
  }

  const idx = fallbackStore.transactions.findIndex((t) => t.id === id);
  if (idx !== -1) {
    fallbackStore.transactions[idx] = { ...fallbackStore.transactions[idx], ...updates };
    return fallbackStore.transactions[idx];
  }
  return null;
}

export async function deleteTransaction(id: string) {
  const client = getSupabase();
  if (client) {
    // Check old transaction for balance reversal
    const { data: tx } = await client.from('transactions').select('*').eq('id', id).single();
    if (tx) {
      const { data: acc } = await client.from('accounts').select('balance').eq('id', tx.account_id).single();
      if (acc) {
        const delta = tx.type === 'income' ? -Number(tx.amount) : Number(tx.amount);
        await client
          .from('accounts')
          .update({
            balance: Number((Number(acc.balance) + delta).toFixed(2)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', tx.account_id);
      }
    }
    await client.from('transactions').delete().eq('id', id);
  }

  const tx = fallbackStore.transactions.find((t) => t.id === id);
  if (tx) {
    const accIdx = fallbackStore.accounts.findIndex((a) => a.id === tx.accountId);
    if (accIdx !== -1) {
      const delta = tx.type === 'income' ? -tx.amount : tx.amount;
      fallbackStore.accounts[accIdx].balance = Number(
        (fallbackStore.accounts[accIdx].balance + delta).toFixed(2)
      );
    }
  }
  fallbackStore.transactions = fallbackStore.transactions.filter((t) => t.id !== id);
  return { success: true };
}

// ==========================================
// Budgets Service
// ==========================================
export async function getBudgets() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('budgets').select('*');
    if (!error && data) {
      return data.map(fromBudgetRow);
    }
  }
  return fallbackStore.budgets;
}

export async function createBudget(b: any) {
  const client = getSupabase();
  if (client) {
    const row = toBudgetRow(b);
    const { data, error } = await client.from('budgets').insert([row]).select().single();
    if (!error && data) {
      return fromBudgetRow(data);
    }
  }
  fallbackStore.budgets.push(b);
  return b;
}

export async function updateBudget(id: string, updates: any) {
  const client = getSupabase();
  if (client) {
    const rowUpdates: any = {};
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.limit !== undefined) rowUpdates.limit_amount = updates.limit;
    if (updates.spent !== undefined) rowUpdates.spent = updates.spent;
    if (updates.period !== undefined) rowUpdates.period = updates.period;
    if (updates.startDate !== undefined) rowUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) rowUpdates.end_date = updates.endDate;
    if (updates.alertThreshold !== undefined) rowUpdates.alert_threshold = updates.alertThreshold;

    const { data, error } = await client.from('budgets').update(rowUpdates).eq('id', id).select().single();
    if (!error && data) {
      return fromBudgetRow(data);
    }
  }

  const idx = fallbackStore.budgets.findIndex((b) => b.id === id);
  if (idx !== -1) {
    fallbackStore.budgets[idx] = { ...fallbackStore.budgets[idx], ...updates };
    return fallbackStore.budgets[idx];
  }
  return null;
}

export async function deleteBudget(id: string) {
  const client = getSupabase();
  if (client) {
    await client.from('budgets').delete().eq('id', id);
  }
  fallbackStore.budgets = fallbackStore.budgets.filter((b) => b.id !== id);
  return { success: true };
}

// ==========================================
// Savings Goals Service
// ==========================================
export async function getGoals() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('savings_goals').select('*');
    if (!error && data) {
      return data.map(fromGoalRow);
    }
  }
  return fallbackStore.goals;
}

export async function createGoal(g: any) {
  const client = getSupabase();
  if (client) {
    const row = toGoalRow(g);
    const { data, error } = await client.from('savings_goals').insert([row]).select().single();
    if (!error && data) {
      return fromGoalRow(data);
    }
  }
  fallbackStore.goals.push(g);
  return g;
}

export async function updateGoal(id: string, updates: any) {
  const client = getSupabase();
  if (client) {
    const rowUpdates: any = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.targetAmount !== undefined) rowUpdates.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) rowUpdates.current_amount = updates.currentAmount;
    if (updates.deadline !== undefined) rowUpdates.deadline = updates.deadline;
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.priority !== undefined) rowUpdates.priority = updates.priority;
    if (updates.color !== undefined) rowUpdates.color = updates.color;
    if (updates.monthlyContribution !== undefined) rowUpdates.monthly_contribution = updates.monthlyContribution;
    if (updates.notes !== undefined) rowUpdates.notes = updates.notes;

    const { data, error } = await client.from('savings_goals').update(rowUpdates).eq('id', id).select().single();
    if (!error && data) {
      return fromGoalRow(data);
    }
  }

  const idx = fallbackStore.goals.findIndex((g) => g.id === id);
  if (idx !== -1) {
    fallbackStore.goals[idx] = { ...fallbackStore.goals[idx], ...updates };
    return fallbackStore.goals[idx];
  }
  return null;
}

export async function deleteGoal(id: string) {
  const client = getSupabase();
  if (client) {
    await client.from('savings_goals').delete().eq('id', id);
  }
  fallbackStore.goals = fallbackStore.goals.filter((g) => g.id !== id);
  return { success: true };
}

// ==========================================
// Recurring Bills Service
// ==========================================
export async function getBills() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('recurring_bills').select('*');
    if (!error && data) {
      return data.map(fromBillRow);
    }
  }
  return fallbackStore.bills;
}

export async function createBill(b: any) {
  const client = getSupabase();
  if (client) {
    const row = toBillRow(b);
    const { data, error } = await client.from('recurring_bills').insert([row]).select().single();
    if (!error && data) {
      return fromBillRow(data);
    }
  }
  fallbackStore.bills.push(b);
  return b;
}

export async function updateBill(id: string, updates: any) {
  const client = getSupabase();
  if (client) {
    const rowUpdates: any = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.amount !== undefined) rowUpdates.amount = updates.amount;
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.dueDate !== undefined) rowUpdates.due_date = updates.dueDate;
    if (updates.frequency !== undefined) rowUpdates.frequency = updates.frequency;
    if (updates.accountId !== undefined) rowUpdates.account_id = updates.accountId;
    if (updates.autoPay !== undefined) rowUpdates.auto_pay = updates.autoPay;
    if (updates.isPaidThisMonth !== undefined) rowUpdates.is_paid_this_month = updates.isPaidThisMonth;
    if (updates.providerLogo !== undefined) rowUpdates.provider_logo = updates.providerLogo;

    const { data, error } = await client.from('recurring_bills').update(rowUpdates).eq('id', id).select().single();
    if (!error && data) {
      return fromBillRow(data);
    }
  }

  const idx = fallbackStore.bills.findIndex((b) => b.id === id);
  if (idx !== -1) {
    fallbackStore.bills[idx] = { ...fallbackStore.bills[idx], ...updates };
    return fallbackStore.bills[idx];
  }
  return null;
}

export async function deleteBill(id: string) {
  const client = getSupabase();
  if (client) {
    await client.from('recurring_bills').delete().eq('id', id);
  }
  fallbackStore.bills = fallbackStore.bills.filter((b) => b.id !== id);
  return { success: true };
}

// ==========================================
// Categories Service
// ==========================================
export async function getCategories() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('categories').select('*');
    if (!error && data) {
      return data.map(fromCategoryRow);
    }
  }
  return fallbackStore.categories;
}

export async function createCategory(cat: any) {
  const client = getSupabase();
  if (client) {
    const row = toCategoryRow(cat);
    const { data, error } = await client.from('categories').insert([row]).select().single();
    if (!error && data) {
      return fromCategoryRow(data);
    }
  }
  fallbackStore.categories.push(cat);
  return cat;
}

export async function deleteCategory(id: string) {
  const client = getSupabase();
  if (client) {
    await client.from('categories').delete().eq('id', id);
  }
  fallbackStore.categories = fallbackStore.categories.filter((c) => c.id !== id);
  return { success: true };
}

// ==========================================
// Notifications Service
// ==========================================
export async function getNotifications() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('notifications').select('*').order('date', { ascending: false });
    if (!error && data) {
      return data.map(fromNotificationRow);
    }
  }
  return fallbackStore.notifications;
}

export async function createNotification(n: any) {
  const client = getSupabase();
  if (client) {
    const row = toNotificationRow(n);
    const { data, error } = await client.from('notifications').insert([row]).select().single();
    if (!error && data) {
      return fromNotificationRow(data);
    }
  }
  fallbackStore.notifications.unshift(n);
  return n;
}

export async function updateNotification(id: string, updates: any) {
  const client = getSupabase();
  if (client) {
    const rowUpdates: any = {};
    if (updates.read !== undefined) rowUpdates.read = updates.read;
    const { data, error } = await client.from('notifications').update(rowUpdates).eq('id', id).select().single();
    if (!error && data) {
      return fromNotificationRow(data);
    }
  }
  const idx = fallbackStore.notifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    fallbackStore.notifications[idx] = { ...fallbackStore.notifications[idx], ...updates };
    return fallbackStore.notifications[idx];
  }
  return null;
}

export async function deleteNotification(id: string) {
  const client = getSupabase();
  if (client) {
    await client.from('notifications').delete().eq('id', id);
  }
  fallbackStore.notifications = fallbackStore.notifications.filter((n) => n.id !== id);
  return { success: true };
}

// ==========================================
// User Profile Service
// ==========================================
export async function getUserProfile() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('user_profiles').select('*').eq('id', 'current-user').single();
    if (!error && data) {
      return fromUserRow(data);
    }
  }
  return fallbackStore.user;
}

export async function updateUserProfile(profile: any) {
  const client = getSupabase();
  if (client) {
    const current = await getUserProfile();
    const merged = { ...current, ...profile };
    const row = toUserRow(merged);
    const { data, error } = await client.from('user_profiles').upsert([row], { onConflict: 'id' }).select().single();
    if (!error && data) {
      return fromUserRow(data);
    }
  }
  fallbackStore.user = { ...fallbackStore.user, ...profile };
  return fallbackStore.user;
}

// ==========================================
// App Settings Service
// ==========================================
export async function getAppSettings() {
  const client = getSupabase();
  if (client) {
    const { data, error } = await client.from('app_settings').select('*').eq('id', 'current-settings').single();
    if (!error && data) {
      return fromSettingsRow(data);
    }
  }
  return fallbackStore.settings;
}

export async function updateAppSettings(settings: any) {
  const client = getSupabase();
  if (client) {
    const current = await getAppSettings();
    const merged = { ...current, ...settings };
    const row = toSettingsRow(merged);
    const { data, error } = await client.from('app_settings').upsert([row], { onConflict: 'id' }).select().single();
    if (!error && data) {
      return fromSettingsRow(data);
    }
  }
  fallbackStore.settings = { ...fallbackStore.settings, ...settings };
  return fallbackStore.settings;
}

// ==========================================
// Full State Snapshot (Fast Initial Hydration)
// ==========================================
export async function getFullState() {
  const [
    accounts,
    transactions,
    budgets,
    goals,
    bills,
    categories,
    notifications,
    user,
    settings,
    status,
  ] = await Promise.all([
    getAccounts(),
    getTransactions(),
    getBudgets(),
    getGoals(),
    getBills(),
    getCategories(),
    getNotifications(),
    getUserProfile(),
    getAppSettings(),
    getDatabaseStatus(),
  ]);

  return {
    accounts,
    transactions,
    budgets,
    goals,
    bills,
    categories,
    notifications,
    user,
    settings,
    supabaseStatus: status,
  };
}
