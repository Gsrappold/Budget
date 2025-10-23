// Reference: javascript_database blueprint
import { 
  users, 
  categories,
  transactions,
  budgets,
  goals,
  adminLogs,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type Budget,
  type InsertBudget,
  type Goal,
  type InsertGoal,
  type AdminLog,
  type InsertAdminLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserAdmin(id: string, isAdmin: boolean): Promise<User>;
  updateUserDisabled(id: string, isDisabled: boolean): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Categories
  getCategories(userId: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Transactions
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  // Budgets
  getBudgets(userId: string): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;

  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;

  // Admin
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalBudgets: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUserAdmin(id: string, isAdmin: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserDisabled(id: string, isDisabled: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isDisabled })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Categories
  async getCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, updateData: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Budgets
  async getBudgets(userId: string): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(desc(budgets.createdAt));
  }

  async getBudget(id: string): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget || undefined;
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values(insertBudget)
      .returning();
    return budget;
  }

  async updateBudget(id: string, updateData: Partial<InsertBudget>): Promise<Budget> {
    const [budget] = await db
      .update(budgets)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(budgets.id, id))
      .returning();
    return budget;
  }

  async deleteBudget(id: string): Promise<void> {
    await db.delete(budgets).where(eq(budgets.id, id));
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async updateGoal(id: string, updateData: Partial<InsertGoal>): Promise<Goal> {
    const [goal] = await db
      .update(goals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return goal;
  }

  async deleteGoal(id: string): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  // Admin
  async getAdminLogs(limit: number = 50): Promise<AdminLog[]> {
    return await db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit);
  }

  async createAdminLog(insertLog: InsertAdminLog): Promise<AdminLog> {
    const [log] = await db
      .insert(adminLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalBudgets: number;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users);

    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isDisabled, false));

    const [totalTransactionsResult] = await db
      .select({ count: count() })
      .from(transactions);

    const [totalBudgetsResult] = await db
      .select({ count: count() })
      .from(budgets);

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      totalTransactions: totalTransactionsResult.count,
      totalBudgets: totalBudgetsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
