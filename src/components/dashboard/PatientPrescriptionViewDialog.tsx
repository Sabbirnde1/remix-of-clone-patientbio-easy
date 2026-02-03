import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Prescription } from "@/hooks/usePrescriptions";
import { format } from "date-fns";
import {
  Printer,
  Stethoscope,
  User,
  Calendar,
  Pill,
  FileText,
  Phone,
  Award,
} from "lucide-react";

interface PatientPrescriptionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
}

export const PatientPrescriptionViewDialog = ({
  open,
  onOpenChange,
  prescription,
}: PatientPrescriptionViewDialogProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${prescription?.doctor_name || "Doctor"}</title>
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

  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prescription Details
            </span>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Content */}
        <div ref={printRef} className="space-y-6">
          {/* Doctor Header */}
          <div className="header text-center border-b-2 border-primary pb-4">
            <h1 className="doctor-name text-2xl font-bold text-primary">
              Dr. {prescription.doctor_name || "Unknown Doctor"}
            </h1>
            <div className="doctor-details flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
              {prescription.doctor_qualification && (
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {prescription.doctor_qualification}
                </span>
              )}
              {prescription.doctor_specialty && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    {prescription.doctor_specialty}
                  </span>
                </>
              )}
              {prescription.doctor_phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {prescription.doctor_phone}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Date & Status */}
          <div className="patient-info flex justify-between items-start p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date Issued</p>
                <p className="font-medium">
                  {format(new Date(prescription.created_at), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
            <Badge variant={prescription.is_active ? "default" : "secondary"}>
              {prescription.is_active ? "Active" : "Completed"}
            </Badge>
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
              Medications ({prescription.medications.length})
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
              <div className="instructions p-4 bg-accent border-l-4 border-accent-foreground/30 rounded-r-md">
                {prescription.instructions}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {prescription.follow_up_date && (
            <div className="follow-up flex items-center gap-2 p-3 bg-primary/10 rounded-md">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">
                <strong>Follow-up:</strong>{" "}
                {format(new Date(prescription.follow_up_date), "MMMM d, yyyy")}
              </span>
            </div>
          )}

          <Separator />

          {/* Footer */}
          <div className="footer flex justify-between items-end pt-6">
            <div className="text-xs text-muted-foreground">
              Prescription ID: {prescription.id.substring(0, 8).toUpperCase()}
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
  );
};
