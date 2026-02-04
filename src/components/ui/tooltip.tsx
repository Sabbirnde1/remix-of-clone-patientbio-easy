import * as React from "react";
import { cn } from "@/lib/utils";

// Tooltip Context
interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  delayDuration: number;
  triggerRef: React.RefObject<HTMLElement>;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within a Tooltip");
  }
  return context;
}

// Tooltip Provider Context
interface TooltipProviderContextType {
  delayDuration: number;
}

const TooltipProviderContext = React.createContext<TooltipProviderContextType>({
  delayDuration: 700,
});

// Tooltip Provider
interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

const TooltipProvider = ({ children, delayDuration = 700 }: TooltipProviderProps) => {
  return (
    <TooltipProviderContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipProviderContext.Provider>
  );
};

// Tooltip Root
interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  children: React.ReactNode;
}

const Tooltip = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration: customDelay,
  children,
}: TooltipProps) => {
  const providerContext = React.useContext(TooltipProviderContext);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const delayDuration = customDelay ?? providerContext.delayDuration;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <TooltipContext.Provider value={{ open, setOpen, delayDuration, triggerRef }}>
      <span className="relative inline-block">{children}</span>
    </TooltipContext.Provider>
  );
};

// Tooltip Trigger
interface TooltipTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const { setOpen, delayDuration, triggerRef } = useTooltipContext();
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => {
        setOpen(true);
      }, delayDuration);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setOpen(false);
    };

    const handleFocus = () => {
      setOpen(true);
    };

    const handleBlur = () => {
      setOpen(false);
    };

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ref: (node: HTMLElement) => {
          (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node as any);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLElement | null>).current = node;
          }
        },
      });
    }

    return (
      <span
        ref={(node) => {
          (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </span>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

// Tooltip Content
interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", align = "center", sideOffset = 4, children, hidden, ...props }, ref) => {
    const { open, triggerRef } = useTooltipContext();
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    React.useEffect(() => {
      if (!open || !triggerRef.current) return;

      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (side) {
        case "top":
          top = rect.top - sideOffset;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + sideOffset;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - sideOffset;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + sideOffset;
          break;
      }

      setPosition({ top, left });
    }, [open, side, sideOffset, triggerRef]);

    if (!open || hidden) return null;

    const slideFromClass = {
      top: "slide-in-from-bottom-2",
      bottom: "slide-in-from-top-2",
      left: "slide-in-from-right-2",
      right: "slide-in-from-left-2",
    };

    const transformClass = {
      top: "-translate-x-1/2 -translate-y-full",
      bottom: "-translate-x-1/2",
      left: "-translate-x-full -translate-y-1/2",
      right: "-translate-y-1/2",
    };

    return (
      <div
        ref={ref}
        role="tooltip"
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
        }}
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          slideFromClass[side],
          transformClass[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
