import { useState } from "react";
import { usePatientHealthData } from "@/hooks/useDoctorPatients";
import { useDoctorPrescriptions, useCreatePrescription, Medication } from "@/hooks/usePrescriptions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Heart,
  FileText,
  Pill,
  AlertTriangle,
  Droplet,
  Phone,
  Calendar,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import PrescriptionForm from "./PrescriptionForm";

interface PatientDetailsDialogProps {
  patientId: string | null;
  hospitalId: string;
  onClose: () => void;
}

export default function PatientDetailsDialog({
  patientId,
  hospitalId,
  onClose,
}: PatientDetailsDialogProps) {
  const { data: patientData, isLoading } = usePatientHealthData(patientId);
  const { data: prescriptions } = useDoctorPrescriptions(patientId || undefined);
  const createPrescription = useCreatePrescription();
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  const handleCreatePrescription = (data: {
    diagnosis: string;
    medications: Medication[];
    instructions: string;
    notes: string;
    follow_up_date: string;
  }) => {
    if (!patientId) return;

    createPrescription.mutate(
      {
        patient_id: patientId,
        hospital_id: hospitalId,
        ...data,
      },
      {
        onSuccess: () => {
          setShowPrescriptionForm(false);
        },
      }
    );
  };

  const profile = patientData?.profile;
  const healthData = patientData?.healthData;
  const records = patientData?.records || [];

  const age = profile?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(profile.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <Dialog open={!!patientId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {profile?.display_name || "Patient Details"}
          </DialogTitle>
          <DialogDescription>
            {age && `${age} years old`}
            {profile?.gender && ` • ${profile.gender}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="new-prescription">New Rx</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="space-y-4 m-0">
                {/* Health Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Health Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <InfoBlock
                        icon={<Droplet className="h-4 w-4" />}
                        label="Blood Group"
                        value={healthData?.blood_group}
                        highlight
                      />
                      <InfoBlock
                        icon={<User className="h-4 w-4" />}
                        label="Height"
                        value={healthData?.height}
                      />
                      {profile?.phone && (
                        <InfoBlock
                          icon={<Phone className="h-4 w-4" />}
                          label="Phone"
                          value={profile.phone}
                        />
                      )}
                    </div>

                    {healthData?.health_allergies && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-2 mb-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            Allergies
                          </h4>
                          <p className="text-sm bg-destructive/10 text-destructive rounded-lg p-3">
                            {healthData.health_allergies}
                          </p>
                        </div>
                      </>
                    )}

                    {healthData?.current_medications && (
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Pill className="h-4 w-4 text-primary" />
                          Current Medications
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                          {healthData.current_medications}
                        </p>
                      </div>
                    )}

                    {healthData?.chronic_diseases && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Chronic Conditions</h4>
                        <p className="text-sm text-muted-foreground">
                          {healthData.chronic_diseases}
                        </p>
                      </div>
                    )}

                    {healthData?.previous_diseases && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Medical History</h4>
                        <p className="text-sm text-muted-foreground">
                          {healthData.previous_diseases}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                {(healthData?.emergency_contact_name || healthData?.emergency_contact_phone) && (
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-destructive">
                        <Phone className="h-4 w-4" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{healthData.emergency_contact_name}</p>
                      {healthData.emergency_contact_phone && (
                        <p className="text-sm text-muted-foreground">
                          {healthData.emergency_contact_phone}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="records" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Health Records
                    </CardTitle>
                    <CardDescription>
                      Documents shared by the patient
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {records.length > 0 ? (
                      <div className="space-y-3">
                        {records.map((record: {
                          id: string;
                          title: string;
                          category?: string;
                          record_date?: string;
                          provider_name?: string;
                        }) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{record.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {record.provider_name && `${record.provider_name} • `}
                                  {record.record_date
                                    ? format(new Date(record.record_date), "MMM d, yyyy")
                                    : "No date"}
                                </p>
                              </div>
                            </div>
                            {record.category && (
                              <Badge variant="secondary" className="capitalize text-xs">
                                {record.category.replace("_", " ")}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No records available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescriptions" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      Prescriptions Issued
                    </CardTitle>
                    <CardDescription>
                      Prescriptions you've written for this patient
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {prescriptions && prescriptions.length > 0 ? (
                      <div className="space-y-3">
                        {prescriptions.map((rx) => (
                          <div
                            key={rx.id}
                            className="p-4 rounded-lg border bg-card"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{rx.diagnosis || "General Prescription"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(rx.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                              <Badge variant={rx.is_active ? "default" : "secondary"}>
                                {rx.is_active ? "Active" : "Completed"}
                              </Badge>
                            </div>
                            {rx.medications.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Medications ({rx.medications.length})
                                </p>
                                <div className="space-y-1">
                                  {rx.medications.slice(0, 3).map((med, idx) => (
                                    <p key={idx} className="text-sm">
                                      {med.name} - {med.dosage}, {med.frequency}
                                    </p>
                                  ))}
                                  {rx.medications.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{rx.medications.length - 3} more
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No prescriptions issued yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="new-prescription" className="m-0">
                <PrescriptionForm
                  onSubmit={handleCreatePrescription}
                  isSubmitting={createPrescription.isPending}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

const InfoBlock = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) => (
  <div className={`p-3 rounded-lg ${highlight ? "bg-primary/10" : "bg-muted/50"}`}>
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className={`font-semibold ${highlight ? "text-primary" : ""}`}>
      {value || "Not specified"}
    </p>
  </div>
);
