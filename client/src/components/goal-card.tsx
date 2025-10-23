import { type Goal } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { format } from "date-fns";

interface GoalCardProps {
  goal: Goal;
  onAddFunds?: (goal: Goal) => void;
}

export function GoalCard({ goal, onAddFunds }: GoalCardProps) {
  const current = parseFloat(goal.currentAmount);
  const target = parseFloat(goal.targetAmount);
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  const IconComponent = goal.icon && (Icons as any)[goal.icon]
    ? (Icons as any)[goal.icon]
    : Icons.Target;

  return (
    <Card data-testid={`goal-card-${goal.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: goal.color ? `${goal.color}20` : undefined }}
            >
              <IconComponent className="w-6 h-6" style={{ color: goal.color || undefined }} />
            </div>
            <div>
              <h3 className="font-semibold mb-1" data-testid={`text-goal-name-${goal.id}`}>{goal.name}</h3>
              {goal.deadline && (
                <p className="text-sm text-muted-foreground">
                  Due {format(new Date(goal.deadline), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
          {goal.isCompleted && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full p-2">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium tabular-nums" data-testid={`text-goal-progress-${goal.id}`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          
          <Progress value={percentage} className="h-3" data-testid={`progress-goal-${goal.id}`} />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tabular-nums" data-testid={`text-goal-current-${goal.id}`}>
                ${current.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                of ${target.toFixed(2)}
              </p>
            </div>
            
            {!goal.isCompleted && onAddFunds && (
              <Button
                size="sm"
                onClick={() => onAddFunds(goal)}
                data-testid={`button-add-funds-${goal.id}`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Funds
              </Button>
            )}
          </div>
          
          {!goal.isCompleted && remaining > 0 && (
            <p className="text-xs text-muted-foreground">
              ${remaining.toFixed(2)} remaining to reach your goal
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
