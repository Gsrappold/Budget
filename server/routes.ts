import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser } from "./auth";
import { 
  insertUserSchema,
  insertCategorySchema,
  insertTransactionSchema,
  insertBudgetSchema,
  insertGoalSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User sync endpoint - no auth required as it's used during login
  app.post("/api/users/sync", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user exists
      let user = await storage.getUser(data.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser(data);
        
        // Create default categories for new user
        const defaultCategories = [
          { name: "Groceries", type: "expense" as const, icon: "ShoppingCart", color: "#ef4444", isDefault: true },
          { name: "Rent", type: "expense" as const, icon: "Home", color: "#f59e0b", isDefault: true },
          { name: "Transportation", type: "expense" as const, icon: "Car", color: "#3b82f6", isDefault: true },
          { name: "Dining Out", type: "expense" as const, icon: "Utensils", color: "#ec4899", isDefault: true },
          { name: "Entertainment", type: "expense" as const, icon: "Smartphone", color: "#8b5cf6", isDefault: true },
          { name: "Salary", type: "income" as const, icon: "DollarSign", color: "#10b981", isDefault: true },
          { name: "Freelance", type: "income" as const, icon: "Briefcase", color: "#059669", isDefault: true },
        ];

        for (const cat of defaultCategories) {
          await storage.createCategory({ ...cat, userId: user.id });
        }
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Categories - protected endpoints
  app.get("/api/categories", authenticateUser, async (req, res) => {
    try {
      const categories = await storage.getCategories(req.userId!);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", authenticateUser, async (req, res) => {
    try {
      const data = insertCategorySchema.parse({
        ...req.body,
        userId: req.userId, // Override with authenticated userId
      });
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", authenticateUser, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Transactions - protected endpoints
  app.get("/api/transactions", authenticateUser, async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.userId!);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", authenticateUser, async (req, res) => {
    try {
      const data = insertTransactionSchema.parse({
        ...req.body,
        userId: req.userId, // Override with authenticated userId
      });
      const transaction = await storage.createTransaction(data);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  app.patch("/api/transactions/:id", authenticateUser, async (req, res) => {
    try {
      const data = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, data);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  app.delete("/api/transactions/:id", authenticateUser, async (req, res) => {
    try {
      await storage.deleteTransaction(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // Budgets - protected endpoints
  app.get("/api/budgets", authenticateUser, async (req, res) => {
    try {
      const budgets = await storage.getBudgets(req.userId!);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", authenticateUser, async (req, res) => {
    try {
      const data = insertBudgetSchema.parse({
        ...req.body,
        userId: req.userId, // Override with authenticated userId
      });
      const budget = await storage.createBudget(data);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  app.patch("/api/budgets/:id", authenticateUser, async (req, res) => {
    try {
      const data = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(req.params.id, data);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  app.delete("/api/budgets/:id", authenticateUser, async (req, res) => {
    try {
      await storage.deleteBudget(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete budget" });
    }
  });

  // Goals - protected endpoints
  app.get("/api/goals", authenticateUser, async (req, res) => {
    try {
      const goals = await storage.getGoals(req.userId!);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", authenticateUser, async (req, res) => {
    try {
      const data = insertGoalSchema.parse({
        ...req.body,
        userId: req.userId, // Override with authenticated userId
      });
      const goal = await storage.createGoal(data);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", authenticateUser, async (req, res) => {
    try {
      const data = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(req.params.id, data);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.delete("/api/goals/:id", authenticateUser, async (req, res) => {
    try {
      await storage.deleteGoal(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
