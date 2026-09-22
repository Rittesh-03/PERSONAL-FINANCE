import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, Check, ArrowRight, ArrowLeft, Wallet, DollarSign, PieChart, Target } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    closeOnboarding,
    updateSettings,
    addTransaction,
    addBudget,
    addGoal,
    showToast,
  } = useFinance();

  const [step, setStep] = useState(1);

  // Step 1: Currency & Monthly Income
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [monthlyIncome, setMonthlyIncome] = useState('75000');

  // Step 2: Account Types
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>([
    'Checking Account',
    'High-Yield Savings',
    'Credit Card',
    'Investment Portfolio',
  ]);

  // Step 3: Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Housing & Rent',
    'Food & Dining',
    'Transportation',
    'Utilities & Bills',
    'Shopping & Retail',
    'Entertainment',
  ]);

  // Step 4: Initial Budget & Goal
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState('45000');
  const [primaryGoalName, setPrimaryGoalName] = useState('Emergency Reserve Fund');
  const [primaryGoalTarget, setPrimaryGoalTarget] = useState('150000');

  if (!isOnboardingOpen) return null;

  const handleCurrencyChange = (curr: string) => {
    setSelectedCurrency(curr);
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: '$',
      AUD: '$',
      JPY: '¥',
      INR: '₹',
    };
    setCurrencySymbol(symbols[curr] || '$');
  };

  const toggleAccountType = (item: string) => {
    setSelectedAccountTypes((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleCategory = (item: string) => {
    setSelectedCategories((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = () => {
    // Apply Settings
    updateSettings({
      currency: selectedCurrency,
      currencySymbol,
    });

    // Optionally seed income transaction if positive
    const incomeNum = parseFloat(monthlyIncome);
    if (!isNaN(incomeNum) && incomeNum > 0) {
      addTransaction({
        date: new Date().toISOString().split('T')[0],
        title: 'Initial Monthly Income',
        amount: incomeNum,
        type: 'income',
        category: 'Salary',
        accountId: 'acc-1',
        paymentMethod: 'Direct Deposit',
        isRecurring: true,
        status: 'completed',
      });
    }

    // Configure primary budget
    const budgetNum = parseFloat(monthlyBudgetLimit);
    if (!isNaN(budgetNum) && budgetNum > 0) {
      addBudget({
        category: 'Food & Dining',
        limit: Math.round(budgetNum * 0.2),
        period: 'monthly',
        alertThreshold: 0.85,
      });
    }

    // Configure primary goal
    const goalNum = parseFloat(primaryGoalTarget);
    if (!isNaN(goalNum) && goalNum > 0 && primaryGoalName.trim()) {
      addGoal({
        name: primaryGoalName.trim(),
        targetAmount: goalNum,
        currentAmount: 0,
        deadline: '2027-06-30',
        category: 'Emergency',
        priority: 'high',
        color: '#10b981',
      });
    }

    showToast('Onboarding complete', 'Your customized finance profile is ready!', 'success');
    closeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="onboarding-modal"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Step indicator */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Personalization Setup • Step {step} of 4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {step === 1 && 'Currency & Baseline Income'}
              {step === 2 && 'Financial Accounts to Track'}
              {step === 3 && 'Primary Spending Categories'}
              {step === 4 && 'Budget Limits & Savings Goals'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeOnboarding}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 shrink-0">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Select your default currency and approximate monthly take-home income so the AI can calibrate your budget guidelines.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Preferred Currency
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`p-2.5 text-center rounded-xl border text-xs font-semibold transition-all ${
                        selectedCurrency === curr.code
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-sm">{curr.symbol}</div>
                      <div>{curr.code}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Estimated Monthly Income ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="100"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="7500"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Which types of financial accounts do you want to manage in your dashboard?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Checking Account', desc: 'Everyday debit and bills', icon: Wallet },
                  { name: 'High-Yield Savings', desc: 'Emergency & reserves (4-5% APY)', icon: DollarSign },
                  { name: 'Credit Card', desc: 'Cashback & points cards', icon: PieChart },
                  { name: 'Investment Portfolio', desc: 'ETFs, stocks, index funds', icon: Target },
                  { name: 'Digital Wallet', desc: 'Apple Cash, PayPal, Venmo', icon: Wallet },
                  { name: 'Cash Reserve', desc: 'Physical cash on hand', icon: DollarSign },
                ].map((acc) => {
                  const isSelected = selectedAccountTypes.includes(acc.name);
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.name}
                      type="button"
                      onClick={() => toggleAccountType(acc.name)}
                      className={`p-3 text-left rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {acc.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{acc.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Select the spending categories you want to actively monitor and budget for:
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  'Housing & Rent',
                  'Food & Dining',
                  'Transportation',
                  'Utilities & Bills',
                  'Shopping & Retail',
                  'Entertainment',
                  'Healthcare & Wellness',
                  'Education & Learning',
                  'Travel & Vacation',
                  'Personal Care',
                  'Investments',
                  'Gifts & Donations',
                ].map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Set your overall target monthly spending cap and your first savings milestone.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Monthly Total Spending Budget Cap ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="100"
                  value={monthlyBudgetLimit}
                  onChange={(e) => setMonthlyBudgetLimit(e.target.value)}
                  placeholder="4500"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Primary Savings Goal
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    value={primaryGoalName}
                    onChange={(e) => setPrimaryGoalName(e.target.value)}
                    placeholder="e.g. Emergency Fund"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Target Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={primaryGoalTarget}
                    onChange={(e) => setPrimaryGoalTarget(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[42px] touch-manipulation cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs min-h-[42px] touch-manipulation cursor-pointer"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs min-h-[42px] touch-manipulation cursor-pointer"
            >
              Complete Setup
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
