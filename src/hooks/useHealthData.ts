import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface HealthData {
  id: string;
  user_id: string;
  height: string | null;
  blood_group: string | null;
  previous_diseases: string | null;
  current_medications: string | null;
  bad_habits: string | null;
  chronic_diseases: string | null;
  health_allergies: string | null;
  birth_defects: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthDataUpdate {
  height?: string | null;
  blood_group?: string | null;
  previous_diseases?: string | null;
  current_medications?: string | null;
  bad_habits?: string | null;
  chronic_diseases?: string | null;
  health_allergies?: string | null;
  birth_defects?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
}

export const useHealthData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchHealthData = async () => {
    if (!user) {
      setHealthData(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("health_data")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching health data:", error);
        toast({
          title: "Error",
          description: "Failed to load health data.",
          variant: "destructive",
        });
      } else {
        setHealthData(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateHealthData = async (updates: HealthDataUpdate) => {
    if (!user) return { error: new Error("Not authenticated") };

    setSaving(true);
    try {
      if (healthData) {
        // Update existing health data
        const { data, error } = await supabase
          .from("health_data")
          .update(updates)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        setHealthData(data);
        toast({
          title: "Health Data Updated",
          description: "Your health information has been saved successfully.",
        });
        return { error: null, data };
      } else {
        // Create new health data
        const { data, error } = await supabase
          .from("health_data")
          .insert({ user_id: user.id, ...updates })
          .select()
          .single();

        if (error) throw error;
        setHealthData(data);
        toast({
          title: "Health Data Saved",
          description: "Your health information has been saved successfully.",
        });
        return { error: null, data };
      }
    } catch (err: any) {
      console.error("Error saving health data:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save health data.",
        variant: "destructive",
      });
      return { error: err };
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [user]);

  return {
    healthData,
    loading,
    saving,
    updateHealthData,
    refetch: fetchHealthData,
  };
};
