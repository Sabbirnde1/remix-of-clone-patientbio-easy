import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDoctorPatients, useUpdatePatientAccess } from "@/hooks/useDoctorPatients";
import { Hospital } from "@/types/hospital";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  Eye,
  Pill,
  UserPlus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PatientDetailsDialog from "@/components/hospital/PatientDetailsDialog";
import AddPatientDialog from "@/components/hospital/AddPatientDialog";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/admin/DataTablePagination";

interface OutletContext {
  hospital: Hospital;
  isAdmin: boolean;
  isDoctor: boolean;
}

export default function DoctorPatientsPage() {
  const { hospital } = useOutletContext<OutletContext>();
  const { data: patients, isLoading } = useDoctorPatients();
  const updateAccess = useUpdatePatientAccess();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredPatients = patients?.filter((patient) => {
    const name = patient.patient_profile?.display_name?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedPatients,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination({ data: filteredPatients, itemsPerPage: 9 });

  const handleViewPatient = (patientId: string) => {
    updateAccess.mutate(patientId);
    setSelectedPatientId(patientId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            My Patients
          </h1>
          <p className="text-muted-foreground mt-1">
            Patients who have shared their health data with you
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedPatients.map((patient) => {
            const profile = patient.patient_profile;
            const age = profile?.date_of_birth
              ? Math.floor(
                  (Date.now() - new Date(profile.date_of_birth).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )
              : null;

            return (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {profile?.display_name || "Unknown Patient"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {age && <span>{age} years</span>}
                        {profile?.gender && <span>• {profile.gender}</span>}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Shared {formatDistanceToNow(new Date(patient.granted_at), { addSuffix: true })}
                      </span>
                    </div>
                    {patient.last_accessed_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Viewed {formatDistanceToNow(new Date(patient.last_accessed_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleViewPatient(patient.patient_id)}
                    >
                      <Eye className="h-3 w-3" />
                      View Records
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 gap-1"
                      onClick={() => handleViewPatient(patient.patient_id)}
                    >
                      <Pill className="h-3 w-3" />
                      Prescribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Patients Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              Add patients using their Patient ID code. Patients can find their ID in their Patient Portal.
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Your First Patient
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Patient Details Dialog */}
      <PatientDetailsDialog
        patientId={selectedPatientId}
        hospitalId={hospital.id}
        onClose={() => setSelectedPatientId(null)}
      />

      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={(patientId) => setSelectedPatientId(patientId)}
      />
    </div>
  );
}
