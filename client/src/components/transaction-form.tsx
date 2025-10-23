import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema, type InsertTransaction, type Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: InsertTransaction) => void;
  defaultValues?: Partial<InsertTransaction>;
  isLoading?: boolean;
}

export function TransactionForm({ categories, onSubmit, defaultValues, isLoading }: TransactionFormProps) {
  const form = useForm<InsertTransaction>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: defaultValues || {
      type: "expense",
      amount: "",
      description: "",
      notes: "",
      date: new Date().toISOString(),
      isRecurring: false,
      tags: [],
    },
  });

  const watchType = form.watch("type");
  const watchDate = form.watch("date");
  const watchIsRecurring = form.watch("isRecurring");

  const filteredCategories = categories.filter(c => c.type === watchType);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={watchType === "expense" ? "default" : "outline"}
            onClick={() => form.setValue("type", "expense")}
            data-testid="button-type-expense"
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={watchType === "income" ? "default" : "outline"}
            onClick={() => form.setValue("type", "income")}
            data-testid="button-type-income"
          >
            Income
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="pl-7 text-2xl h-16 tabular-nums text-center"
            {...form.register("amount")}
            data-testid="input-amount"
          />
        </div>
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this for?"
          {...form.register("description")}
          data-testid="input-description"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          value={form.watch("categoryId") || ""}
          onValueChange={(value) => form.setValue("categoryId", value)}
        >
          <SelectTrigger id="categoryId" data-testid="select-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !watchDate && "text-muted-foreground"
              )}
              data-testid="button-date-picker"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchDate ? format(new Date(watchDate), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={watchDate ? new Date(watchDate) : undefined}
              onSelect={(date) => form.setValue("date", date?.toISOString() || new Date().toISOString())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="recurring">Recurring Transaction</Label>
          <p className="text-sm text-muted-foreground">
            This transaction repeats regularly
          </p>
        </div>
        <Switch
          id="recurring"
          checked={watchIsRecurring}
          onCheckedChange={(checked) => form.setValue("isRecurring", checked)}
          data-testid="switch-recurring"
        />
      </div>

      {watchIsRecurring && (
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={form.watch("recurringFrequency") || ""}
            onValueChange={(value) => form.setValue("recurringFrequency", value as any)}
          >
            <SelectTrigger id="frequency" data-testid="select-frequency">
              <SelectValue placeholder="How often?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional details..."
          className="resize-none"
          rows={3}
          {...form.register("notes")}
          data-testid="input-notes"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-transaction">
        {isLoading ? "Saving..." : defaultValues ? "Update Transaction" : "Add Transaction"}
      </Button>
    </form>
  );
}
