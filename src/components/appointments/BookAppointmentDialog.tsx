import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { useAppointments } from "@/hooks/useAppointments";
import { useAvailableDoctors } from "@/hooks/useTimeSlots";
import { useHospitals } from "@/hooks/useHospitals";
import { TimeSlot } from "@/types/hospital";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { Stethoscope, Building2, CalendarDays, Clock } from "lucide-react";

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedHospitalId?: string;
  preselectedDoctorId?: string;
}

export function BookAppointmentDialog({
  open,
  onOpenChange,
  preselectedHospitalId,
  preselectedDoctorId,
}: BookAppointmentDialogProps) {
  const [hospitalId, setHospitalId] = useState<string | undefined>(preselectedHospitalId);
  const [doctorId, setDoctorId] = useState<string | undefined>(preselectedDoctorId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");

  const { data: hospitals } = useHospitals();
  const { data: doctors } = useAvailableDoctors(hospitalId);
  const { createAppointment } = useAppointments();

  const handleBook = async () => {
    if (!doctorId || !selectedDate || !selectedSlot) return;

    await createAppointment.mutateAsync({
      doctor_id: doctorId,
      hospital_id: hospitalId,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      reason: reason || undefined,
    });

    // Reset form
    setSelectedSlot(null);
    setReason("");
    onOpenChange(false);
  };

  const isFormValid = doctorId && selectedDate && selectedSlot;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Book Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hospital Selection */}
          {!preselectedHospitalId && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Select Hospital (Optional)
              </Label>
              <Select value={hospitalId} onValueChange={setHospitalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Any hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any hospital</SelectItem>
                  {hospitals?.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Select Doctor
            </Label>
            <Select
              value={doctorId}
              onValueChange={(v) => {
                setDoctorId(v);
                setSelectedSlot(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors?.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex items-center gap-2">
                      <span>{doctor.full_name}</span>
                      {doctor.specialty && (
                        <span className="text-muted-foreground text-xs">
                          ({doctor.specialty})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {doctors?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No doctors with availability found
              </p>
            )}
          </div>

          {/* Date and Time Selection */}
          {doctorId && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Select Date
                </Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  disabled={(date) => isBefore(date, startOfToday())}
                  className="rounded-md border"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available Times for {format(selectedDate, "MMM d")}
                  </Label>
                  <div className="border rounded-md p-4 min-h-[200px]">
                    <TimeSlotPicker
                      doctorId={doctorId}
                      hospitalId={hospitalId}
                      date={selectedDate}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          {selectedSlot && (
            <div className="space-y-2">
              <Label>Reason for Visit (Optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for your appointment..."
                rows={3}
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBook}
              disabled={!isFormValid || createAppointment.isPending}
            >
              {createAppointment.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
