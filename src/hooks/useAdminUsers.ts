import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: "admin" | "user";
  email_confirmed_at: string | null;
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "GET",
      });

      if (error) {
        console.error("Error fetching users:", error);
        throw new Error(error.message || "Failed to fetch users");
      }

      return data?.users || [];
    },
  });
};

export const useSetUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      role,
    }: {
      targetUserId: string;
      role: "admin" | "user";
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "admin-users?action=set-role",
        {
          method: "POST",
          body: { targetUserId, role },
        }
      );

      if (error) {
        throw new Error(error.message || "Failed to update role");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });
};
