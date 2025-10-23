import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser } from "./auth";
import { requireAdmin } from "./admin-middleware";
import { getAuth } from "firebase-admin/auth";
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
        // Create new user with admin status for specific email
        const isAdminEmail = data.email === "gabe.rappold@gmail.com";
        user = await storage.createUser({
          ...data,
          isAdmin: isAdminEmail,
        });
        
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
      } else {
        // For existing users, check the stored email (not the request email) and promote if needed
        if (user.email === "gabe.rappold@gmail.com" && !user.isAdmin) {
          user = await storage.updateUserAdmin(user.id, true);
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

  // Admin routes - protected by requireAdmin middleware
  app.get("/api/admin/users", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/admin", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { isAdmin } = req.body;
      const user = await storage.updateUserAdmin(req.params.id, isAdmin);
      
      await storage.createAdminLog({
        adminId: req.userId!,
        action: isAdmin ? "made_admin" : "removed_admin",
        targetUserId: user.id,
        targetUserEmail: user.email,
        details: `${isAdmin ? "Granted" : "Revoked"} admin privileges`,
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user admin status" });
    }
  });

  app.patch("/api/admin/users/:id/disable", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { isDisabled } = req.body;
      const user = await storage.updateUserDisabled(req.params.id, isDisabled);
      
      await storage.createAdminLog({
        adminId: req.userId!,
        action: isDisabled ? "disabled_account" : "enabled_account",
        targetUserId: user.id,
        targetUserEmail: user.email,
        details: `${isDisabled ? "Disabled" : "Enabled"} user account`,
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.deleteUser(req.params.id);
      
      await storage.createAdminLog({
        adminId: req.userId!,
        action: "deleted_account",
        targetUserId: user.id,
        targetUserEmail: user.email,
        details: "Deleted user account and all associated data",
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.post("/api/admin/users/:id/reset-password", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const resetLink = await getAuth().generatePasswordResetLink(user.email);
      
      await storage.createAdminLog({
        adminId: req.userId!,
        action: "reset_password",
        targetUserId: user.id,
        targetUserEmail: user.email,
        details: "Generated password reset link",
      });

      res.json({ resetLink, email: user.email });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate password reset link" });
    }
  });

  app.get("/api/admin/logs", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getAdminLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin logs" });
    }
  });

  app.get("/api/admin/stats", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
