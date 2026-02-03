// This file is kept for API compatibility
// Using custom toast implementation instead of sonner
import { toast as internalToast } from "@/hooks/use-toast";
import { Toaster as InternalToaster } from "@/components/ui/toaster";

// Re-export for compatibility
const Toaster = InternalToaster;

// Create a simplified toast function matching sonner's API
const toast = (message: string | { title?: string; description?: string }) => {
  if (typeof message === "string") {
    return internalToast({ description: message });
  }
  return internalToast(message);
};

// Add common toast methods
toast.success = (message: string) => internalToast({ title: "Success", description: message });
toast.error = (message: string) => internalToast({ title: "Error", description: message, variant: "destructive" });
toast.warning = (message: string) => internalToast({ title: "Warning", description: message });
toast.info = (message: string) => internalToast({ title: "Info", description: message });

export { Toaster, toast };
