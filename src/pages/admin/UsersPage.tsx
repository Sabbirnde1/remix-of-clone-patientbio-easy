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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage user accounts and roles</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Users
                {filteredUsers.length > 0 && (
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                    {filteredUsers.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage registered users. Assign admin roles to trusted users.
              </CardDescription>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by email..."
              className="w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Failed to load users: {error.message}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-0 sm:mx-0">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Email</TableHead>
                      <TableHead className="text-xs sm:text-sm">Role</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Verified</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Joined</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Last Sign In</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
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
                          <TableCell className="font-medium text-xs sm:text-sm">
                            <span className="truncate max-w-[120px] sm:max-w-none block">{user.email}</span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-1 text-[10px] sm:text-xs">You</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === "admin" ? "default" : "secondary"}
                              className="flex items-center gap-1 w-fit text-[10px] sm:text-xs"
                            >
                              {user.role === "admin" ? (
                                <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              ) : (
                                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              )}
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {user.email_confirmed_at ? (
                              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs sm:text-sm">{formatDate(user.created_at)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{formatDate(user.last_sign_in_at)}</TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={pendingRoles[user.id] || user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value as "admin" | "user")}
                              disabled={isCurrentUser || isPending}
                            >
                              <SelectTrigger className="w-[90px] sm:w-[120px] h-8 sm:h-10 text-xs sm:text-sm">
                                {isPending ? (
                                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user" className="text-xs sm:text-sm">User</SelectItem>
                                <SelectItem value="admin" className="text-xs sm:text-sm">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
                        {searchQuery ? "No users match your search" : "No users found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
              
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
