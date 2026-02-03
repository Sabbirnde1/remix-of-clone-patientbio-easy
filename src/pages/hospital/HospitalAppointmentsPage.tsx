import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Hospital, Appointment, APPOINTMENT_STATUS_OPTIONS } from "@/types/hospital";
import { useHospitalAppointments, useDoctorAppointments } from "@/hooks/useAppointments";
import { useHospitalStaff } from "@/hooks/useHospitalStaff";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isToday } from "date-fns";
import { Calendar, List, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface HospitalContext {
  hospital: Hospital;
  isAdmin: boolean;
  isDoctor: boolean;
}

type ViewRange = "today" | "week" | "month";

export default function HospitalAppointmentsPage() {
  const { hospital, isAdmin, isDoctor } = useOutletContext<HospitalContext>();
  const [viewRange, setViewRange] = useState<ViewRange>("today");
  const [filterDoctorId, setFilterDoctorId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const { data: staff } = useHospitalStaff(hospital.id);
  const doctors = staff?.filter((s) => s.role === "doctor") || [];

  // Calculate date range based on viewRange
  const getDateRange = () => {
    const today = startOfToday();
    switch (viewRange) {
      case "today":
        return { from: format(today, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
      case "week":
        return {
          from: format(startOfWeek(today), "yyyy-MM-dd"),
          to: format(endOfWeek(today), "yyyy-MM-dd"),
        };
      case "month":
        return {
          from: format(startOfMonth(today), "yyyy-MM-dd"),
          to: format(endOfMonth(today), "yyyy-MM-dd"),
        };
      default:
        return { from: format(today, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
    }
  };

  const dateRange = getDateRange();

  // Use different hooks based on role
  const hospitalAppointments = useHospitalAppointments(hospital.id);
  const doctorAppointments = useDoctorAppointments(hospital.id);

  const { appointments, isLoading, updateAppointmentStatus } = isAdmin
    ? hospitalAppointments
    : doctorAppointments;

  // Filter appointments by date range and doctor
  const filteredAppointments = appointments.filter((appt) => {
    const inDateRange = appt.appointment_date >= dateRange.from && appt.appointment_date <= dateRange.to;
    const matchesDoctor = filterDoctorId === "all" || appt.doctor_id === filterDoctorId;
    return inDateRange && matchesDoctor;
  });

  // Group by date for display
  const groupedByDate = filteredAppointments.reduce((acc, appt) => {
    const date = appt.appointment_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    updateAppointmentStatus.mutate({ id, status });
  };

  const getStats = () => {
    const scheduled = filteredAppointments.filter((a) => a.status === "scheduled").length;
    const confirmed = filteredAppointments.filter((a) => a.status === "confirmed").length;
    const completed = filteredAppointments.filter((a) => a.status === "completed").length;
    const cancelled = filteredAppointments.filter((a) => a.status === "cancelled").length;
    return { scheduled, confirmed, completed, cancelled, total: filteredAppointments.length };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Manage all hospital appointments" : "Your scheduled appointments"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Scheduled", value: stats.scheduled, color: "bg-blue-500" },
          { label: "Confirmed", value: stats.confirmed, color: "bg-green-500" },
          { label: "Completed", value: stats.completed, color: "bg-gray-500" },
          { label: "Cancelled", value: stats.cancelled, color: "bg-red-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={viewRange} onValueChange={(v) => setViewRange(v as ViewRange)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>

        {isAdmin && doctors.length > 0 && (
          <Select value={filterDoctorId} onValueChange={setFilterDoctorId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((doc) => (
                <SelectItem key={doc.user_id} value={doc.user_id}>
                  {doc.doctor_profile?.full_name || "Unknown"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "calendar" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No appointments found for this period</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, appts]) => (
              <div key={date}>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {isToday(new Date(date)) ? "Today" : format(new Date(date), "EEEE, MMMM d, yyyy")}
                  <span className="text-muted-foreground text-sm">({appts.length})</span>
                </h3>
                <div className="space-y-3">
                  {appts
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        viewType={isAdmin ? "admin" : "doctor"}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
