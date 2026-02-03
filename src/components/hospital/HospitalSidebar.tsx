import { LayoutDashboard, Users, UserPlus, Settings, ArrowLeft, Building2, Stethoscope, Pill, CalendarDays, Clock, Bed, Receipt, UserCheck, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Hospital } from "@/types/hospital";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface HospitalSidebarProps {
  hospital: Hospital;
  isAdmin: boolean;
  isDoctor?: boolean;
}

export function HospitalSidebar({ hospital, isAdmin, isDoctor }: HospitalSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const baseUrl = `/hospital/${hospital.id}`;

  const managementItems = [
    { title: "Dashboard", url: baseUrl, icon: LayoutDashboard },
    { title: "Analytics", url: `${baseUrl}/analytics`, icon: BarChart3 },
    { title: "Staff", url: `${baseUrl}/staff`, icon: Users },
    { title: "Appointments", url: `${baseUrl}/appointments`, icon: CalendarDays },
    { title: "Wards & Beds", url: `${baseUrl}/wards`, icon: Bed },
    { title: "Admissions", url: `${baseUrl}/admissions`, icon: UserCheck },
    { title: "Billing", url: `${baseUrl}/billing`, icon: Receipt },
    ...(isAdmin
      ? [
          { title: "Applications", url: `${baseUrl}/applications`, icon: UserPlus },
          { title: "Settings", url: `${baseUrl}/settings`, icon: Settings },
        ]
      : []),
  ];

  const doctorItems = [
    { title: "My Patients", url: `${baseUrl}/patients`, icon: Stethoscope },
    { title: "Prescriptions", url: `${baseUrl}/prescriptions`, icon: Pill },
    { title: "My Availability", url: `${baseUrl}/availability`, icon: Clock },
  ];

  const isActive = (path: string) => {
    if (path === baseUrl) {
      return location.pathname === baseUrl;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-foreground truncate">
              {hospital.name}
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Doctor Portal Section */}
        {isDoctor && (
          <SidebarGroup>
            <SidebarGroupLabel>Doctor Portal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {doctorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-full justify-start gap-2"
        >
          <Link to="/hospitals">
            <ArrowLeft className="h-4 w-4" />
            {!collapsed && <span>All Hospitals</span>}
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
