import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BudgetProgress } from "@/components/budget-progress";
import { BudgetForm } from "@/components/budget-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Wallet } from "lucide-react";
import { type Budget, type Category, type InsertBudget, type Transaction } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function BudgetsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets", user?.uid],
    enabled: !!user,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories", user?.uid],
    enabled: !!user,
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.uid],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBudget) =>
      apiRequest("POST", "/api/budgets", { ...data, userId: user?.uid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Budget created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create budget" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/budgets/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({ title: "Success", description: "Budget deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete budget" });
    },
  });

  const handleSubmit = (data: InsertBudget) => {
    createMutation.mutate(data);
  };

  // Calculate spent amounts for each budget
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const budgetSpent = budgets?.map(budget => {
    const spent = transactions?.filter(t => {
      const date = new Date(t.date);
      return (
        t.categoryId === budget.categoryId &&
        t.type === "expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    }).reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    
    return { budgetId: budget.id, spent };
  }) || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Set spending limits and track your progress
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-budget">
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category
              </DialogDescription>
            </DialogHeader>
            <BudgetForm
              categories={categories || []}
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets && budgets.length > 0 ? (
          budgets.map(budget => {
            const category = categories?.find(c => c.id === budget.categoryId);
            const spent = budgetSpent.find(b => b.budgetId === budget.id)?.spent || 0;
            return (
              <Card key={budget.id}>
                <CardContent className="p-6">
                  <BudgetProgress
                    budget={budget}
                    category={category}
                    spent={spent}
                  />
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this budget?")) {
                          deleteMutation.mutate(budget.id);
                        }
                      }}
                      data-testid={`button-delete-budget-${budget.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="py-16 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No budgets yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first budget to start tracking your spending limits
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-first-budget">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Budget</DialogTitle>
                    <DialogDescription>
                      Set a spending limit for a category
                    </DialogDescription>
                  </DialogHeader>
                  <BudgetForm
                    categories={categories || []}
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
