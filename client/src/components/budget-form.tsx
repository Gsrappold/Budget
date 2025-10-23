import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBudgetSchema, type InsertBudget, type Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BudgetFormProps {
  categories: Category[];
  onSubmit: (data: InsertBudget) => void;
  defaultValues?: Partial<InsertBudget>;
  isLoading?: boolean;
}

export function BudgetForm({ categories, onSubmit, defaultValues, isLoading }: BudgetFormProps) {
  const form = useForm<InsertBudget>({
    resolver: zodResolver(insertBudgetSchema),
    defaultValues: defaultValues || {
      name: "",
      amount: "",
      period: "monthly",
      startDate: new Date().toISOString(),
      rollover: false,
    },
  });

  const watchStartDate = form.watch("startDate");
  const watchRollover = form.watch("rollover");

  const expenseCategories = categories.filter(c => c.type === "expense");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Budget Name</Label>
        <Input
          id="name"
          placeholder="e.g., Monthly Groceries"
          {...form.register("name")}
          data-testid="input-budget-name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Budget Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="pl-7 tabular-nums"
            {...form.register("amount")}
            data-testid="input-budget-amount"
          />
        </div>
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          value={form.watch("categoryId") || ""}
          onValueChange={(value) => form.setValue("categoryId", value)}
        >
          <SelectTrigger id="categoryId" data-testid="select-budget-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="period">Period</Label>
        <Select
          value={form.watch("period")}
          onValueChange={(value) => form.setValue("period", value as "weekly" | "monthly" | "yearly")}
        >
          <SelectTrigger id="period" data-testid="select-budget-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !watchStartDate && "text-muted-foreground"
              )}
              data-testid="button-budget-start-date"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchStartDate ? format(new Date(watchStartDate), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={watchStartDate ? new Date(watchStartDate) : undefined}
              onSelect={(date) => form.setValue("startDate", date?.toISOString() || new Date().toISOString())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="rollover">Rollover Unused Amount</Label>
          <p className="text-sm text-muted-foreground">
            Carry over remaining budget to next period
          </p>
        </div>
        <Switch
          id="rollover"
          checked={watchRollover}
          onCheckedChange={(checked) => form.setValue("rollover", checked)}
          data-testid="switch-rollover"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-budget">
        {isLoading ? "Saving..." : defaultValues ? "Update Budget" : "Create Budget"}
      </Button>
    </form>
  );
}
