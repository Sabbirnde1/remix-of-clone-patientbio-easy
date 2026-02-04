import { ToastProvider, ToastViewport } from "@/components/ui/toast";

export function Toaster({ children }: { children?: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
