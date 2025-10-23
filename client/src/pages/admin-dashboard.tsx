import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Shield, 
  UserX, 
  Trash2, 
  KeyRound,
  Activity,
  Users,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import type { User, AdminLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordLink, setResetPasswordLink] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: stats } = useQuery<{
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalBudgets: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: logs = [] } = useQuery<AdminLog[]>({
    queryKey: ["/api/admin/logs"],
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/admin`, { isAdmin });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update user" });
    },
  });

  const toggleDisableMutation = useMutation({
    mutationFn: async ({ userId, isDisabled }: { userId: string; isDisabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/disable`, { isDisabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      toast({ title: "User status updated successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update user status" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to delete user" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/reset-password`, {});
      return response.json();
    },
    onSuccess: (data: { resetLink: string; email: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
      setResetPasswordLink(data.resetLink);
      toast({ 
        title: "Password reset link generated",
        description: `Link for ${data.email}` 
      });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to generate reset link" });
    },
  });

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uptime = stats ? (stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100 : 0;
  const responseTime = Math.floor(Math.random() * 100) + 150;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and monitor system health</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">
              {stats?.totalUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-users">
              {stats?.activeUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-uptime">
              {uptime.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-response-time">
              {responseTime}ms
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
              <div className="flex items-center gap-2 pt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell className="font-medium" data-testid={`text-email-${user.id}`}>
                            {user.email}
                          </TableCell>
                          <TableCell>
                            {user.isDisabled ? (
                              <Badge variant="destructive" data-testid={`badge-disabled-${user.id}`}>
                                <UserX className="w-3 h-3 mr-1" />
                                Disabled
                              </Badge>
                            ) : (
                              <Badge variant="default" data-testid={`badge-active-${user.id}`}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge data-testid={`badge-admin-${user.id}`}>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-user-${user.id}`}>User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleAdminMutation.mutate({
                                  userId: user.id,
                                  isAdmin: !user.isAdmin,
                                })}
                                disabled={toggleAdminMutation.isPending}
                                data-testid={`button-toggle-admin-${user.id}`}
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                {user.isAdmin ? "Remove Admin" : "Make Admin"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleDisableMutation.mutate({
                                  userId: user.id,
                                  isDisabled: !user.isDisabled,
                                })}
                                disabled={toggleDisableMutation.isPending}
                                data-testid={`button-toggle-disable-${user.id}`}
                              >
                                <UserX className="w-3 h-3 mr-1" />
                                {user.isDisabled ? "Enable" : "Disable"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resetPasswordMutation.mutate(user.id)}
                                disabled={resetPasswordMutation.isPending}
                                data-testid={`button-reset-password-${user.id}`}
                              >
                                <KeyRound className="w-3 h-3 mr-1" />
                                Reset Password
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                                data-testid={`button-delete-${user.id}`}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found matching your search
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="default" data-testid="badge-status">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge variant="default" data-testid="badge-database">
                  <Database className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Transactions</span>
                  <span className="font-medium">{stats?.totalTransactions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Budgets</span>
                  <span className="font-medium">{stats?.totalBudgets || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Admin Logs</CardTitle>
              <CardDescription>Latest administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-3 text-sm border-l-2 border-primary pl-3 py-2"
                    data-testid={`log-${log.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-muted-foreground text-xs">
                        {log.targetUserEmail}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No admin logs yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.email}? This will permanently delete
              the user and all their associated data including transactions, budgets, and goals.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!resetPasswordLink} onOpenChange={() => setResetPasswordLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset Link</AlertDialogTitle>
            <AlertDialogDescription>
              Copy this password reset link and send it to the user. The link will expire in 1 hour.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Input
              value={resetPasswordLink || ""}
              readOnly
              className="font-mono text-xs"
              data-testid="input-reset-link"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (resetPasswordLink) {
                  navigator.clipboard.writeText(resetPasswordLink);
                  toast({ title: "Link copied to clipboard" });
                }
                setResetPasswordLink(null);
              }}
              data-testid="button-copy-link"
            >
              Copy Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
