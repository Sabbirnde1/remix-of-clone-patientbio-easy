import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { usePatientHealthData, useUpdatePatientAccess } from "@/hooks/useDoctorPatients";
import { format } from "date-fns";
import {
  Loader2,
  User,
  Phone,
  Calendar,
  Droplets,
  AlertTriangle,
  Pill,
  Heart,
  FileText,
  AlertCircle,
} from "lucide-react";

interface DoctorPatientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: {
    patient_id: string;
    display_name: string | null;
    gender: string | null;
    date_of_birth: string | null;
  } | null;
}

export const DoctorPatientDetailsDialog = ({
  open,
  onOpenChange,
  patient,
}: DoctorPatientDetailsDialogProps) => {
  const { data, isLoading, error } = usePatientHealthData(open ? patient?.patient_id || null : null);
  const updateAccess = useUpdatePatientAccess();

  // Update last accessed when opening
  useEffect(() => {
    if (open && patient?.patient_id) {
      updateAccess.mutate(patient.patient_id);
    }
  }, [open, patient?.patient_id]);

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = patient?.date_of_birth ? calculateAge(patient.date_of_birth) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {patient?.display_name?.[0]?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
            <div>
              <span>{patient?.display_name || "Unknown Patient"}</span>
              <DialogDescription className="text-left">
                {patient?.gender && <span>{patient.gender}</span>}
                {age && <span> • {age} years old</span>}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-3" />
              <p>Failed to load patient data</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-medium">{data?.profile?.display_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium">{data?.profile?.gender || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {data?.profile?.date_of_birth
                          ? format(new Date(data.profile.date_of_birth), "MMM d, yyyy")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </p>
                      <p className="font-medium">{data?.profile?.phone || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Data Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Health Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        Blood Group
                      </p>
                      <p className="font-medium">
                        {data?.healthData?.blood_group ? (
                          <Badge variant="outline">{data.healthData.blood_group}</Badge>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Height</p>
                      <p className="font-medium">{data?.healthData?.height || "—"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3 w-3" />
                        Allergies
                      </p>
                      <p className="text-sm">
                        {data?.healthData?.health_allergies || "None reported"}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground flex items-center gap-1 mb-1">
                        <Pill className="h-3 w-3" />
                        Current Medications
                      </p>
                      <p className="text-sm">
                        {data?.healthData?.current_medications || "None reported"}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Chronic Diseases</p>
                      <p className="text-sm">
                        {data?.healthData?.chronic_diseases || "None reported"}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Previous Diseases</p>
                      <p className="text-sm">
                        {data?.healthData?.previous_diseases || "None reported"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Emergency Contact</p>
                      <p className="font-medium">
                        {data?.healthData?.emergency_contact_name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Emergency Phone</p>
                      <p className="font-medium">
                        {data?.healthData?.emergency_contact_phone || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Records Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Health Records ({data?.records?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.records?.length > 0 ? (
                    <div className="space-y-2">
                      {data.records.map((record: any) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{record.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {record.category} • {record.disease_category}
                                {record.record_date &&
                                  ` • ${format(new Date(record.record_date), "MMM d, yyyy")}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {record.file_type || "File"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No health records uploaded
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
