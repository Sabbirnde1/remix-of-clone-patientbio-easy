import * as React from "react";
import * as ReactDOM from "react-dom";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const DropdownMenu = ({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: handleOpenChange, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, onClick, children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenuTrigger must be used within a DropdownMenu");
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    context.onOpenChange(!context.open);
  };

  const combinedRef = (node: HTMLButtonElement | null) => {
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
    (context.triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      ref: combinedRef,
      "data-state": context.open ? "open" : "closed",
    });
  }

  return (
    <button
      ref={combinedRef}
      type="button"
      onClick={handleClick}
      data-state={context.open ? "open" : "closed"}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div role="group" {...props}>{children}</div>
);

const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return ReactDOM.createPortal(children, document.body);
};

// Simplified Sub menu - just groups content
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const DropdownMenuRadioGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div role="radiogroup" {...props}>{children}</div>
);

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, sideOffset = 4, align = "start", children, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    if (!context) {
      throw new Error("DropdownMenuContent must be used within a DropdownMenu");
    }

    const { open, onOpenChange, triggerRef } = context;
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    // Calculate position
    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let left = rect.left;
        
        if (align === "center") {
          left = rect.left + rect.width / 2 - 100; // Approximate center
        } else if (align === "end") {
          left = rect.right - 200; // Approximate width
        }

        setPosition({
          top: rect.bottom + sideOffset,
          left: Math.max(8, left),
        });
      }
    }, [open, align, sideOffset, triggerRef]);

    // Handle click outside and escape
    React.useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          onOpenChange(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onOpenChange(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, onOpenChange, triggerRef]);

    if (!open || !mounted) return null;

    return ReactDOM.createPortal(
      <div
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
        }}
        {...props}
      >
        {children}
      </div>,
      document.body
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  disabled?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, disabled, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onClick?.(e);
      context?.onOpenChange(false);
    };

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        data-disabled={disabled || undefined}
        onClick={handleClick}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          inset && "pl-8",
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        onCheckedChange?.(!checked);
      }
    };

    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        data-disabled={disabled || undefined}
        onClick={handleClick}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  checked?: boolean;
  disabled?: boolean;
}

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ className, children, checked, disabled, ...props }, ref) => (
    <div
      ref={ref}
      role="menuitemradio"
      aria-checked={checked}
      data-disabled={disabled || undefined}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Circle className="h-2 w-2 fill-current" />}
      </span>
      {children}
    </div>
  )
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// Sub menu components (simplified versions)
const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </div>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
