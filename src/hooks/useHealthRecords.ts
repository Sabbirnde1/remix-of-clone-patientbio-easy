import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type HealthRecord = Tables<"health_records">;
type HealthRecordInsert = TablesInsert<"health_records">;

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const useHealthRecords = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: records, isLoading, error } = useQuery({
    queryKey: ["health-records", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as HealthRecord[];
    },
    enabled: !!user?.id,
  });

  const uploadFile = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error("Not authenticated");

    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      throw new Error(
        "Invalid file type. Accepted: JPEG, PNG, GIF, WebP, PDF"
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large. Maximum size is 10MB");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    setUploadProgress(10);

    const { error: uploadError } = await supabase.storage
      .from("health-records")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    setUploadProgress(80);

    if (uploadError) throw uploadError;

    // Get the public URL (signed URL for private bucket)
    const { data: urlData } = await supabase.storage
      .from("health-records")
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    setUploadProgress(100);

    if (!urlData?.signedUrl) {
      throw new Error("Failed to get file URL");
    }

    return fileName; // Store path, not signed URL
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    const { data } = await supabase.storage
      .from("health-records")
      .createSignedUrl(filePath, 60 * 60); // 1 hour

    return data?.signedUrl || null;
  };

  const createRecordMutation = useMutation({
    mutationFn: async ({
      file,
      metadata,
    }: {
      file: File;
      metadata: Omit<HealthRecordInsert, "user_id" | "file_url">;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Upload file first
      const filePath = await uploadFile(file);

      // Create database record
      const record: HealthRecordInsert = {
        ...metadata,
        user_id: user.id,
        file_url: filePath,
        file_type: file.type,
        file_size: file.size,
      };

      const { data, error } = await supabase
        .from("health_records")
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records", user?.id] });
      setUploadProgress(0);
      toast({
        title: "Success",
        description: "Health record uploaded successfully",
      });
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (record: HealthRecord) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("health-records")
        .remove([record.file_url]);

      if (storageError) console.error("Storage delete error:", storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from("health_records")
        .delete()
        .eq("id", record.id)
        .eq("user_id", user.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records", user?.id] });
      toast({
        title: "Deleted",
        description: "Health record deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    records: records || [],
    isLoading,
    error,
    uploadProgress,
    createRecord: createRecordMutation.mutate,
    isCreating: createRecordMutation.isPending,
    deleteRecord: deleteRecordMutation.mutate,
    isDeleting: deleteRecordMutation.isPending,
    getSignedUrl,
  };
};
