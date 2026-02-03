import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Admission } from "@/hooks/useAdmissions";
import { Hospital } from "@/types/hospital";
import { Printer, Download } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface DischargeSummaryDialogProps {
  admission: Admission;
  hospital: Hospital;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DischargeSummaryDialog = ({
  admission,
  hospital,
  open,
  onOpenChange,
}: DischargeSummaryDialogProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Discharge Summary - ${admission.patient_profile?.display_name || "Patient"}</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              margin: 0; 
              padding: 20px;
              color: #1a1a1a;
            }
            .container { max-width: 210mm; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
            .hospital-name { font-size: 24px; font-weight: bold; }
            .hospital-details { font-size: 12px; color: #666; }
            .title { font-size: 20px; font-weight: bold; text-align: right; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 14px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .field { margin-bottom: 8px; }
            .field-label { font-size: 12px; color: #666; }
            .field-value { font-size: 14px; font-weight: 500; }
            .notes-box { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 14px; white-space: pre-wrap; }
            .footer { border-top: 1px solid #ddd; padding-top: 16px; margin-top: 24px; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 48px; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #1a1a1a; margin-top: 48px; padding-top: 8px; font-size: 12px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const stayDuration = admission.actual_discharge
    ? differenceInDays(new Date(admission.actual_discharge), new Date(admission.admission_date))
    : differenceInDays(new Date(), new Date(admission.admission_date));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Discharge Summary</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Content */}
        <div ref={printRef} className="space-y-6 py-4">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-foreground pb-4">
            <div>
              <h1 className="text-xl font-bold">{hospital.name}</h1>
              {hospital.address && (
                <p className="text-sm text-muted-foreground">{hospital.address}</p>
              )}
              {hospital.city && hospital.state && (
                <p className="text-sm text-muted-foreground">
                  {hospital.city}, {hospital.state}
                </p>
              )}
              {hospital.phone && (
                <p className="text-sm text-muted-foreground">Phone: {hospital.phone}</p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold">DISCHARGE SUMMARY</h2>
              <p className="text-sm text-muted-foreground">
                {admission.actual_discharge
                  ? format(new Date(admission.actual_discharge), "MMMM d, yyyy")
                  : "Pending Discharge"}
              </p>
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 border-b pb-1">
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Patient Name</p>
                <p className="font-medium">
                  {admission.patient_profile?.display_name || "Unknown Patient"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Patient ID</p>
                <p className="font-medium font-mono">
                  {admission.patient_id.substring(0, 8).toUpperCase()}
                </p>
              </div>
              {admission.patient_profile?.date_of_birth && (
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {format(new Date(admission.patient_profile.date_of_birth), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
              {admission.patient_profile?.gender && (
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{admission.patient_profile.gender}</p>
                </div>
              )}
              {admission.patient_profile?.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{admission.patient_profile.phone}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Admission Details */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 border-b pb-1">
              Admission Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Admission Date</p>
                <p className="font-medium">
                  {format(new Date(admission.admission_date), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Discharge Date</p>
                <p className="font-medium">
                  {admission.actual_discharge
                    ? format(new Date(admission.actual_discharge), "MMMM d, yyyy 'at' h:mm a")
                    : "Pending"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Length of Stay</p>
                <p className="font-medium">
                  {stayDuration === 0 ? "Same day" : `${stayDuration} day${stayDuration !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ward / Bed</p>
                <p className="font-medium">
                  {admission.bed?.ward?.name || "N/A"} - Bed {admission.bed?.bed_number || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Attending Physician</p>
                <p className="font-medium">
                  Dr. {admission.doctor_profile?.full_name || "Unknown"}
                  {admission.doctor_profile?.specialty && ` (${admission.doctor_profile.specialty})`}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Clinical Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 border-b pb-1">
              Clinical Information
            </h3>
            <div className="space-y-4">
              {admission.admission_reason && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reason for Admission</p>
                  <p className="bg-muted/50 p-3 rounded text-sm">{admission.admission_reason}</p>
                </div>
              )}
              {admission.diagnosis && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Diagnosis</p>
                  <p className="bg-muted/50 p-3 rounded text-sm">{admission.diagnosis}</p>
                </div>
              )}
              {admission.discharge_notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Discharge Notes / Instructions</p>
                  <p className="bg-muted/50 p-3 rounded text-sm whitespace-pre-wrap">
                    {admission.discharge_notes}
                  </p>
                </div>
              )}
              {!admission.admission_reason && !admission.diagnosis && !admission.discharge_notes && (
                <p className="text-sm text-muted-foreground italic">
                  No clinical notes recorded for this admission.
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Signatures */}
          <div className="pt-8">
            <div className="flex justify-between">
              <div className="text-center w-48">
                <div className="border-t border-foreground pt-2 mt-12">
                  <p className="text-xs text-muted-foreground">Patient/Guardian Signature</p>
                </div>
              </div>
              <div className="text-center w-48">
                <div className="border-t border-foreground pt-2 mt-12">
                  <p className="text-xs text-muted-foreground">Physician Signature</p>
                  <p className="text-xs mt-1">
                    Dr. {admission.doctor_profile?.full_name || "_______________"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-center text-xs text-muted-foreground mt-8">
            <p>This is a computer-generated discharge summary from {hospital.name}</p>
            <p className="mt-1">
              Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DischargeSummaryDialog;
