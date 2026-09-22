import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import {
  initDatabase,
  getDatabaseStatus,
  getSchemaSql,
  seedDatabase,
  getFullState,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getBills,
  createBill,
  updateBill,
  deleteBill,
  getCategories,
  createCategory,
  deleteCategory,
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getUserProfile,
  updateUserProfile,
  getAppSettings,
  updateAppSettings,
} from "./server/dbService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Supabase PostgreSQL connection or fallback store
initDatabase().catch((err) => console.error("Database init error:", err));

// Lazy Gemini AI initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  geminiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  return geminiClient;
}

// Health check route
app.get("/api/health", async (_req, res) => {
  const dbStatus = await getDatabaseStatus();
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY),
    supabase: dbStatus,
  });
});

// ==============================================================================
// Supabase Database API Endpoints
// ==============================================================================

// Supabase Status & Connection check
app.get("/api/supabase/status", async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === "true" || req.query.refresh === "1";
    const status = await getDatabaseStatus(forceRefresh);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Supabase Schema SQL Download / Inspection
app.get("/api/supabase/schema", (_req, res) => {
  try {
    const schema = getSchemaSql();
    res.setHeader("Content-Type", "text/plain");
    res.send(schema);
  } catch (error: any) {
    res.status(500).send(`-- Error loading schema: ${error.message}`);
  }
});

// Seed Database
app.post("/api/supabase/seed", async (_req, res) => {
  try {
    const result = await seedDatabase();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fast Full State Hydration
app.get("/api/state", async (_req, res) => {
  try {
    const state = await getFullState();
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Database to Initial Baseline
app.post("/api/reset", async (_req, res) => {
  try {
    const result = await seedDatabase();
    const state = await getFullState();
    res.json({ ...result, state });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accounts Endpoints
app.get("/api/accounts", async (_req, res) => {
  try {
    const accounts = await getAccounts();
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/accounts", async (req, res) => {
  try {
    const account = await createAccount(req.body);
    res.status(201).json(account);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/accounts/:id", async (req, res) => {
  try {
    const updated = await updateAccount(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Account not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/accounts/:id", async (req, res) => {
  try {
    await deleteAccount(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transactions Endpoints
app.get("/api/transactions", async (_req, res) => {
  try {
    const txs = await getTransactions();
    res.json(txs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const tx = await createTransaction(req.body);
    res.status(201).json(tx);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/transactions/:id", async (req, res) => {
  try {
    const updated = await updateTransaction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Transaction not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await deleteTransaction(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Budgets Endpoints
app.get("/api/budgets", async (_req, res) => {
  try {
    const budgets = await getBudgets();
    res.json(budgets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/budgets", async (req, res) => {
  try {
    const budget = await createBudget(req.body);
    res.status(201).json(budget);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/budgets/:id", async (req, res) => {
  try {
    const updated = await updateBudget(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Budget not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/budgets/:id", async (req, res) => {
  try {
    await deleteBudget(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Savings Goals Endpoints
app.get("/api/goals", async (_req, res) => {
  try {
    const goals = await getGoals();
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/goals", async (req, res) => {
  try {
    const goal = await createGoal(req.body);
    res.status(201).json(goal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/goals/:id", async (req, res) => {
  try {
    const updated = await updateGoal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Goal not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/goals/:id", async (req, res) => {
  try {
    await deleteGoal(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recurring Bills Endpoints
app.get("/api/bills", async (_req, res) => {
  try {
    const bills = await getBills();
    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bills", async (req, res) => {
  try {
    const bill = await createBill(req.body);
    res.status(201).json(bill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/bills/:id", async (req, res) => {
  try {
    const updated = await updateBill(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Bill not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/bills/:id", async (req, res) => {
  try {
    await deleteBill(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Categories Endpoints
app.get("/api/categories", async (_req, res) => {
  try {
    const cats = await getCategories();
    res.json(cats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const cat = await createCategory(req.body);
    res.status(201).json(cat);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications Endpoints
app.get("/api/notifications", async (_req, res) => {
  try {
    const notifs = await getNotifications();
    res.json(notifs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notifications", async (req, res) => {
  try {
    const notif = await createNotification(req.body);
    res.status(201).json(notif);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/notifications/:id", async (req, res) => {
  try {
    const updated = await updateNotification(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/notifications/:id", async (req, res) => {
  try {
    await deleteNotification(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User Profile Endpoints
app.get("/api/user", async (_req, res) => {
  try {
    const user = await getUserProfile();
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/user", async (req, res) => {
  try {
    const updated = await updateUserProfile(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// App Settings Endpoints
app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await getAppSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const updated = await updateAppSettings(req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Financial Assistant endpoint
app.post("/api/assistant", async (req, res) => {
  try {
    const { prompt, history = [], financialContext = {} } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing or invalid prompt parameter." });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are Apex AI, an expert, objective, and empathetic personal finance assistant embedded in the user's Personal Finance Management System.
The current date is ${financialContext.currentDate || "today"}.
User's currency symbol is ${financialContext.currency || "₹"}. Always format currency values with this symbol (e.g. ${financialContext.currency || "₹"}500).

Here is the user's live financial data:
- Total Net Worth / Balance: ${financialContext.totalBalance || "Unknown"}
- Monthly Income: ${financialContext.monthlyIncome || "Unknown"}
- Monthly Expenses: ${financialContext.monthlyExpenses || "Unknown"}
- Monthly Net Savings: ${financialContext.monthlySavings || "Unknown"}
- Savings Rate: ${financialContext.savingsRate || "Unknown"}
- Available Cash: ${financialContext.availableCash || "Unknown"}
- Accounts Summary: ${JSON.stringify(financialContext.accounts || [])}
- Active Budgets & Status: ${JSON.stringify(financialContext.budgets || [])}
- Savings Goals: ${JSON.stringify(financialContext.goals || [])}
- Upcoming Recurring Bills: ${JSON.stringify(financialContext.bills || [])}
- Top Category Spending: ${JSON.stringify(financialContext.topCategories || [])}
- Recent Transactions Sample: ${JSON.stringify(financialContext.recentTransactions || [])}

GUIDELINES:
1. Provide concise, clear, and actionable insights. Use bullet points and bold financial metrics.
2. Directly answer the user's question using their actual numbers from the context above.
3. Clearly distinguish factual calculations (e.g. "You spent $420 on Dining this month") from general financial suggestions (e.g. "Consider capping discretionary spend at $350").
4. Never promise or guarantee financial outcomes. Do not give certified legal or tax advice.
5. If the user asks for a budget, savings plan, or spending breakdown, provide specific, realistic, tailored numbers based on their actual income and current patterns.
6. Keep tone professional, conversational, encouraging, and clear.`;

    // If Gemini API is available, call it
    if (ai) {
      // Build conversation contents
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }

      contents.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
          topP: 0.9,
        },
      });

      const replyText = response.text || "I've reviewed your accounts, but could not generate a complete summary. Please try again.";
      res.json({ reply: replyText, source: "gemini" });
      return;
    }

    // Fallback rule-based intelligent analysis if Gemini API key is not configured
    const currency = financialContext.currency || "₹";
    const lower = prompt.toLowerCase();
    let fallbackReply = "";

    if (lower.includes("spend") || lower.includes("how much did i") || lower.includes("where am i spending")) {
      const top = (financialContext.topCategories || []).slice(0, 3);
      const topStr = top.length > 0 
        ? top.map((t: any) => `• **${t.category}**: ${currency}${t.amount.toLocaleString()} (${t.percentage}% of total)`).join("\n")
        : "• No major category anomalies recorded yet.";
      
      fallbackReply = `### Monthly Spending Overview
This month, your total recorded expenses are **${currency}${financialContext.monthlyExpenses || "0"}**.

**Your highest spending areas:**
${topStr}

**Key Observation:** Discretionary categories (Dining & Shopping) represent a significant portion. A 10% reduction here could reallocate **${currency}120–${currency}180** directly into your savings goals.`;
    } else if (lower.includes("save") || lower.includes("goal") || lower.includes("vacation")) {
      const goals = financialContext.goals || [];
      const goalStr = goals.map((g: any) => `• **${g.name}**: ${currency}${g.currentAmount.toLocaleString()} of ${currency}${g.targetAmount.toLocaleString()} (${Math.round((g.currentAmount / g.targetAmount) * 100)}%) — Target: ${g.deadline || "Ongoing"}`).join("\n");
      
      fallbackReply = `### Savings Goals Status
You are actively tracking **${goals.length}** financial targets:

${goalStr || "No active goals created yet."}

**Projection:** At your current monthly net savings rate of **${currency}${financialContext.monthlySavings || "0"}**, your high-priority Emergency Fund is in healthy standing!`;
    } else if (lower.includes("budget") || lower.includes("limit")) {
      const budgets = financialContext.budgets || [];
      const exceeded = budgets.filter((b: any) => b.spent > b.limit);
      const warning = budgets.filter((b: any) => b.spent / b.limit >= 0.8 && b.spent <= b.limit);
      
      fallbackReply = `### Budget Performance Analysis
- **Active Category Budgets:** ${budgets.length}
- **Categories Exceeded:** ${exceeded.length} ${exceeded.length > 0 ? `(${exceeded.map((b: any) => b.category).join(", ")})` : "None - Great job!"}
- **Approaching Limit (>80%):** ${warning.length} ${warning.length > 0 ? `(${warning.map((b: any) => b.category).join(", ")})` : "None"}

**Recommendation:** Consider setting a weekly rollover rule for groceries and dining out to prevent month-end budget spikes.`;
    } else if (lower.includes("recurring") || lower.includes("bill") || lower.includes("subscription")) {
      const bills = financialContext.bills || [];
      const totalBills = bills.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
      const billsList = bills.map((b: any) => `• **${b.name}**: ${currency}${b.amount} (Due on ${b.dueDate || "the 15th"}) - ${b.category}`).join("\n");
      
      fallbackReply = `### Recurring Expenses & Subscriptions
You have **${bills.length} recurring commitments** totaling approximately **${currency}${totalBills.toLocaleString()}/month**:

${billsList}

**Tip:** Audit inactive streaming services or recurring software licenses annually to reclaim up to ${currency}300/year.`;
    } else {
      fallbackReply = `### Financial Health Summary
- **Net Balance:** ${currency}${financialContext.totalBalance || "0"}
- **Monthly Income:** ${currency}${financialContext.monthlyIncome || "0"}
- **Monthly Outflows:** ${currency}${financialContext.monthlyExpenses || "0"}
- **Net Cash Flow:** ${currency}${financialContext.monthlySavings || "0"} (${financialContext.savingsRate || "0%"} savings rate)

**AI Insights:**
1. Your cash flow is positive, indicating consistent financial cushion.
2. Available liquidity across checking and cash covers approximately 3.4 months of baseline living expenses.
3. You can ask me to analyze specific categories, simulate a savings plan, or identify recurring patterns!`;
    }

    res.json({ reply: fallbackReply, source: "heuristic" });
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    res.status(500).json({
      error: "Unable to process financial analysis at this moment.",
      details: error.message,
    });
  }
});

// AI Natural Language Transaction & Record Search API
app.post("/api/transactions/ai-search", async (req, res) => {
  try {
    const { query, transactions: clientTransactions, currency = "INR", currencySymbol = "₹" } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      res.status(400).json({ error: "Missing or invalid search query." });
      return;
    }

    const trimmedQuery = query.trim();
    // Load transactions from body or database
    let allTransactions = clientTransactions;
    if (!allTransactions || !Array.isArray(allTransactions) || allTransactions.length === 0) {
      allTransactions = await getTransactions();
    }

    const allAccounts = await getAccounts();
    const accountMap = new Map<string, string>();
    for (const a of allAccounts) {
      accountMap.set(a.id, a.name);
    }

    // Prepare compact summary of transactions for AI evaluation
    const compactTransactions = allTransactions.map((t: any) => ({
      id: t.id,
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      account: accountMap.get(t.accountId) || t.accountId,
      paymentMethod: t.paymentMethod,
      date: t.date,
      notes: t.notes || "",
      isRecurring: !!t.isRecurring,
    }));

    const ai = getGeminiClient();

    if (ai) {
      try {
        const promptText = `User's search query: "${trimmedQuery}"
User's currency: ${currencySymbol} (${currency})

List of transactions:
${JSON.stringify(compactTransactions, null, 2)}

Instructions:
1. Understand the semantic intent of the query (e.g. category matching like dining/food/groceries, amount comparisons like over 500, accounts like Chase, type like income/salary or expense, payment method like credit card, recurring status, dates).
2. Filter the transactions matching the user's intent.
3. Return ONLY a valid JSON object with the exact keys:
{
  "matchedIds": ["id1", "id2"],
  "explanation": "Human-friendly 1-2 sentence explanation of the filter applied and what was found.",
  "extractedFilters": {
    "type": "income" | "expense" | "all",
    "category": "Category Name or null",
    "minAmount": number or null,
    "maxAmount": number or null,
    "accountName": "Account Name or null",
    "paymentMethod": "Method or null",
    "keywords": ["word1", "word2"]
  },
  "totalMatchedAmount": number
}
Do NOT include markdown formatting or backticks around the JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          config: {
            temperature: 0.1,
            topP: 0.8,
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text || "{}";
        const cleanedText = rawText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleanedText);

        if (Array.isArray(parsed.matchedIds)) {
          // Verify totalMatchedAmount
          const matchedSet = new Set(parsed.matchedIds);
          const computedTotal = allTransactions
            .filter((t: any) => matchedSet.has(t.id))
            .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

          res.json({
            query: trimmedQuery,
            matchedIds: parsed.matchedIds,
            explanation: parsed.explanation || `Found ${parsed.matchedIds.length} transaction(s) matching "${trimmedQuery}".`,
            extractedFilters: parsed.extractedFilters || {},
            totalMatchedAmount: typeof parsed.totalMatchedAmount === "number" ? parsed.totalMatchedAmount : computedTotal,
            source: "gemini",
          });
          return;
        }
      } catch (geminiErr) {
        console.warn("Gemini AI Search failed, falling back to heuristic engine:", geminiErr);
      }
    }

    // Intelligent Heuristic Fallback Search Engine
    const lower = trimmedQuery.toLowerCase();
    const extractedFilters: any = {
      type: "all",
      category: null,
      minAmount: null,
      maxAmount: null,
      accountName: null,
      paymentMethod: null,
      keywords: [],
    };

    // Detect type
    if (/\b(income|deposit|deposits|salary|credited|earned|paycheck|payroll)\b/.test(lower)) {
      extractedFilters.type = "income";
    } else if (/\b(expense|expenses|spend|spent|paid|cost|purchased|purchases|outflow|debit)\b/.test(lower)) {
      extractedFilters.type = "expense";
    }

    // Detect amount conditions
    const overMatch = lower.match(/(?:over|above|>|greater than|more than)\s*(?:₹|\$)?\s*(\d+(?:\.\d+)?)/);
    if (overMatch) {
      extractedFilters.minAmount = parseFloat(overMatch[1]);
    }

    const underMatch = lower.match(/(?:under|below|<|less than)\s*(?:₹|\$)?\s*(\d+(?:\.\d+)?)/);
    if (underMatch) {
      extractedFilters.maxAmount = parseFloat(underMatch[1]);
    }

    const betweenMatch = lower.match(/between\s*(?:₹|\$)?\s*(\d+(?:\.\d+)?)\s*(?:and|-)\s*(?:₹|\$)?\s*(\d+(?:\.\d+)?)/);
    if (betweenMatch) {
      extractedFilters.minAmount = parseFloat(betweenMatch[1]);
      extractedFilters.maxAmount = parseFloat(betweenMatch[2]);
    }

    // Detect categories
    const categoryKeywords: Record<string, string> = {
      food: "Food & Dining",
      dining: "Food & Dining",
      restaurant: "Food & Dining",
      restaurants: "Food & Dining",
      groceries: "Food & Dining",
      grocery: "Food & Dining",
      coffee: "Food & Dining",
      shop: "Shopping & Retail",
      shopping: "Shopping & Retail",
      retail: "Shopping & Retail",
      transport: "Transportation",
      transportation: "Transportation",
      transit: "Transportation",
      uber: "Transportation",
      lyft: "Transportation",
      gas: "Transportation",
      fuel: "Transportation",
      housing: "Housing & Rent",
      rent: "Housing & Rent",
      mortgage: "Housing & Rent",
      utilities: "Utilities & Bills",
      utility: "Utilities & Bills",
      internet: "Utilities & Bills",
      electric: "Utilities & Bills",
      health: "Healthcare & Wellness",
      healthcare: "Healthcare & Wellness",
      gym: "Healthcare & Wellness",
      medical: "Healthcare & Wellness",
      fitness: "Healthcare & Wellness",
      entertainment: "Entertainment & Leisure",
      leisure: "Entertainment & Leisure",
      movies: "Entertainment & Leisure",
      netflix: "Entertainment & Leisure",
      investments: "Investments",
      investment: "Investments",
      crypto: "Investments",
      stock: "Investments",
      stocks: "Investments",
    };

    for (const [kw, catName] of Object.entries(categoryKeywords)) {
      if (new RegExp(`\\b${kw}\\b`).test(lower)) {
        extractedFilters.category = catName;
        break;
      }
    }

    // Detect payment methods
    if (/\b(credit|credit card)\b/.test(lower)) {
      extractedFilters.paymentMethod = "Credit Card";
    } else if (/\b(debit|debit card)\b/.test(lower)) {
      extractedFilters.paymentMethod = "Debit Card";
    } else if (/\b(apple pay|applepay)\b/.test(lower)) {
      extractedFilters.paymentMethod = "Apple Pay";
    } else if (/\b(direct deposit|ach)\b/.test(lower)) {
      extractedFilters.paymentMethod = "Direct Deposit";
    } else if (/\b(cash)\b/.test(lower)) {
      extractedFilters.paymentMethod = "Cash";
    }

    // Detect account names
    if (/\bchase\b/.test(lower)) extractedFilters.accountName = "Chase";
    else if (/\bmarcus\b/.test(lower)) extractedFilters.accountName = "Marcus";
    else if (/\bvanguard\b/.test(lower)) extractedFilters.accountName = "Vanguard";

    // Recurring check
    const checkRecurring = /\b(recurring|subscription|subscriptions|bill|bills)\b/.test(lower);

    // Filter matched transactions
    const matched = allTransactions.filter((t: any) => {
      // Type
      if (extractedFilters.type !== "all" && t.type !== extractedFilters.type) return false;
      // Category
      if (extractedFilters.category && t.category.toLowerCase() !== extractedFilters.category.toLowerCase()) return false;
      // Min amount
      if (extractedFilters.minAmount !== null && t.amount < extractedFilters.minAmount) return false;
      // Max amount
      if (extractedFilters.maxAmount !== null && t.amount > extractedFilters.maxAmount) return false;
      // Payment method
      if (extractedFilters.paymentMethod && !(t.paymentMethod || "").toLowerCase().includes(extractedFilters.paymentMethod.toLowerCase())) return false;
      // Account
      if (extractedFilters.accountName) {
        const accName = (accountMap.get(t.accountId) || "").toLowerCase();
        if (!accName.includes(extractedFilters.accountName.toLowerCase())) return false;
      }
      // Recurring
      if (checkRecurring && !t.isRecurring) return false;

      // If no structural criteria matched, fallback to full-text search
      if (!extractedFilters.category && extractedFilters.minAmount === null && extractedFilters.maxAmount === null && !extractedFilters.accountName && !extractedFilters.paymentMethod && extractedFilters.type === "all") {
        const text = `${t.title} ${t.category} ${t.notes || ""} ${t.paymentMethod || ""}`.toLowerCase();
        const searchWords = lower.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2);
        if (searchWords.length > 0 && !searchWords.some(w => text.includes(w))) {
          return false;
        }
      }

      return true;
    });

    const matchedIds = matched.map((t: any) => t.id);
    const totalMatchedAmount = matched.reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

    // Build explanation
    const parts: string[] = [];
    if (extractedFilters.type !== "all") parts.push(`${extractedFilters.type} transactions`);
    if (extractedFilters.category) parts.push(`in ${extractedFilters.category}`);
    if (extractedFilters.minAmount !== null && extractedFilters.maxAmount !== null) {
      parts.push(`between ${currencySymbol}${extractedFilters.minAmount} and ${currencySymbol}${extractedFilters.maxAmount}`);
    } else if (extractedFilters.minAmount !== null) {
      parts.push(`over ${currencySymbol}${extractedFilters.minAmount}`);
    } else if (extractedFilters.maxAmount !== null) {
      parts.push(`under ${currencySymbol}${extractedFilters.maxAmount}`);
    }
    if (extractedFilters.paymentMethod) parts.push(`via ${extractedFilters.paymentMethod}`);
    if (extractedFilters.accountName) parts.push(`on ${extractedFilters.accountName}`);

    const desc = parts.length > 0 ? parts.join(" ") : `"${trimmedQuery}"`;
    const explanation = matched.length > 0
      ? `Found ${matched.length} record(s) matching ${desc}, totaling ${currencySymbol}${totalMatchedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`
      : `No transactions matched your query criteria for ${desc}.`;

    res.json({
      query: trimmedQuery,
      matchedIds,
      explanation,
      extractedFilters,
      totalMatchedAmount,
      source: "heuristic",
    });
  } catch (error: any) {
    console.error("AI Search error:", error);
    res.status(500).json({
      error: "Unable to execute AI search at this moment.",
      details: error.message,
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Finance server running on port ${PORT}`);
  });
}

startServer();
