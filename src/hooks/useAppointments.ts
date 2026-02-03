import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AppointmentStatus } from "@/types/hospital";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UseAppointmentsOptions {
  hospitalId?: string;
  doctorId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { hospitalId, doctorId, patientId, dateFrom, dateTo } = options;

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", hospitalId, doctorId, patientId, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          doctor_profile:doctor_profiles!appointments_doctor_id_fkey(
            full_name,
            specialty,
            avatar_url
          ),
          patient_profile:user_profiles!appointments_patient_id_fkey(
            display_name,
            phone
          ),
          hospital:hospitals(
            id,
            name
          )
        `);

      if (hospitalId) {
        query = query.eq("hospital_id", hospitalId);
      }
      if (doctorId) {
        query = query.eq("doctor_id", doctorId);
      }
      if (patientId) {
        query = query.eq("patient_id", patientId);
      }
      if (dateFrom) {
        query = query.gte("appointment_date", dateFrom);
      }
      if (dateTo) {
        query = query.lte("appointment_date", dateTo);
      }

      const { data, error } = await query.order("appointment_date").order("start_time");
      
      if (error) throw error;
      return data as unknown as Appointment[];
    },
    enabled: !!user,
  });

  const createAppointment = useMutation({
    mutationFn: async (appointment: {
      doctor_id: string;
      hospital_id?: string;
      appointment_date: string;
      start_time: string;
      end_time: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          patient_id: user?.id,
          doctor_id: appointment.doctor_id,
          hospital_id: appointment.hospital_id,
          appointment_date: appointment.appointment_date,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          reason: appointment.reason,
          status: "scheduled",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment booked successfully");
    },
    onError: (error) => {
      toast.error("Failed to book appointment: " + error.message);
    },
  });

  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: AppointmentStatus; notes?: string }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      if (status === "cancelled") {
        updateData.cancelled_by = user?.id;
        updateData.cancelled_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated");
    },
    onError: (error) => {
      toast.error("Failed to update appointment: " + error.message);
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          cancelled_by: user?.id,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel appointment: " + error.message);
    },
  });

  return {
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
  };
}

// Hook for patient's own appointments
export function useMyAppointments() {
  const { user } = useAuth();
  return useAppointments({ patientId: user?.id });
}

// Hook for doctor's appointments
export function useDoctorAppointments(hospitalId?: string) {
  const { user } = useAuth();
  return useAppointments({ doctorId: user?.id, hospitalId });
}

// Hook for hospital appointments (all doctors)
export function useHospitalAppointments(hospitalId: string) {
  return useAppointments({ hospitalId });
}
