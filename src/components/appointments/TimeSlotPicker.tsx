import { Button } from "@/components/ui/button";
import { TimeSlot } from "@/types/hospital";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { format, parse } from "date-fns";
import { Clock, Loader2 } from "lucide-react";

interface TimeSlotPickerProps {
  doctorId: string;
  hospitalId?: string;
  date: Date;
  selectedSlot?: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({
  doctorId,
  hospitalId,
  date,
  selectedSlot,
  onSelectSlot,
}: TimeSlotPickerProps) {
  const { data: slots, isLoading, error } = useTimeSlots({ doctorId, hospitalId, date });

  const formatTime = (time: string) => {
    try {
      const parsed = parse(time, "HH:mm:ss", new Date());
      return format(parsed, "h:mm a");
    } catch {
      return time.substring(0, 5);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load available slots
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No availability on this date</p>
        <p className="text-sm">Please select another date</p>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.is_available);
  const unavailableSlots = slots.filter((s) => !s.is_available);

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>All slots are booked</p>
        <p className="text-sm">Please select another date</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {availableSlots.length} slot{availableSlots.length !== 1 ? "s" : ""} available
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.start_time === slot.start_time;
          return (
            <Button
              key={slot.start_time}
              variant={isSelected ? "default" : slot.is_available ? "outline" : "ghost"}
              size="sm"
              disabled={!slot.is_available}
              onClick={() => onSelectSlot(slot)}
              className={`${
                !slot.is_available
                  ? "opacity-40 cursor-not-allowed line-through"
                  : isSelected
                  ? ""
                  : "hover:bg-primary/10"
              }`}
            >
              {formatTime(slot.start_time)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
