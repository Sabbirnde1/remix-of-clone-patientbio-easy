import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { Prescription, useTogglePrescriptionStatus } from "@/hooks/usePrescriptions";
import { EditPrescriptionDialog } from "./EditPrescriptionDialog";
import { format } from "date-fns";
import { 
  Printer, 
  Stethoscope, 
  User, 
  Calendar, 
  Pill, 
  FileText, 
  Pencil, 
  CheckCircle, 
  RotateCcw,
  Loader2 
} from "lucide-react";

interface PrescriptionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
  patientName?: string;
}

export const PrescriptionViewDialog = ({
  open,
  onOpenChange,
  prescription,
  patientName,
}: PrescriptionViewDialogProps) => {
  const { data: doctorProfile } = useDoctorProfile();
  const toggleStatus = useTogglePrescriptionStatus();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${doctorProfile?.full_name || "Doctor"}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1a1a1a;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0066cc;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .doctor-name {
              font-size: 24px;
              font-weight: bold;
              color: #0066cc;
              margin-bottom: 4px;
            }
            .doctor-details {
              font-size: 12px;
              color: #666;
            }
            .patient-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 24px;
              padding: 16px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .section {
              margin-bottom: 24px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #0066cc;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .diagnosis {
              font-size: 16px;
              font-weight: 500;
              padding: 12px;
              background: #e8f4ff;
              border-radius: 6px;
            }
            .med-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
            }
            .med-table th {
              background: #0066cc;
              color: white;
              padding: 10px;
              text-align: left;
              font-size: 12px;
            }
            .med-table td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
              font-size: 13px;
            }
            .med-table tr:nth-child(even) {
              background: #f9f9f9;
            }
            .instructions {
              padding: 16px;
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              border-radius: 0 6px 6px 0;
            }
            .footer {
              margin-top: 48px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .signature-area {
              text-align: center;
            }
            .signature-line {
              width: 200px;
              border-top: 1px solid #333;
              margin-top: 60px;
              padding-top: 8px;
              font-size: 12px;
            }
            .follow-up {
              padding: 12px 16px;
              background: #e8f5e9;
              border-radius: 6px;
              font-size: 14px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleToggleStatus = async () => {
    if (!prescription) return;
    
    await toggleStatus.mutateAsync({
      id: prescription.id,
      is_active: !prescription.is_active,
    });
    
    setShowStatusConfirm(false);
  };

  if (!prescription) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prescription Details
              </span>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowEditDialog(true)} size="sm" variant="outline">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handlePrint} size="sm" variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button 
                  onClick={() => setShowStatusConfirm(true)} 
                  size="sm"
                  variant={prescription.is_active ? "default" : "secondary"}
                >
                  {prescription.is_active ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Completed
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reactivate
                    </>
                  )}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Printable Content */}
          <div ref={printRef} className="space-y-6">
            {/* Header */}
            <div className="header text-center border-b-2 border-primary pb-4">
              <h1 className="doctor-name text-2xl font-bold text-primary">
                {doctorProfile?.full_name || "Doctor Name"}
              </h1>
              <p className="doctor-details text-sm text-muted-foreground">
                {doctorProfile?.qualification && `${doctorProfile.qualification} • `}
                {doctorProfile?.specialty && `${doctorProfile.specialty} • `}
                {doctorProfile?.license_number && `Reg. No: ${doctorProfile.license_number}`}
              </p>
              {doctorProfile?.phone && (
                <p className="doctor-details text-xs text-muted-foreground mt-1">
                  Phone: {doctorProfile.phone}
                </p>
              )}
            </div>

            {/* Patient Info & Date */}
            <div className="patient-info flex justify-between items-start p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {patientName || `ID: ${prescription.patient_id.substring(0, 8).toUpperCase()}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-right">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(prescription.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div className="section">
                <h3 className="section-title text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Diagnosis
                </h3>
                <div className="diagnosis p-3 bg-primary/5 rounded-md">
                  {prescription.diagnosis}
                </div>
              </div>
            )}

            {/* Medications */}
            <div className="section">
              <h3 className="section-title text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medications
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="med-table w-full">
                  <thead>
                    <tr className="bg-primary text-primary-foreground text-left text-xs">
                      <th className="p-3">#</th>
                      <th className="p-3">Medication</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.medications.map((med, index) => (
                      <tr key={index} className="border-t text-sm">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">
                          {med.name}
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {med.instructions}
                            </p>
                          )}
                        </td>
                        <td className="p-3">{med.dosage}</td>
                        <td className="p-3">{med.frequency}</td>
                        <td className="p-3">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            {prescription.instructions && (
              <div className="section">
                <h3 className="section-title text-sm font-semibold text-primary mb-2">
                  Instructions
                </h3>
                <div className="instructions p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
                  {prescription.instructions}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {prescription.follow_up_date && (
              <div className="follow-up flex items-center gap-2 p-3 bg-green-50 rounded-md">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>Follow-up:</strong>{" "}
                  {format(new Date(prescription.follow_up_date), "MMMM d, yyyy")}
                </span>
              </div>
            )}

            <Separator />

            {/* Footer */}
            <div className="footer flex justify-between items-end pt-6">
              <div>
                <Badge variant={prescription.is_active ? "default" : "secondary"}>
                  {prescription.is_active ? "Active" : "Completed"}
                </Badge>
              </div>
              <div className="signature-area text-center">
                <div className="signature-line w-48 border-t border-foreground mt-16 pt-2 text-xs text-muted-foreground">
                  Doctor's Signature
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditPrescriptionDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          prescription={prescription}
          patientName={patientName}
        />
      )}

      {/* Status Toggle Confirmation */}
      <AlertDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {prescription.is_active ? "Mark as Completed?" : "Reactivate Prescription?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {prescription.is_active
                ? "This will mark the prescription as completed. The patient will still be able to view it."
                : "This will reactivate the prescription, marking it as an active treatment."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleStatus}
              disabled={toggleStatus.isPending}
            >
              {toggleStatus.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {prescription.is_active ? "Mark Completed" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
