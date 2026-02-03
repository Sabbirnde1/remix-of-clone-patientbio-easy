import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string | null;
  diagnosis: string | null;
  medications: Medication[];
  instructions: string | null;
  notes: string | null;
  follow_up_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionInput {
  patient_id: string;
  hospital_id?: string;
  diagnosis?: string;
  medications: Medication[];
  instructions?: string;
  notes?: string;
  follow_up_date?: string;
}

const parseMedications = (medications: Json | null): Medication[] => {
  if (!medications) return [];
  if (Array.isArray(medications)) {
    return medications as unknown as Medication[];
  }
  return [];
};

// For doctors - get prescriptions they've written
export const useDoctorPrescriptions = (patientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["doctor-prescriptions", user?.id, patientId],
    queryFn: async (): Promise<Prescription[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from("prescriptions")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(prescription => ({
        ...prescription,
        medications: parseMedications(prescription.medications)
      }));
    },
    enabled: !!user?.id,
  });
};

// For patients - get prescriptions issued to them
export const usePatientPrescriptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["patient-prescriptions", user?.id],
    queryFn: async (): Promise<Prescription[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(prescription => ({
        ...prescription,
        medications: parseMedications(prescription.medications)
      }));
    },
    enabled: !!user?.id,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePrescriptionInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("prescriptions")
        .insert({
          patient_id: input.patient_id,
          doctor_id: user.id,
          hospital_id: input.hospital_id || null,
          diagnosis: input.diagnosis || null,
          medications: input.medications as unknown as Json,
          instructions: input.instructions || null,
          notes: input.notes || null,
          follow_up_date: input.follow_up_date || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      toast.success("Prescription created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create prescription: " + error.message);
    },
  });
};

export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<CreatePrescriptionInput> & { id: string; is_active?: boolean }) => {
      const updateData: Record<string, unknown> = {};
      
      if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis;
      if (data.instructions !== undefined) updateData.instructions = data.instructions;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.follow_up_date !== undefined) updateData.follow_up_date = data.follow_up_date;
      if (data.medications !== undefined) {
        updateData.medications = data.medications as unknown as Json;
      }
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      const { error } = await supabase
        .from("prescriptions")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] });
      toast.success("Prescription updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update prescription: " + error.message);
    },
  });
};

export const useTogglePrescriptionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("prescriptions")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] });
      toast.success(
        variables.is_active
          ? "Prescription marked as active"
          : "Prescription marked as completed"
      );
    },
    onError: (error) => {
      toast.error("Failed to update prescription status: " + error.message);
    },
  });
};
