import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctorPatients, useGrantPatientAccess, useLookupPatientByCode } from "@/hooks/useDoctorPatients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Search,
  Loader2,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Pill,
} from "lucide-react";
import { CreatePrescriptionDialog } from "@/components/doctor/CreatePrescriptionDialog";
import { DoctorPatientDetailsDialog } from "@/components/doctor/DoctorPatientDetailsDialog";

const DoctorPatientsPage = () => {
  const { user } = useAuth();
  const { data: patients, isLoading } = useDoctorPatients(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [patientCode, setPatientCode] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  // Dialog states for patient details and prescriptions
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);

  const lookupPatient = useLookupPatientByCode();
  const grantAccess = useGrantPatientAccess();

  const filteredPatients = patients?.filter((patient: any) =>
    patient.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLookup = async () => {
    if (patientCode.length < 8) {
      toast.error("Please enter a valid 8-character Patient ID");
      return;
    }

    setIsLookingUp(true);
    try {
      const result = await lookupPatient.mutateAsync(patientCode);
      setLookupResult(result);
    } catch (error) {
      setLookupResult(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAddPatient = async () => {
    if (!lookupResult?.patient_id || !user?.id) return;

    try {
      await grantAccess.mutateAsync({
        doctorId: user.id,
        patientId: lookupResult.patient_id,
      });
      setAddDialogOpen(false);
      setPatientCode("");
      setLookupResult(null);
      toast.success("Patient added successfully!");
    } catch (error) {
      // Error handled in hook
    }
  };

  const resetDialog = () => {
    setPatientCode("");
    setLookupResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground">
            Patients who have shared access with you
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetDialog();
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Patient by ID</DialogTitle>
              <DialogDescription>
                Enter the patient's 8-character ID to add them to your patient list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-code">Patient ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="patient-code"
                    placeholder="e.g., ABCD1234"
                    value={patientCode}
                    onChange={(e) => {
                      setPatientCode(e.target.value.toUpperCase());
                      setLookupResult(null);
                    }}
                    maxLength={8}
                    className="uppercase"
                  />
                  <Button
                    onClick={handleLookup}
                    disabled={patientCode.length < 8 || isLookingUp}
                  >
                    {isLookingUp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {lookupResult && (
                <div className="rounded-lg border p-4">
                  {lookupResult.found ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-700">Patient Found</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {lookupResult.display_name?.[0]?.toUpperCase() || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{lookupResult.display_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">
                            {lookupResult.gender && `${lookupResult.gender}`}
                            {lookupResult.age && `, ${lookupResult.age} years old`}
                          </p>
                        </div>
                      </div>
                      {lookupResult.already_connected ? (
                        <Badge variant="secondary">Already in your patient list</Badge>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={handleAddPatient}
                          disabled={grantAccess.isPending}
                        >
                          {grantAccess.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <UserPlus className="h-4 w-4 mr-2" />
                          )}
                          Add to My Patients
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-amber-600">
                      <AlertCircle className="h-5 w-5" />
                      <span>No patient found with this ID</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPatients?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No patients yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add patients by entering their Patient ID or share your QR code
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients?.map((patient: any) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {patient.display_name?.[0]?.toUpperCase() || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {patient.display_name || "Unknown Patient"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      ID: {patient.patient_id?.substring(0, 8).toUpperCase()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{patient.gender || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {patient.date_of_birth
                        ? new Date().getFullYear() -
                          new Date(patient.date_of_birth).getFullYear() +
                          " yrs"
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge
                    variant={patient.is_active ? "default" : "secondary"}
                  >
                    {patient.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Records
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setPrescriptionDialogOpen(true);
                    }}
                  >
                    <Pill className="h-4 w-4 mr-1" />
                    Prescribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Details Dialog */}
      <DoctorPatientDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        patient={selectedPatient}
      />

      {/* Create Prescription Dialog */}
      {selectedPatient && (
        <CreatePrescriptionDialog
          open={prescriptionDialogOpen}
          onOpenChange={setPrescriptionDialogOpen}
          patient={{
            patient_id: selectedPatient.patient_id,
            display_name: selectedPatient.display_name,
          }}
        />
      )}
    </div>
  );
};

export default DoctorPatientsPage;
