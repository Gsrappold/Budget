import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Target, 
  Settings,
  TrendingUp,
  LogOut,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Budgets", url: "/budgets", icon: Wallet },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminMenuItem = { title: "Admin", url: "/admin", icon: Shield };

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error signing out" });
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-3 px-4 py-6">
            <div className="p-2 bg-primary rounded-lg">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BudgetFlow</span>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === adminMenuItem.url}>
                    <Link href={adminMenuItem.url} data-testid="link-admin">
                      <adminMenuItem.icon className="w-5 h-5" />
                      <span>{adminMenuItem.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback>{getInitials(user?.displayName || user?.email)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.displayName || user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleSignOut}
            data-testid="button-signout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
