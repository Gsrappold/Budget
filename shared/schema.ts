// Database schema for budgeting platform
// Reference: javascript_database blueprint
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - stores Firebase user information
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Firebase UID
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isDisabled: boolean("is_disabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table - expense/income categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  icon: text("icon"), // Lucide icon name
  color: text("color"), // Hex color for category
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions table - income and expenses
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  description: text("description").notNull(),
  notes: text("notes"),
  tags: text("tags").array(), // Array of tag strings
  date: timestamp("date").notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurringFrequency: text("recurring_frequency"), // 'daily', 'weekly', 'monthly', 'yearly'
  recurringEndDate: timestamp("recurring_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Budgets table - budget limits per category
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  period: text("period").notNull(), // 'weekly', 'monthly', 'yearly'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  rollover: boolean("rollover").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Goals table - savings goals
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  deadline: timestamp("deadline"),
  icon: text("icon"), // Lucide icon name
  color: text("color"), // Hex color
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin Logs table - tracks admin actions
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // e.g., 'made_admin', 'disabled_account', 'deleted_account', 'reset_password'
  targetUserId: varchar("target_user_id"),
  targetUserEmail: text("target_user_email"),
  details: text("details"), // Additional context about the action
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
  goals: many(goals),
  adminLogs: many(adminLogs),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number"),
  tags: z.array(z.string()).optional(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number"),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number"),
  currentAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number").optional(),
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
