import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-lg", iconColor || "bg-primary/10")}>
            <Icon className={cn("w-6 h-6", iconColor ? "text-inherit" : "text-primary")} />
          </div>
          {change && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                changeType === "positive" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                changeType === "negative" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                changeType === "neutral" && "bg-muted text-muted-foreground"
              )}
              data-testid={`badge-change-${title.toLowerCase().replace(/\s/g, "-")}`}
            >
              {change}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold tabular-nums" data-testid={`text-value-${title.toLowerCase().replace(/\s/g, "-")}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
