import { format } from "date-fns";
import { type Transaction, type Category } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, category, onEdit, onDelete }: TransactionItemProps) {
  const IconComponent = category?.icon && (Icons as any)[category.icon] 
    ? (Icons as any)[category.icon] 
    : Icons.DollarSign;

  return (
    <div className="flex items-center gap-4 p-4 hover-elevate rounded-lg" data-testid={`transaction-item-${transaction.id}`}>
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: category?.color ? `${category.color}20` : undefined }}
      >
        <IconComponent className="w-5 h-5" style={{ color: category?.color || undefined }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" data-testid={`text-description-${transaction.id}`}>
          {transaction.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-muted-foreground">
            {format(new Date(transaction.date), "MMM d, yyyy")}
          </p>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          )}
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="flex gap-1">
              {transaction.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <p
          className={cn(
            "text-lg font-semibold tabular-nums",
            transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-foreground"
          )}
          data-testid={`text-amount-${transaction.id}`}
        >
          {transaction.type === "income" ? "+" : "-"}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
        </p>
        
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-menu-${transaction.id}`}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(transaction)} data-testid={`button-edit-${transaction.id}`}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(transaction.id)}
                  className="text-destructive"
                  data-testid={`button-delete-${transaction.id}`}
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
