import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DoctorApplication } from "@/types/hospital";
import { toast } from "sonner";

export const useHospitalApplications = (hospitalId: string | undefined) => {
  return useQuery({
    queryKey: ["hospital-applications", hospitalId],
    queryFn: async () => {
      if (!hospitalId) return [];

      const { data, error } = await supabase
        .from("doctor_applications")
        .select("*")
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DoctorApplication[];
    },
    enabled: !!hospitalId,
  });
};

export const useMyApplications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("doctor_applications")
        .select(`
          *,
          hospital:hospitals(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useApplyToHospital = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      applicationData: Omit<DoctorApplication, "id" | "user_id" | "status" | "reviewed_by" | "reviewed_at" | "rejection_reason" | "created_at" | "updated_at">
    ) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("doctor_applications").insert({
        ...applicationData,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit application: " + error.message);
    },
  });
};

export const useReviewApplication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      applicationId,
      hospitalId,
      status,
      rejectionReason,
      applicationData,
    }: {
      applicationId: string;
      hospitalId: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
      applicationData: DoctorApplication;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Update application status
      const { error: updateError } = await supabase
        .from("doctor_applications")
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: status === "rejected" ? rejectionReason : null,
        })
        .eq("id", applicationId);

      if (updateError) throw updateError;

      // If approved, add to hospital staff and create doctor profile
      if (status === "approved") {
        // Add to hospital staff
        const { error: staffError } = await supabase
          .from("hospital_staff")
          .insert({
            hospital_id: hospitalId,
            user_id: applicationData.user_id,
            role: "doctor",
          });

        if (staffError) throw staffError;

        // Create or update doctor profile
        const { error: profileError } = await supabase
          .from("doctor_profiles")
          .upsert({
            user_id: applicationData.user_id,
            full_name: applicationData.full_name,
            license_number: applicationData.license_number,
            specialty: applicationData.specialty,
            qualification: applicationData.qualification,
            experience_years: applicationData.experience_years,
            phone: applicationData.phone,
            is_verified: true,
          });

        if (profileError) throw profileError;

        // Add doctor role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: applicationData.user_id, role: "doctor" });

        if (roleError && !roleError.message.includes("duplicate")) {
          console.error("Error adding doctor role:", roleError);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hospital-applications", variables.hospitalId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hospital-staff", variables.hospitalId],
      });
      toast.success(
        variables.status === "approved"
          ? "Application approved! Doctor added to staff."
          : "Application rejected."
      );
    },
    onError: (error) => {
      toast.error("Failed to review application: " + error.message);
    },
  });
};
