import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GoalCard } from "@/components/goal-card";
import { GoalForm } from "@/components/goal-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target } from "lucide-react";
import { type Goal, type InsertGoal } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function GoalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [fundsAmount, setFundsAmount] = useState("");

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals", user?.uid],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertGoal) =>
      apiRequest("POST", "/api/goals", { ...data, userId: user?.uid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Goal created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create goal" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) =>
      apiRequest("PATCH", `/api/goals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsAddFundsOpen(false);
      setSelectedGoal(null);
      setFundsAmount("");
      toast({ title: "Success", description: "Goal updated successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update goal" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/goals/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Success", description: "Goal deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete goal" });
    },
  });

  const handleSubmit = (data: InsertGoal) => {
    createMutation.mutate(data);
  };

  const handleAddFunds = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsAddFundsOpen(true);
  };

  const handleFundsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !fundsAmount) return;

    const amount = parseFloat(fundsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a valid amount" });
      return;
    }

    const newCurrent = parseFloat(selectedGoal.currentAmount) + amount;
    const target = parseFloat(selectedGoal.targetAmount);
    const isCompleted = newCurrent >= target;

    updateMutation.mutate({
      id: selectedGoal.id,
      data: {
        currentAmount: newCurrent.toFixed(2),
        isCompleted,
      },
    });
  };

  const activeGoals = goals?.filter(g => !g.isCompleted) || [];
  const completedGoals = goals?.filter(g => g.isCompleted) || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set and track your savings goals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-goal">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
              <DialogDescription>
                Set a new savings target to work towards
              </DialogDescription>
            </DialogHeader>
            <GoalForm
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active-goals">
            Active ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-goals">
            Completed ({completedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.map(goal => (
                <div key={goal.id} className="relative">
                  <GoalCard goal={goal} onAddFunds={handleAddFunds} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this goal?")) {
                        deleteMutation.mutate(goal.id);
                      }
                    }}
                    data-testid={`button-delete-goal-${goal.id}`}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No active goals</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first savings goal to start tracking your progress
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-first-goal">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Goal</DialogTitle>
                      <DialogDescription>
                        Set a new savings target to work towards
                      </DialogDescription>
                    </DialogHeader>
                    <GoalForm
                      onSubmit={handleSubmit}
                      isLoading={createMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map(goal => (
                <div key={goal.id} className="relative">
                  <GoalCard goal={goal} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this goal?")) {
                        deleteMutation.mutate(goal.id);
                      }
                    }}
                    data-testid={`button-delete-goal-${goal.id}`}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <p>No completed goals yet</p>
                <p className="text-sm mt-1">Keep working towards your active goals!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds to {selectedGoal?.name}</DialogTitle>
            <DialogDescription>
              How much would you like to add to this goal?
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFundsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="funds-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="funds-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7 text-xl h-14 tabular-nums text-center"
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  required
                  data-testid="input-funds-amount"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddFundsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateMutation.isPending}
                data-testid="button-submit-funds"
              >
                {updateMutation.isPending ? "Adding..." : "Add Funds"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
