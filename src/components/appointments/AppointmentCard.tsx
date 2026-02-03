import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Appointment, APPOINTMENT_STATUS_OPTIONS } from "@/types/hospital";
import { Clock, MoreVertical, User, Calendar, Stethoscope } from "lucide-react";
import { format, parse } from "date-fns";

interface AppointmentCardProps {
  appointment: Appointment;
  viewType: "doctor" | "patient" | "admin";
  onStatusChange?: (id: string, status: Appointment["status"]) => void;
  onViewDetails?: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  viewType,
  onStatusChange,
  onViewDetails,
}: AppointmentCardProps) {
  const statusOption = APPOINTMENT_STATUS_OPTIONS.find((s) => s.value === appointment.status);
  
  const formatTime = (time: string) => {
    try {
      const parsed = parse(time, "HH:mm:ss", new Date());
      return format(parsed, "h:mm a");
    } catch {
      return time.substring(0, 5);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const canChangeStatus = viewType === "doctor" || viewType === "admin";
  const showDoctor = viewType === "patient" || viewType === "admin";
  const showPatient = viewType === "doctor" || viewType === "admin";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <Avatar className="h-10 w-10">
              {showPatient && (
                <>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(appointment.patient_profile?.display_name)}
                  </AvatarFallback>
                </>
              )}
              {showDoctor && !showPatient && (
                <>
                  <AvatarImage src={appointment.doctor_profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-secondary/10 text-secondary">
                    {getInitials(appointment.doctor_profile?.full_name)}
                  </AvatarFallback>
                </>
              )}
            </Avatar>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {showPatient && (
                  <p className="font-medium truncate">
                    {appointment.patient_profile?.display_name || "Unknown Patient"}
                  </p>
                )}
                {showDoctor && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    {appointment.doctor_profile?.full_name || "Unknown Doctor"}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(appointment.appointment_date), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                </span>
              </div>

              {appointment.reason && (
                <p className="text-sm mt-2 line-clamp-1">{appointment.reason}</p>
              )}
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="secondary"
              className={`${statusOption?.color} text-white`}
            >
              {statusOption?.label}
            </Badge>

            {canChangeStatus && appointment.status !== "completed" && appointment.status !== "cancelled" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {appointment.status === "scheduled" && (
                    <DropdownMenuItem onClick={() => onStatusChange?.(appointment.id, "confirmed")}>
                      Confirm
                    </DropdownMenuItem>
                  )}
                  {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                    <>
                      <DropdownMenuItem onClick={() => onStatusChange?.(appointment.id, "completed")}>
                        Mark Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange?.(appointment.id, "no_show")}>
                        Mark No Show
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onStatusChange?.(appointment.id, "cancelled")}
                      >
                        Cancel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => onViewDetails?.(appointment)}>
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {viewType === "patient" && appointment.status !== "completed" && appointment.status !== "cancelled" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => onStatusChange?.(appointment.id, "cancelled")}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
