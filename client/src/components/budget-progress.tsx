import { type Budget, type Category } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface BudgetProgressProps {
  budget: Budget;
  category?: Category;
  spent: number;
}

export function BudgetProgress({ budget, category, spent }: BudgetProgressProps) {
  const budgetAmount = parseFloat(budget.amount);
  const percentage = Math.min((spent / budgetAmount) * 100, 100);
  const remaining = Math.max(budgetAmount - spent, 0);
  const isOverBudget = spent > budgetAmount;

  const IconComponent = category?.icon && (Icons as any)[category.icon]
    ? (Icons as any)[category.icon]
    : Icons.DollarSign;

  return (
    <div className="space-y-3" data-testid={`budget-progress-${budget.id}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: category?.color ? `${category.color}20` : undefined }}
          >
            <IconComponent className="w-5 h-5" style={{ color: category?.color || undefined }} />
          </div>
          <div>
            <p className="font-medium" data-testid={`text-budget-name-${budget.id}`}>{budget.name}</p>
            <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium tabular-nums" data-testid={`text-budget-spent-${budget.id}`}>
            ${spent.toFixed(2)} / ${budgetAmount.toFixed(2)}
          </p>
          <p className={cn(
            "text-xs tabular-nums",
            isOverBudget ? "text-destructive" : "text-muted-foreground"
          )}>
            {isOverBudget ? `$${(spent - budgetAmount).toFixed(2)} over` : `$${remaining.toFixed(2)} left`}
          </p>
        </div>
      </div>
      
      <div className="space-y-1">
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            isOverBudget && "[&>div]:bg-destructive"
          )}
          data-testid={`progress-budget-${budget.id}`}
        />
        {isOverBudget && (
          <p className="text-xs text-destructive font-medium" data-testid={`text-warning-${budget.id}`}>
            ⚠️ Budget exceeded
          </p>
        )}
      </div>
    </div>
  );
}
