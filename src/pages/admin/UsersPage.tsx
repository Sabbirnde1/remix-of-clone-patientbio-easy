import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, User, Loader2, RefreshCw } from "lucide-react";
import { useAdminUsers, useSetUserRole, AdminUser } from "@/hooks/useAdminUsers";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error, refetch } = useAdminUsers();
  const setRoleMutation = useSetUserRole();
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter((user) =>
      user.email?.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination({ data: filteredUsers, itemsPerPage: 10 });

  const handleRoleChange = (userId: string, newRole: "admin" | "user") => {
    setPendingRoles((prev) => ({ ...prev, [userId]: newRole }));
    setRoleMutation.mutate(
      { targetUserId: userId, role: newRole },
      {
        onSettled: () => {
          setPendingRoles((prev) => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
          });
        },
      }
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and roles</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users
                {filteredUsers.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredUsers.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                View and manage registered users. Assign admin roles to trusted users.
              </CardDescription>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by email or role..."
              className="w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Failed to load users: {error.message}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email Verified</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton columns={6} rows={5} />
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((user: AdminUser) => {
                      const isCurrentUser = user.id === currentUser?.id;
                      const isPending = pendingRoles[user.id] !== undefined;
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.email}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2">You</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === "admin" ? "default" : "secondary"}
                              className="flex items-center gap-1 w-fit"
                            >
                              {user.role === "admin" ? (
                                <Shield className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.email_confirmed_at ? (
                              <Badge variant="secondary">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={pendingRoles[user.id] || user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value as "admin" | "user")}
                              disabled={isCurrentUser || isPending}
                            >
                              <SelectTrigger className="w-[120px]">
                                {isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "No users match your search" : "No users found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
