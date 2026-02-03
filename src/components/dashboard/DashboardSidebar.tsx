import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Heart,
  FileText,
  Upload,
  Share2,
  Users,
  QrCode,
  LogOut,
  ChevronLeft,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Basic Information", url: "/dashboard/profile", icon: User },
  { title: "Health Data", url: "/dashboard/health-data", icon: Heart },
  { title: "Prescriptions", url: "/dashboard/prescriptions", icon: FileText },
  { title: "Upload File", url: "/dashboard/upload", icon: Upload },
  { title: "Share Data", url: "/dashboard/share", icon: Share2 },
  { title: "My Doctors", url: "/dashboard/doctors", icon: Users },
  { title: "Appointments", url: "/dashboard/appointments", icon: CalendarDays },
  { title: "My QR Code", url: "/dashboard/qr-code", icon: QrCode },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      {/* Header with logo and user info */}
      <SidebarHeader className="bg-gradient-to-br from-primary to-secondary p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white font-bold text-lg">Patient Bio</span>
              <span className="text-white/70 text-xs truncate">
                {user?.email}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive(item.url)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with sign out */}
      <SidebarFooter className="bg-card border-t border-border/50 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
