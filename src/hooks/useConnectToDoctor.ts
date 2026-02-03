import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Doctor {
  id: string;
  full_name: string;
  specialty: string | null;
  avatar_url: string | null;
}

interface ConnectResult {
  success: boolean;
  doctor: Doctor;
}

export const useConnectToDoctor = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [previewDoctor, setPreviewDoctor] = useState<Doctor | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const connectMutation = useMutation({
    mutationFn: async (doctorCode: string): Promise<ConnectResult> => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("connect-to-doctor", {
        body: { doctor_code: doctorCode },
      });

      if (error) {
        throw new Error(error.message || "Failed to connect to doctor");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to connect to doctor");
      }

      return data as ConnectResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patient-doctor-access", user?.id] });
      toast.success(`Connected with Dr. ${data.doctor.full_name}`);
      setPreviewDoctor(null);
      setPreviewError(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const lookupDoctor = async (doctorCode: string) => {
    setPreviewError(null);
    setPreviewDoctor(null);

    if (!doctorCode || doctorCode.length < 8) {
      setPreviewError("Please enter a valid 8-character Doctor ID");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("connect-to-doctor", {
        body: { doctor_code: doctorCode },
      });

      if (error) {
        setPreviewError(error.message || "Failed to lookup doctor");
        return;
      }

      // Check for already connected (409 status returns doctor info too)
      if (data.error) {
        if (data.doctor) {
          setPreviewDoctor(data.doctor);
          setPreviewError(data.error);
        } else {
          setPreviewError(data.error);
        }
        return;
      }

      // If success, the connection was already made
      if (data.success && data.doctor) {
        queryClient.invalidateQueries({ queryKey: ["patient-doctor-access", user?.id] });
        toast.success(`Connected with Dr. ${data.doctor.full_name}`);
        setPreviewDoctor(null);
        return;
      }
    } catch (err) {
      setPreviewError("An unexpected error occurred");
    }
  };

  const resetPreview = () => {
    setPreviewDoctor(null);
    setPreviewError(null);
  };

  return {
    connect: connectMutation.mutate,
    isConnecting: connectMutation.isPending,
    lookupDoctor,
    previewDoctor,
    previewError,
    resetPreview,
  };
};
