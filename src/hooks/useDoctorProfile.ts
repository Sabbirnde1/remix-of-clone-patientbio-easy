import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DoctorProfile } from "@/types/hospital";
import { toast } from "sonner";

export const useDoctorProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["doctor-profile", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      return data as DoctorProfile | null;
    },
    enabled: !!targetUserId,
  });
};

export const useCreateDoctorProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      profileData: Omit<DoctorProfile, "id" | "user_id" | "is_verified" | "created_at" | "updated_at">
    ) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Create the doctor profile
      const { error: profileError } = await supabase.from("doctor_profiles").insert({
        ...profileData,
        user_id: user.id,
      });

      if (profileError) throw profileError;

      // Auto-assign "doctor" role to user_roles table
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "doctor",
      });

      // Ignore if role already exists (might fail with unique constraint)
      if (roleError && !roleError.message.includes("duplicate")) {
        console.warn("Could not assign doctor role:", roleError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
      queryClient.invalidateQueries({ queryKey: ["is-doctor"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      toast.success("Doctor profile created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create profile: " + error.message);
    },
  });
};

export const useUpdateDoctorProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profileData: Partial<DoctorProfile>) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("doctor_profiles")
        .update(profileData)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });
};

export const useIsDoctor = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-doctor", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "doctor")
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
    enabled: !!user?.id,
  });
};
