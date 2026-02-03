import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { HospitalStaff, HospitalStaffRole, DoctorProfile } from "@/types/hospital";
import { toast } from "sonner";

interface StaffWithProfile extends HospitalStaff {
  doctor_profile?: DoctorProfile | null;
}

export const useHospitalStaff = (hospitalId: string | undefined) => {
  return useQuery({
    queryKey: ["hospital-staff", hospitalId],
    queryFn: async (): Promise<StaffWithProfile[]> => {
      if (!hospitalId) return [];

      // Get staff members
      const { data: staffData, error: staffError } = await supabase
        .from("hospital_staff")
        .select("*")
        .eq("hospital_id", hospitalId)
        .eq("is_active", true)
        .order("joined_at", { ascending: false });

      if (staffError) throw staffError;

      // Get doctor profiles for staff members
      const userIds = staffData.map((s) => s.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("doctor_profiles")
        .select("*")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Merge profiles with staff
      return staffData.map((staff) => ({
        ...staff,
        role: staff.role as HospitalStaffRole,
        doctor_profile: profiles?.find((p) => p.user_id === staff.user_id) || null,
      }));
    },
    enabled: !!hospitalId,
  });
};

export const useIsHospitalAdmin = (hospitalId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-hospital-admin", hospitalId, user?.id],
    queryFn: async () => {
      if (!hospitalId || !user?.id) return false;

      const { data, error } = await supabase
        .from("hospital_staff")
        .select("role")
        .eq("hospital_id", hospitalId)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error) return false;
      return data?.role === "admin";
    },
    enabled: !!hospitalId && !!user?.id,
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hospitalId,
      userId,
      role,
      department,
      employeeId,
    }: {
      hospitalId: string;
      userId: string;
      role: HospitalStaffRole;
      department?: string;
      employeeId?: string;
    }) => {
      const { error } = await supabase.from("hospital_staff").insert({
        hospital_id: hospitalId,
        user_id: userId,
        role,
        department,
        employee_id: employeeId,
      });

      if (error) throw error;

      // Add doctor role if needed
      if (role === "doctor") {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "doctor" });

        if (roleError && !roleError.message.includes("duplicate")) {
          console.error("Error adding doctor role:", roleError);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital-staff", variables.hospitalId],
      });
      toast.success("Staff member added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add staff: " + error.message);
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      hospitalId,
      ...data
    }: Partial<HospitalStaff> & { id: string; hospitalId: string }) => {
      const { error } = await supabase
        .from("hospital_staff")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital-staff", variables.hospitalId],
      });
      toast.success("Staff member updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update staff: " + error.message);
    },
  });
};

export const useRemoveStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      hospitalId,
    }: {
      id: string;
      hospitalId: string;
    }) => {
      const { error } = await supabase
        .from("hospital_staff")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital-staff", variables.hospitalId],
      });
      toast.success("Staff member removed successfully!");
    },
    onError: (error) => {
      toast.error("Failed to remove staff: " + error.message);
    },
  });
};
