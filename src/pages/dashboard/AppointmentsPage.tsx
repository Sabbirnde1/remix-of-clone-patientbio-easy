import { useState } from "react";
import { useMyAppointments } from "@/hooks/useAppointments";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { BookAppointmentDialog } from "@/components/appointments/BookAppointmentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Plus } from "lucide-react";
import { format, isPast, isToday, isFuture, parseISO } from "date-fns";
import { Appointment } from "@/types/hospital";

export default function AppointmentsPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { appointments, isLoading, cancelAppointment } = useMyAppointments();

  // Categorize appointments
  const upcomingAppointments = appointments.filter((a) => {
    const date = parseISO(a.appointment_date);
    return (isFuture(date) || isToday(date)) && a.status !== "cancelled" && a.status !== "completed";
  });

  const pastAppointments = appointments.filter((a) => {
    const date = parseISO(a.appointment_date);
    return isPast(date) && !isToday(date) || a.status === "completed" || a.status === "cancelled";
  });

  const handleCancelAppointment = (id: string) => {
    cancelAppointment.mutate(id);
  };

  // Group by date
  const groupByDate = (appts: Appointment[]) => {
    return appts.reduce((acc, appt) => {
      const date = appt.appointment_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(appt);
      return acc;
    }, {} as Record<string, Appointment[]>);
  };

  const renderAppointmentList = (appts: Appointment[], emptyMessage: string) => {
    if (appts.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      );
    }

    const grouped = groupByDate(appts);

    return (
      <div className="space-y-6">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, dayAppts]) => (
            <div key={date}>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {isToday(parseISO(date)) ? "Today" : format(parseISO(date), "EEEE, MMMM d, yyyy")}
              </h3>
              <div className="space-y-3">
                {dayAppts
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      viewType="patient"
                      onStatusChange={(id) => handleCancelAppointment(id)}
                    />
                  ))}
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your scheduled appointments
          </p>
        </div>
        <Button onClick={() => setIsBookingOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6">
            {renderAppointmentList(
              upcomingAppointments,
              "No upcoming appointments. Book one now!"
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            {renderAppointmentList(
              pastAppointments,
              "No past appointments yet."
            )}
          </TabsContent>
        </Tabs>
      )}

      <BookAppointmentDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
      />
    </div>
  );
}
