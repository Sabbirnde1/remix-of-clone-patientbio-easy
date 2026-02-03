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
  patient_name?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  doctor_qualification?: string;
  doctor_phone?: string;
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

// For doctors - get prescriptions they've written (with patient names)
export const useDoctorPrescriptions = (patientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["doctor-prescriptions", user?.id, patientId],
    queryFn: async (): Promise<Prescription[]> => {
      if (!user?.id) return [];

      // First get prescriptions
      let query = supabase
        .from("prescriptions")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data: prescriptions, error } = await query;

      if (error) throw error;
      if (!prescriptions || prescriptions.length === 0) return [];

      // Get unique patient IDs and fetch their profiles
      const patientIds = [...new Set(prescriptions.map(p => p.patient_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name")
        .in("user_id", patientIds);

      const patientMap = new Map(
        (profiles || []).map(p => [p.user_id, p.display_name])
      );
      
      return prescriptions.map(prescription => ({
        ...prescription,
        medications: parseMedications(prescription.medications),
        patient_name: patientMap.get(prescription.patient_id) || undefined,
      }));
    },
    enabled: !!user?.id,
  });
};

// For patients - get prescriptions issued to them (with doctor info)
export const usePatientPrescriptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["patient-prescriptions", user?.id],
    queryFn: async (): Promise<Prescription[]> => {
      if (!user?.id) return [];

      const { data: prescriptions, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!prescriptions || prescriptions.length === 0) return [];

      // Get unique doctor IDs and fetch their profiles
      const doctorIds = [...new Set(prescriptions.map(p => p.doctor_id))];
      const { data: doctors } = await supabase
        .from("doctor_profiles")
        .select("user_id, full_name, specialty, qualification, phone")
        .in("user_id", doctorIds);

      const doctorMap = new Map(
        (doctors || []).map(d => [d.user_id, d])
      );
      
      return prescriptions.map(prescription => {
        const doctor = doctorMap.get(prescription.doctor_id);
        return {
          ...prescription,
          medications: parseMedications(prescription.medications),
          doctor_name: doctor?.full_name,
          doctor_specialty: doctor?.specialty,
          doctor_qualification: doctor?.qualification,
          doctor_phone: doctor?.phone,
        };
      });
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
