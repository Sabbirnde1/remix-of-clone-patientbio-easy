import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUpdatePrescription, Prescription } from "@/hooks/usePrescriptions";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2, CalendarIcon, Pencil } from "lucide-react";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
});

const formSchema = z.object({
  diagnosis: z.string().optional(),
  medications: z.array(medicationSchema).min(1, "At least one medication is required"),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  follow_up_date: z.date().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface EditPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
  patientName?: string;
}

export const EditPrescriptionDialog = ({
  open,
  onOpenChange,
  prescription,
  patientName,
}: EditPrescriptionDialogProps) => {
  const updatePrescription = useUpdatePrescription();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diagnosis: prescription.diagnosis || "",
      medications: prescription.medications.length > 0 
        ? prescription.medications 
        : [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
      instructions: prescription.instructions || "",
      notes: prescription.notes || "",
      follow_up_date: prescription.follow_up_date 
        ? parseISO(prescription.follow_up_date) 
        : null,
    },
  });

  // Reset form when prescription changes
  useEffect(() => {
    if (open && prescription) {
      form.reset({
        diagnosis: prescription.diagnosis || "",
        medications: prescription.medications.length > 0 
          ? prescription.medications 
          : [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
        instructions: prescription.instructions || "",
        notes: prescription.notes || "",
        follow_up_date: prescription.follow_up_date 
          ? parseISO(prescription.follow_up_date) 
          : null,
      });
    }
  }, [open, prescription, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const onSubmit = async (data: FormData) => {
    const medications = data.medications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
    }));

    await updatePrescription.mutateAsync({
      id: prescription.id,
      diagnosis: data.diagnosis,
      medications,
      instructions: data.instructions,
      notes: data.notes,
      follow_up_date: data.follow_up_date
        ? format(data.follow_up_date, "yyyy-MM-dd")
        : undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Prescription
          </DialogTitle>
          <DialogDescription>
            Patient: <strong>{patientName || "Unknown Patient"}</strong>
            <br />
            <span className="text-xs">
              Created: {format(new Date(prescription.created_at), "MMM d, yyyy")}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Diagnosis */}
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Upper respiratory infection" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Medications</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ name: "", dosage: "", frequency: "", duration: "", instructions: "" })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 space-y-3 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medication {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`medications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Medication name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Frequency</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Twice daily" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 7 days" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`medications.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Special Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Take after meals" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              {form.formState.errors.medications?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.medications.message}
                </p>
              )}
            </div>

            {/* General Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="General advice for the patient..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinical Notes (Private)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes for your reference..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Follow-up Date */}
            <FormField
              control={form.control}
              name="follow_up_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Follow-up Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePrescription.isPending}>
                {updatePrescription.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
