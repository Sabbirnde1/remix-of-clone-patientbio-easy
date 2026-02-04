import * as React from "react";
import * as ReactDOM from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Toast types and context
type ToastVariant = "default" | "destructive";

interface ToastData {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastVariant;
  open: boolean;
}

interface ToastContextType {
  toasts: ToastData[];
  toast: (props: Omit<ToastData, "id" | "open">) => { id: string; dismiss: () => void; update: (props: Partial<ToastData>) => void };
  dismiss: (toastId?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

// Generate unique ID
let toastCount = 0;
function genId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString();
}

// Toast Provider
const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);
  const timeoutsRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((prev) =>
      prev.map((t) =>
        toastId === undefined || t.id === toastId ? { ...t, open: false } : t
      )
    );

    // Remove after animation
    setTimeout(() => {
      setToasts((prev) =>
        toastId === undefined ? [] : prev.filter((t) => t.id !== toastId)
      );
    }, 300);
  }, []);

  const toast = React.useCallback(
    (props: Omit<ToastData, "id" | "open">) => {
      const id = genId();

      setToasts((prev) => {
        const newToasts = [{ ...props, id, open: true }, ...prev];
        return newToasts.slice(0, TOAST_LIMIT);
      });

      // Auto dismiss
      const timeout = setTimeout(() => {
        dismiss(id);
        timeoutsRef.current.delete(id);
      }, TOAST_REMOVE_DELAY);
      timeoutsRef.current.set(id, timeout);

      return {
        id,
        dismiss: () => dismiss(id),
        update: (updateProps: Partial<ToastData>) => {
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updateProps } : t))
          );
        },
      };
    },
    [dismiss]
  );

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Standalone toast function for use outside of components
let globalToast: ToastContextType["toast"] | null = null;
let globalDismiss: ToastContextType["dismiss"] | null = null;

export function setGlobalToastFunctions(
  toastFn: ToastContextType["toast"],
  dismissFn: ToastContextType["dismiss"]
) {
  globalToast = toastFn;
  globalDismiss = dismissFn;
}

export function toast(props: Omit<ToastData, "id" | "open">) {
  if (!globalToast) {
    console.warn("Toast called before ToastProvider is mounted");
    return { id: "", dismiss: () => {}, update: () => {} };
  }
  return globalToast(props);
}

// Toast Viewport - renders toasts in a portal
export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  // Set global functions
  const context = React.useContext(ToastContext);
  React.useEffect(() => {
    if (context) {
      setGlobalToastFunctions(context.toast, context.dismiss);
    }
  }, [context]);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body
  );
}

// Individual Toast component
interface InternalToastProps extends ToastData {
  onClose: () => void;
}

function Toast({ id, title, description, action, variant = "default", open, onClose }: InternalToastProps) {
  const variantStyles = {
    default: "border bg-background text-foreground",
    destructive: "border-destructive bg-destructive text-destructive-foreground",
  };

  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
        "data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full",
        variantStyles[variant]
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action}
      <button
        onClick={onClose}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2",
          variant === "destructive"
            ? "text-red-300 hover:text-red-50 focus:ring-red-400"
            : "text-foreground/50 hover:text-foreground"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}

// Toast Action component
export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors",
      "hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

// Re-exports for backward compatibility
export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
export type ToastActionElement = React.ReactElement<typeof ToastAction>;

// Legacy exports for compatibility with existing code
export const ToastTitle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-sm font-semibold", className)} {...props} />
);

export const ToastDescription = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-sm opacity-90", className)} {...props} />
);

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
));
ToastClose.displayName = "ToastClose";
