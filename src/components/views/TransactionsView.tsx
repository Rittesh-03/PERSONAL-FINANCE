import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Search,
  Plus,
  Download,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Repeat,
  RotateCcw,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, TransactionType, AISearchResult } from '../../types';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    deleteTransaction,
    openTransactionModal,
    accounts,
    categories,
    settings,
    formatMoney,
    formatDate,
    showToast,
  } = useFinance();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // AI Natural Language Search State
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // AI Search Execution
  const executeAISearch = async (queryString?: string) => {
    const q = (queryString || aiQuery).trim();
    if (!q || isAISearching) return;

    if (queryString) {
      setAiQuery(queryString);
    }

    setIsAISearching(true);
    setAiSearchError(null);

    try {
      const response = await fetch('/api/transactions/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          transactions,
          currency: settings.currency,
          currencySymbol: settings.currencySymbol,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AISearchResult = await response.json();
      setAiResult(data);
      setCurrentPage(1);
      showToast('AI Search Complete', `Found ${data.matchedIds.length} matching transaction(s).`, 'success');
    } catch (err: any) {
      console.error('AI search failed:', err);
      setAiSearchError(err.message || 'Unable to execute AI search. Please check your query or try again.');
      showToast('Search Failed', 'Could not complete AI search.', 'danger');
    } finally {
      setIsAISearching(false);
    }
  };

  const clearAISearch = () => {
    setAiResult(null);
    setAiQuery('');
    setAiSearchError(null);
    setCurrentPage(1);
  };

  const SUGGESTED_AI_QUERIES = [
    'Food expenses over ₹50',
    'Income deposits this month',
    'Credit Card charges',
    'Purchases on Chase Bank',
    'Recurring bills and subscriptions',
  ];

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    if (isAIMode && aiResult) {
      const matchedSet = new Set(aiResult.matchedIds);
      list = list.filter((t) => matchedSet.has(t.id));
    } else {
      list = list.filter((t) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchCat && !matchNotes) return false;
        }
        // Type
        if (filterType !== 'all' && t.type !== filterType) return false;
        // Category
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;
        // Account
        if (filterAccount !== 'all' && t.accountId !== filterAccount) return false;

        return true;
      });
    }

    return [...list].sort((a, b) => {
      let compare = 0;
      if (sortField === 'date') {
        compare = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        compare = a.amount - b.amount;
      } else if (sortField === 'title') {
        compare = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? compare : -compare;
    });
  }, [transactions, isAIMode, aiResult, searchQuery, filterType, filterCategory, filterAccount, sortField, sortOrder]);

  // Statistics on filtered data
  const filteredStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedTransactions.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected transaction(s)?`)) {
      selectedIds.forEach((id) => deleteTransaction(id));
      setSelectedIds([]);
      showToast('Transactions removed', `Deleted ${selectedIds.length} records.`, 'info');
    }
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Account', 'Amount', 'PaymentMethod', 'Recurring', 'Notes'];
    const rows = filteredTransactions.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      return [
        t.date,
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        `"${t.category}"`,
        `"${acc?.name || t.accountId}"`,
        t.amount.toFixed(2),
        `"${t.paymentMethod || ''}"`,
        t.isRecurring ? 'Yes' : 'No',
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export successful', 'CSV file downloaded to your system.', 'success');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterAccount('all');
    clearAISearch();
    setCurrentPage(1);
  };

  return (
    <div id="transactions-view" className="space-y-6 pb-12">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Transactions Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor, categorize, and reconcile your cash flow
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={exportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold shadow-2xs transition-colors min-h-[40px] touch-manipulation cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => openTransactionModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[40px] touch-manipulation cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filtered Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs text-xs">
        <div>
          <span className="text-slate-400">Total Income:</span>
          <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            +{formatMoney(filteredStats.income)}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Total Expenses:</span>
          <span className="ml-2 font-bold text-rose-600 dark:text-rose-400 text-sm">
            -{formatMoney(filteredStats.expense)}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Net Flow:</span>
          <span
            className={`ml-2 font-bold text-sm ${
              filteredStats.net >= 0
                ? 'text-slate-900 dark:text-white'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatMoney(filteredStats.net)}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3.5">
        {/* Mode Header Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAIMode(false);
                clearAISearch();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !isAIMode
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Standard Filters
            </button>

            <button
              type="button"
              onClick={() => setIsAIMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isAIMode
                  ? 'bg-emerald-600 text-white shadow-2xs shadow-emerald-500/20'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Natural Language Search
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            {isAIMode ? (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500 inline" />
                Query in natural language e.g. "Food expenses over ₹50"
              </span>
            ) : (
              <span>Filter by keyword, category, account, or type</span>
            )}
          </div>
        </div>

        {/* Content based on Mode */}
        {isAIMode ? (
          <div className="space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeAISearch();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder='Ask AI, e.g. "Food expenses over ₹50", "Purchases on Chase", "Income deposits"...'
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  disabled={isAISearching}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                {aiQuery && (
                  <button
                    type="button"
                    onClick={clearAISearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!aiQuery.trim() || isAISearching}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                {isAISearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Search with AI</span>
                  </>
                )}
              </button>
            </form>

            {/* Suggested Query Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Try asking:</span>
              {SUGGESTED_AI_QUERIES.map((sq) => (
                <button
                  key={sq}
                  type="button"
                  onClick={() => executeAISearch(sq)}
                  disabled={isAISearching}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>

            {/* AI Error Alert */}
            {aiSearchError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                <span>{aiSearchError}</span>
                <button
                  type="button"
                  onClick={() => executeAISearch()}
                  className="font-semibold underline ml-3 shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Active AI Search Result Explanation Banner */}
            {aiResult && (
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white tracking-wide uppercase">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Filter Active
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      "{aiResult.query}"
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={clearAISearch}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear Filter
                  </button>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {aiResult.explanation}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Matched Criteria:</span>
                  {aiResult.extractedFilters?.type && aiResult.extractedFilters.type !== 'all' && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
                      Type: {aiResult.extractedFilters.type}
                    </span>
                  )}
                  {aiResult.extractedFilters?.category && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
                      Category: {aiResult.extractedFilters.category}
                    </span>
                  )}
                  {aiResult.extractedFilters?.minAmount !== null && aiResult.extractedFilters?.minAmount !== undefined && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
                      Min: {settings.currencySymbol}{aiResult.extractedFilters.minAmount}
                    </span>
                  )}
                  {aiResult.extractedFilters?.maxAmount !== null && aiResult.extractedFilters?.maxAmount !== undefined && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
                      Max: {settings.currencySymbol}{aiResult.extractedFilters.maxAmount}
                    </span>
                  )}
                  {aiResult.extractedFilters?.accountName && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
                      Account: {aiResult.extractedFilters.accountName}
                    </span>
                  )}
                  {aiResult.extractedFilters?.paymentMethod && (
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
                      Method: {aiResult.extractedFilters.paymentMethod}
                    </span>
                  )}
                  {typeof aiResult.totalMatchedAmount === 'number' && (
                    <span className="ml-auto font-bold text-slate-800 dark:text-slate-100">
                      Total: {formatMoney(aiResult.totalMatchedAmount)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, note, merchant..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="all">All Types (Income & Expense)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Account Filter */}
            <select
              value={filterAccount}
              onChange={(e) => {
                setFilterAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bulk Action & Active filters reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <span className="text-slate-400">
              Showing {filteredTransactions.length} of {transactions.length} records
              {isAIMode && aiResult && ' (filtered by AI)'}
            </span>
          </div>

          {(searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterAccount !== 'all' || aiResult) && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table & Mobile Card List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Mobile View: Card List (visible on < md screens) */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {isAIMode && aiResult ? (
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No transactions match your AI query
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {aiResult.explanation}
                  </p>
                  <button
                    type="button"
                    onClick={clearAISearch}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear AI Filter
                  </button>
                </div>
              ) : (
                'No transactions match your search or filter settings.'
              )}
            </div>
          ) : (
            paginatedTransactions.map((tx) => {
              const account = accounts.find((a) => a.id === tx.accountId);
              const isSelected = selectedIds.includes(tx.id);
              return (
                <div
                  key={tx.id}
                  className={`p-3.5 space-y-2 transition-colors ${
                    isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(tx.id)}
                        aria-label={`Select ${tx.title}`}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                            {tx.title}
                          </span>
                          {tx.isRecurring && (
                            <span
                              title="Recurring"
                              className="p-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                            >
                              <Repeat className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {formatDate(tx.date)} • {account?.name || 'External'}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm font-bold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatMoney(tx.amount)}
                      </div>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mt-0.5">
                        {tx.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 dark:border-slate-800/60 text-[11px] text-slate-400">
                    <span>{tx.paymentMethod}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openTransactionModal(tx)}
                        aria-label="Edit transaction"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete transaction "${tx.title}"?`)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        aria-label="Delete transaction"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Data Table (visible on md: screens and above) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedTransactions.length > 0 &&
                      paginatedTransactions.every((t) => selectedIds.includes(t.id))
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th
                  className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortField('date');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    if (sortField === 'title') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortField('title');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Description</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4">Category</th>
                <th className="p-4">Account</th>
                <th className="p-4">Method</th>
                <th
                  className="p-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortField('amount');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    {isAIMode && aiResult ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          No transactions match your AI query
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {aiResult.explanation}
                        </p>
                        <button
                          type="button"
                          onClick={clearAISearch}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Clear AI Filter
                        </button>
                      </div>
                    ) : (
                      'No transactions match your search or filter settings.'
                    )}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  const isSelected = selectedIds.includes(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(tx.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{tx.title}</span>
                          {tx.isRecurring && (
                            <span
                              title="Recurring"
                              className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                            >
                              <Repeat className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        {tx.notes && <div className="text-[11px] text-slate-400 font-normal">{tx.notes}</div>}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {account?.name || 'External'}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap font-bold">
                        <span
                          className={
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openTransactionModal(tx)}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete transaction "${tx.title}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
