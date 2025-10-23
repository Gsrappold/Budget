import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import * as Icons from "lucide-react";
import { type Category, type InsertCategory } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const iconOptions = [
  "ShoppingCart", "Home", "Car", "Utensils", "Plane", "Heart",
  "Smartphone", "Shirt", "BookOpen", "Briefcase", "DollarSign",
  "TrendingUp", "Wallet", "CreditCard", "PiggyBank", "Target"
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryType, setCategoryType] = useState<"income" | "expense">("expense");
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("DollarSign");
  const [categoryColor, setCategoryColor] = useState("#3b82f6");

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories", user?.uid],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCategory) =>
      apiRequest("POST", "/api/categories", { ...data, userId: user?.uid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      setCategoryName("");
      setCategoryIcon("DollarSign");
      setCategoryColor("#3b82f6");
      toast({ title: "Success", description: "Category created successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create category" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/categories/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete category" });
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: categoryName,
      type: categoryType,
      icon: categoryIcon,
      color: categoryColor,
      userId: user?.uid || "",
    });
  };

  const incomeCategories = categories?.filter(c => c.type === "income") || [];
  const expenseCategories = categories?.filter(c => c.type === "expense") || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div>
              <Label>Display Name</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.displayName || "Not set"}
              </p>
            </div>
            <div>
              <Label>Account ID</Label>
              <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                {user?.uid}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categories Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage expense and income categories</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-category">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Category</DialogTitle>
                  <DialogDescription>
                    Add a new category for organizing transactions
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={categoryType === "expense" ? "default" : "outline"}
                        onClick={() => setCategoryType("expense")}
                        data-testid="button-category-expense"
                      >
                        Expense
                      </Button>
                      <Button
                        type="button"
                        variant={categoryType === "income" ? "default" : "outline"}
                        onClick={() => setCategoryType("income")}
                        data-testid="button-category-income"
                      >
                        Income
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category-name">Name</Label>
                    <Input
                      id="category-name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="e.g., Groceries"
                      required
                      data-testid="input-category-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {iconOptions.map(icon => {
                        const IconComponent = (Icons as any)[icon];
                        return (
                          <Button
                            key={icon}
                            type="button"
                            variant={categoryIcon === icon ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCategoryIcon(icon)}
                            data-testid={`button-icon-${icon}`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category-color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="category-color"
                        type="color"
                        value={categoryColor}
                        onChange={(e) => setCategoryColor(e.target.value)}
                        className="h-12 w-20"
                        data-testid="input-category-color"
                      />
                      <Input
                        value={categoryColor}
                        onChange={(e) => setCategoryColor(e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-category"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Expense Categories</h4>
              <div className="space-y-2">
                {expenseCategories.length > 0 ? (
                  expenseCategories.map(category => {
                    const IconComponent = category.icon && (Icons as any)[category.icon]
                      ? (Icons as any)[category.icon]
                      : Icons.DollarSign;
                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                        data-testid={`category-item-${category.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color: category.color || undefined }} />
                          </div>
                          <span className="font-medium">{category.name}</span>
                          {category.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        {!category.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm(`Delete "${category.name}" category?`)) {
                                deleteMutation.mutate(category.id);
                              }
                            }}
                            data-testid={`button-delete-category-${category.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No expense categories yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Income Categories</h4>
              <div className="space-y-2">
                {incomeCategories.length > 0 ? (
                  incomeCategories.map(category => {
                    const IconComponent = category.icon && (Icons as any)[category.icon]
                      ? (Icons as any)[category.icon]
                      : Icons.DollarSign;
                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                        data-testid={`category-item-${category.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color: category.color || undefined }} />
                          </div>
                          <span className="font-medium">{category.name}</span>
                          {category.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        {!category.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm(`Delete "${category.name}" category?`)) {
                                deleteMutation.mutate(category.id);
                              }
                            }}
                            data-testid={`button-delete-category-${category.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No income categories yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
