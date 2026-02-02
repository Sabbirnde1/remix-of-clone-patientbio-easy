import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface HeroStats {
  stats: Array<{ value: string; label: string }>;
}

export interface ContactInfo {
  email: string;
  emailDescription: string;
  phone: string;
  phoneDescription: string;
  address: string;
  addressDescription: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQContent {
  faqs: FAQItem[];
}

// Default values used as fallbacks
export const DEFAULT_HERO_STATS: HeroStats = {
  stats: [
    { value: "195+", label: "Countries" },
    { value: "100%", label: "Patient Owned" },
    { value: "24/7", label: "Instant Access" },
  ],
};

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: "hello@patientbio.app",
  emailDescription: "We'll respond within 24 hours",
  phone: "+1 (555) 123-4567",
  phoneDescription: "Mon-Fri, 9am-6pm PST",
  address: "123 Innovation Way",
  addressDescription: "San Francisco, CA 94102",
};

export const DEFAULT_FAQ_CONTENT: FAQContent = {
  faqs: [
    {
      question: "How secure is my health data?",
      answer: "We use military-grade encryption and are HIPAA compliant. Your data is never sold or shared without explicit consent.",
    },
    {
      question: "Can I export my data?",
      answer: "Yes! You can export all your health records in standard formats like PDF, HL7, or FHIR at any time.",
    },
    {
      question: "Is Patient Bio free?",
      answer: "We offer a free tier with basic features. Premium plans unlock advanced features like family sharing and AI insights.",
    },
  ],
};

type ContentKey = "hero_stats" | "contact_info" | "faq_content";
type ContentValue = HeroStats | ContactInfo | FAQContent;

export function useSiteContent<T extends ContentValue>(key: ContentKey, defaultValue: T) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["site-content", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (error) throw error;
      if (!data?.value) return defaultValue;
      return data.value as unknown as T;
    },
  });

  const mutation = useMutation({
    mutationFn: async (value: T) => {
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      const jsonValue = value as unknown as Json;

      if (existing) {
        const { error } = await supabase
          .from("site_content")
          .update({ value: jsonValue, updated_at: new Date().toISOString() })
          .eq("key", key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_content")
          .insert([{ key, value: jsonValue }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content", key] });
    },
  });

  return {
    data: query.data ?? defaultValue,
    isLoading: query.isLoading,
    error: query.error,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
