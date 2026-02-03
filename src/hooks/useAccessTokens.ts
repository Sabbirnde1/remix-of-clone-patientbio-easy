import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface AccessToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  accessed_at: string | null;
  access_count: number;
  is_revoked: boolean;
  label: string | null;
}

interface CreateTokenParams {
  expiresInHours: number;
  label?: string;
}

const generateToken = () => {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const useAccessTokens = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tokens, isLoading } = useQuery({
    queryKey: ["access-tokens", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("access_tokens")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AccessToken[];
    },
    enabled: !!user?.id,
  });

  const createTokenMutation = useMutation({
    mutationFn: async ({ expiresInHours, label }: CreateTokenParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const { data, error } = await supabase
        .from("access_tokens")
        .insert({
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString(),
          label: label || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AccessToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-tokens", user?.id] });
      toast({
        title: "Link Created",
        description: "Your shareable access link has been generated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revokeTokenMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("access_tokens")
        .update({ is_revoked: true })
        .eq("id", tokenId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-tokens", user?.id] });
      toast({
        title: "Link Revoked",
        description: "The access link has been deactivated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Revoke",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTokenMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("access_tokens")
        .delete()
        .eq("id", tokenId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-tokens", user?.id] });
      toast({
        title: "Link Deleted",
        description: "The access link has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if token is expired
  const isTokenExpired = (token: AccessToken) => {
    return new Date(token.expires_at) < new Date();
  };

  // Check if token is active (not expired and not revoked)
  const isTokenActive = (token: AccessToken) => {
    return !token.is_revoked && !isTokenExpired(token);
  };

  return {
    tokens: tokens || [],
    isLoading,
    createToken: createTokenMutation.mutate,
    isCreating: createTokenMutation.isPending,
    revokeToken: revokeTokenMutation.mutate,
    isRevoking: revokeTokenMutation.isPending,
    deleteToken: deleteTokenMutation.mutate,
    isDeleting: deleteTokenMutation.isPending,
    isTokenExpired,
    isTokenActive,
  };
};
