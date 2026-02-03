import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
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
  Filter,
  X,
} from "lucide-react";
import { CreatePrescriptionDialog } from "@/components/doctor/CreatePrescriptionDialog";
import { DoctorPatientDetailsDialog } from "@/components/doctor/DoctorPatientDetailsDialog";
import { format, subDays, isAfter } from "date-fns";

type StatusFilter = "all" | "active" | "inactive";
type DateFilter = "all" | "7days" | "30days" | "90days";

const DoctorPatientsPage = () => {
  const { user } = useAuth();
  const { data: patients, isLoading } = useDoctorPatients(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const filteredPatients = useMemo(() => {
    if (!patients) return [];

    return patients.filter((patient: any) => {
      // Text search
      const matchesSearch = patient.display_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && patient.is_active) ||
        (statusFilter === "inactive" && !patient.is_active);

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all" && patient.granted_at) {
        const grantedDate = new Date(patient.granted_at);
        const daysAgo = dateFilter === "7days" ? 7 : dateFilter === "30days" ? 30 : 90;
        const cutoffDate = subDays(new Date(), daysAgo);
        matchesDate = isAfter(grantedDate, cutoffDate);
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [patients, searchTerm, statusFilter, dateFilter]);

  const activeFiltersCount = 
    (statusFilter !== "all" ? 1 : 0) + 
    (dateFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-sm text-muted-foreground">
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

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Clear filters button - desktop */}
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="hidden sm:flex self-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Filter Chips - collapsible on mobile */}
        <div className={cn(
          "space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-2",
          !filtersOpen && "hidden sm:flex"
        )}>
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 mr-1">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
            </div>
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="h-8 text-xs px-3"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
              className="h-8 text-xs px-3"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
              className="h-8 text-xs px-3"
            >
              Inactive
            </Button>
          </div>

          {/* Divider - hidden on mobile */}
          <div className="hidden sm:block w-px h-6 bg-border mx-1" />

          {/* Date filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 mr-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Connected:</span>
            </div>
            <Button
              variant={dateFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("all")}
              className="h-8 text-xs px-3"
            >
              All Time
            </Button>
            <Button
              variant={dateFilter === "7days" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("7days")}
              className="h-8 text-xs px-3"
            >
              7 Days
            </Button>
            <Button
              variant={dateFilter === "30days" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("30days")}
              className="h-8 text-xs px-3"
            >
              30 Days
            </Button>
            <Button
              variant={dateFilter === "90days" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("90days")}
              className="h-8 text-xs px-3"
            >
              90 Days
            </Button>
          </div>

          {/* Mobile clear filters */}
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="sm:hidden w-full mt-2 text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all filters
            </Button>
          )}
        </div>

        {/* Results count */}
        {patients && patients.length > 0 && (
          <p className="text-xs text-muted-foreground pt-1">
            Showing {filteredPatients.length} of {patients.length} patient{patients.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : patients?.length === 0 ? (
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
      ) : filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No matching patients</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient: any) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {patient.display_name?.[0]?.toUpperCase() || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base truncate leading-tight">
                      {patient.display_name || "Unknown Patient"}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      ID: {patient.patient_id?.substring(0, 8).toUpperCase()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{patient.gender || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {patient.date_of_birth
                        ? new Date().getFullYear() -
                          new Date(patient.date_of_birth).getFullYear() +
                          " yrs"
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={patient.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {patient.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {patient.granted_at && (
                    <span className="text-[11px] text-muted-foreground">
                      Connected {format(new Date(patient.granted_at), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t flex flex-col xs:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1.5" />
                    View Records
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setPrescriptionDialogOpen(true);
                    }}
                  >
                    <Pill className="h-4 w-4 mr-1.5" />
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
