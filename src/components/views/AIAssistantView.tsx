import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { AssistantMessage } from '../../types';

export const AIAssistantView: React.FC = () => {
  const {
    transactions,
    accounts,
    budgets,
    goals,
    bills,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    financialHealth,
    settings,
  } = useFinance();

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **Apex AI Financial Advisor**, powered by Google's Gemini 3.8 model.

I have real-time visibility into your accounts, budgets, transactions, and savings goals. Here is a quick snapshot of where you stand today:
- **Net Balance:** ${settings.currencySymbol}${totalBalance.toLocaleString()}
- **Monthly Savings Rate:** ${savingsRate}%
- **Financial Health Score:** ${financialHealth.score}/100 (${financialHealth.status})

How can I assist you with your wealth strategy, monthly budget, or expense analysis today?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const SUGGESTED_PROMPTS = [
    'How much did I spend this month?',
    'Where am I spending the most?',
    'Summarize my financial progress',
    'Help me create a monthly budget',
    'How much have I saved toward my vacation?',
    'Show me my recurring expenses',
    'What changed compared with last month?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    // Prepare context snapshot
    const financialContext = {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      financialHealth,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      accounts: accounts.map((a) => ({
        name: a.name,
        type: a.type,
        balance: a.balance,
        institution: a.institution,
      })),
      budgets: budgets.map((b) => ({
        category: b.category,
        limit: b.limit,
        spent: b.spent,
      })),
      goals: goals.map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        priority: g.priority,
      })),
      bills: bills.map((b) => ({
        name: b.name,
        amount: b.amount,
        dueDate: b.dueDate,
        frequency: b.frequency,
        isPaid: b.isPaidThisMonth,
      })),
      recentTransactions: transactions.slice(0, 15).map((t) => ({
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      })),
    };

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          financialContext,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: AssistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Analysis complete.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Error contacting AI assistant:', err);
      // Construct helpful offline fallback
      let fallbackText = `I encountered a momentary connectivity issue. Here is a direct analysis from your live records:\n\n` +
        `• **Current Balance:** ${settings.currencySymbol}${totalBalance.toLocaleString()}\n` +
        `• **Monthly Spending:** ${settings.currencySymbol}${monthlyExpenses.toLocaleString()}\n` +
        `• **Savings Rate:** ${savingsRate}% (${settings.currencySymbol}${monthlySavings.toLocaleString()} retained)\n` +
        `• **Budget Alert:** You have ${budgets.filter((b) => b.spent > b.limit).length} category over budget. Consider shifting discretionary dining capital into savings.`;

      const errorMessage: AssistantMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat history cleared. How can I help you analyze your finances today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div id="ai-assistant-view" className="h-[calc(100vh-140px)] flex flex-col space-y-4 pb-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Financial Assistant
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time conversational financial reasoning, goal pacing, and portfolio insights
          </p>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1">
        <span className="text-xs font-semibold text-slate-400 shrink-0">Prompts:</span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium transition-colors shadow-2xs disabled:opacity-50 touch-manipulation min-h-[36px] cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Chat Stream */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4 text-slate-950" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm leading-relaxed relative group ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {m.content}
                </div>

                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopy(m.id, m.content)}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Copy text"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 sm:gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-xs">
              <Bot className="w-4 h-4 text-slate-950 animate-pulse" />
            </div>
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 border border-slate-100 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>Analyzing finances and generating report...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ask about spending velocity, vacation savings, or recommendations..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white shadow-2xs min-h-[48px]"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            aria-label="Send message"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs touch-manipulation min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
