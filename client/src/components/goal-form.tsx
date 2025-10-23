import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema, type InsertGoal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalFormProps {
  onSubmit: (data: InsertGoal) => void;
  defaultValues?: Partial<InsertGoal>;
  isLoading?: boolean;
}

export function GoalForm({ onSubmit, defaultValues, isLoading }: GoalFormProps) {
  const form = useForm<InsertGoal>({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: defaultValues || {
      name: "",
      targetAmount: "",
      currentAmount: "0",
      icon: "Target",
      color: "#3b82f6",
    },
  });

  const watchDeadline = form.watch("deadline");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          placeholder="e.g., Emergency Fund, Vacation"
          {...form.register("name")}
          data-testid="input-goal-name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="pl-7 tabular-nums"
            {...form.register("targetAmount")}
            data-testid="input-goal-target"
          />
        </div>
        {form.formState.errors.targetAmount && (
          <p className="text-sm text-destructive">{form.formState.errors.targetAmount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentAmount">Current Amount (Optional)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="currentAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="pl-7 tabular-nums"
            {...form.register("currentAmount")}
            data-testid="input-goal-current"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Deadline (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !watchDeadline && "text-muted-foreground"
              )}
              data-testid="button-goal-deadline"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchDeadline ? format(new Date(watchDeadline), "PPP") : <span>No deadline</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={watchDeadline ? new Date(watchDeadline) : undefined}
              onSelect={(date) => form.setValue("deadline", date?.toISOString())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            className="h-12 w-20"
            {...form.register("color")}
            data-testid="input-goal-color"
          />
          <Input
            value={form.watch("color") || "#3b82f6"}
            onChange={(e) => form.setValue("color", e.target.value)}
            placeholder="#3b82f6"
            className="flex-1"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-goal">
        {isLoading ? "Saving..." : defaultValues ? "Update Goal" : "Create Goal"}
      </Button>
    </form>
  );
}
