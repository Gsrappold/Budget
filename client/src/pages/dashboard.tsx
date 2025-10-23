import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/stat-card";
import { TransactionItem } from "@/components/transaction-item";
import { BudgetProgress } from "@/components/budget-progress";
import { GoalCard } from "@/components/goal-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Plus,
  ArrowRight 
} from "lucide-react";
import { Link } from "wouter";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid 
} from "recharts";
import { type Transaction, type Category, type Budget, type Goal } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.uid],
    enabled: !!user,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories", user?.uid],
    enabled: !!user,
  });

  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets", user?.uid],
    enabled: !!user,
  });

  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals", user?.uid],
    enabled: !!user,
  });

  // Calculate statistics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions?.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }) || [];

  const totalIncome = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netSavings = totalIncome - totalExpenses;

  // Category breakdown for pie chart
  const categoryData = categories?.map(cat => {
    const catExpenses = monthlyTransactions
      .filter(t => t.categoryId === cat.id && t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return {
      name: cat.name,
      value: catExpenses,
      color: cat.color || "#3b82f6",
    };
  }).filter(d => d.value > 0) || [];

  // Trend data for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTransactions = transactions?.filter(t => {
      const tDate = new Date(t.date);
      return tDate.toDateString() === date.toDateString();
    }) || [];
    
    const expenses = dayTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: expenses,
    };
  });

  const recentTransactions = transactions?.slice(0, 5) || [];
  const activeBudgets = budgets?.slice(0, 3) || [];
  const activeGoals = goals?.filter(g => !g.isCompleted).slice(0, 2) || [];

  // Calculate budget spent amounts
  const budgetSpent = budgets?.map(budget => {
    const spent = monthlyTransactions
      .filter(t => t.categoryId === budget.categoryId && t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { budgetId: budget.id, spent };
  }) || [];

  if (transactionsLoading || budgetsLoading || goalsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your financial overview
          </p>
        </div>
        <Link href="/transactions">
          <Button data-testid="button-add-transaction">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={`$${totalIncome.toFixed(2)}`}
          change="+12%"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Total Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          change="-8%"
          changeType="positive"
          icon={TrendingDown}
          iconColor="bg-red-100 dark:bg-red-900/30"
        />
        <StatCard
          title="Net Savings"
          value={`$${netSavings.toFixed(2)}`}
          change={netSavings >= 0 ? "+20%" : "-5%"}
          changeType={netSavings >= 0 ? "positive" : "negative"}
          icon={DollarSign}
          iconColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Active Goals"
          value={activeGoals.length.toString()}
          icon={Target}
          iconColor="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>This month's expense breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expenses this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" data-testid="link-view-all-transactions">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map(transaction => {
                  const category = categories?.find(c => c.id === transaction.categoryId);
                  return (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      category={category}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Add your first transaction to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Track your spending limits</CardDescription>
            </div>
            <Link href="/budgets">
              <Button variant="ghost" size="sm" data-testid="link-view-budgets">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activeBudgets.length > 0 ? (
              <div className="space-y-6">
                {activeBudgets.map(budget => {
                  const category = categories?.find(c => c.id === budget.categoryId);
                  const spent = budgetSpent.find(b => b.budgetId === budget.id)?.spent || 0;
                  return (
                    <BudgetProgress
                      key={budget.id}
                      budget={budget}
                      category={category}
                      spent={spent}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No budgets set</p>
                <p className="text-sm mt-1">Create a budget to track spending</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals Section */}
      {activeGoals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Goals</h2>
              <p className="text-muted-foreground">Track progress toward your savings targets</p>
            </div>
            <Link href="/goals">
              <Button variant="ghost" data-testid="link-view-goals">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
