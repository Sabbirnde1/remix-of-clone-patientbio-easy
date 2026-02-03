import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  location: string | null;
  phone: string | null;
  notification_email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  display_name?: string | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  location?: string | null;
  phone?: string | null;
  notification_email_enabled?: boolean;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!user) return { error: new Error("Not authenticated") };

    setSaving(true);
    try {
      if (profile) {
        // Update existing profile
        const { data, error } = await supabase
          .from("user_profiles")
          .update(updates)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
        toast({
          title: "Profile Updated",
          description: "Your profile has been saved successfully.",
        });
        return { error: null, data };
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("user_profiles")
          .insert({ user_id: user.id, ...updates })
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
        toast({
          title: "Profile Created",
          description: "Your profile has been created successfully.",
        });
        return { error: null, data };
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save profile.",
        variant: "destructive",
      });
      return { error: err };
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    saving,
    updateProfile,
    refetch: fetchProfile,
  };
};
