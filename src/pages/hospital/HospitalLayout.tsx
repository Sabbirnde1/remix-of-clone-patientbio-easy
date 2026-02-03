import { Outlet, Navigate, useParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { HospitalSidebar } from "@/components/hospital/HospitalSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHospitalAdmin } from "@/hooks/useHospitalStaff";
import { useHospital } from "@/hooks/useHospitals";
import { Loader2 } from "lucide-react";

export default function HospitalLayout() {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: hospital, isLoading: hospitalLoading } = useHospital(hospitalId);
  const { data: isAdmin, isLoading: adminLoading } = useIsHospitalAdmin(hospitalId);

  const isLoading = authLoading || hospitalLoading || adminLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading hospital...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hospital) {
    return <Navigate to="/hospitals" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <HospitalSidebar hospital={hospital} isAdmin={isAdmin || false} />
        <SidebarInset className="flex-1">
          <header className="flex h-12 sm:h-14 items-center gap-2 sm:gap-4 border-b border-border bg-background px-3 sm:px-4">
            <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9" />
            <div className="flex-1">
              <h1 className="text-sm sm:text-base font-semibold truncate">
                {hospital.name}
              </h1>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6">
            <Outlet context={{ hospital, isAdmin }} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
