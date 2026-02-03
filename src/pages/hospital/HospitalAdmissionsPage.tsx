import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Hospital } from "@/types/hospital";
import { useAdmissions, useCurrentAdmissions, useAdmissionMutations, Admission } from "@/hooks/useAdmissions";
import { useAvailableBeds } from "@/hooks/useWards";
import { useHospitalStaff } from "@/hooks/useHospitalStaff";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { InlineEmptyState } from "@/components/ui/empty-state";
import { Plus, UserPlus, Bed, Clock, LogOut, ArrowRightLeft, FileText } from "lucide-react";
import PatientLookupInput from "@/components/hospital/PatientLookupInput";
import { format, differenceInDays } from "date-fns";
import DischargeSummaryDialog from "@/components/hospital/DischargeSummaryDialog";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/admin/DataTablePagination";

interface HospitalContext {
  hospital: Hospital;
  isAdmin: boolean;
  isDoctor?: boolean;
}

export default function HospitalAdmissionsPage() {
  const { hospital, isAdmin, isDoctor } = useOutletContext<HospitalContext>();
  const { user } = useAuth();
  const { data: currentAdmissions, isLoading: currentLoading } = useCurrentAdmissions(hospital.id);
  const { data: allAdmissions, isLoading: allLoading } = useAdmissions(hospital.id);
  const { data: availableBeds } = useAvailableBeds(hospital.id);
  const { data: staff } = useHospitalStaff(hospital.id);
  const { createAdmission, dischargePatient, transferBed } = useAdmissionMutations(hospital.id);

  const [admitDialogOpen, setAdmitDialogOpen] = useState(false);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  const [newAdmission, setNewAdmission] = useState({
    patient_id: "",
    bed_id: "",
    admitting_doctor_id: "",
    admission_reason: "",
    diagnosis: "",
    expected_discharge: "",
  });

  const [dischargeNotes, setDischargeNotes] = useState("");
  const [transferBedId, setTransferBedId] = useState("");

  const doctors = staff?.filter((s) => s.role === "doctor") || [];

  const handleAdmit = async () => {
    await createAdmission.mutateAsync({
      patient_id: newAdmission.patient_id,
      bed_id: newAdmission.bed_id,
      admitting_doctor_id: newAdmission.admitting_doctor_id,
      admission_reason: newAdmission.admission_reason || undefined,
      diagnosis: newAdmission.diagnosis || undefined,
      expected_discharge: newAdmission.expected_discharge || undefined,
    });
    setAdmitDialogOpen(false);
    setNewAdmission({
      patient_id: "",
      bed_id: "",
      admitting_doctor_id: "",
      admission_reason: "",
      diagnosis: "",
      expected_discharge: "",
    });
  };

  const handleDischarge = async () => {
    if (!selectedAdmission || !user) return;
    await dischargePatient.mutateAsync({
      admissionId: selectedAdmission.id,
      dischargeNotes: dischargeNotes || undefined,
      dischargedBy: user.id,
    });
    setDischargeDialogOpen(false);
    setSelectedAdmission(null);
    setDischargeNotes("");
  };

  const handleTransfer = async () => {
    if (!selectedAdmission) return;
    await transferBed.mutateAsync({
      admissionId: selectedAdmission.id,
      newBedId: transferBedId,
    });
    setTransferDialogOpen(false);
    setSelectedAdmission(null);
    setTransferBedId("");
  };

  const openDischargeDialog = (admission: Admission) => {
    setSelectedAdmission(admission);
    setDischargeDialogOpen(true);
  };

  const openTransferDialog = (admission: Admission) => {
    setSelectedAdmission(admission);
    setTransferDialogOpen(true);
  };

  const openSummaryDialog = (admission: Admission) => {
    setSelectedAdmission(admission);
    setSummaryDialogOpen(true);
  };

  const getStayDuration = (admissionDate: string) => {
    const days = differenceInDays(new Date(), new Date(admissionDate));
    return days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
  };

  const renderAdmissionCard = (admission: Admission) => (
    <Card key={admission.id}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {admission.patient_profile?.display_name || "Unknown Patient"}
              </h3>
              <Badge variant={admission.status === "admitted" ? "default" : "secondary"}>
                {admission.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {admission.bed?.ward?.name || "No Ward"}, Bed {admission.bed?.bed_number || "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">
              Dr. {admission.doctor_profile?.full_name || "Unknown"} • {admission.doctor_profile?.specialty || "General"}
            </p>
            {admission.diagnosis && (
              <p className="text-sm">
                <span className="text-muted-foreground">Diagnosis:</span> {admission.diagnosis}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getStayDuration(admission.admission_date)}
              </span>
              {admission.expected_discharge && (
                <span>Expected: {format(new Date(admission.expected_discharge), "MMM d, yyyy")}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* View Summary button for discharged patients */}
            {admission.status === "discharged" && (
              <Button variant="outline" size="sm" onClick={() => openSummaryDialog(admission)}>
                <FileText className="h-4 w-4 mr-1" />
                Summary
              </Button>
            )}
            {/* Actions for admitted patients */}
            {admission.status === "admitted" && (isAdmin || isDoctor) && (
              <>
                <Button variant="outline" size="sm" onClick={() => openTransferDialog(admission)}>
                  <ArrowRightLeft className="h-4 w-4 mr-1" />
                  Transfer
                </Button>
                <Button variant="outline" size="sm" onClick={() => openDischargeDialog(admission)}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Discharge
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (currentLoading || allLoading) {
    return <PageSkeleton type="dashboard" />;
  }

  const dischargedToday = allAdmissions?.filter(
    (a) => a.status === "discharged" && a.actual_discharge &&
      format(new Date(a.actual_discharge), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ) || [];

  // Pagination for each tab
  const currentPagination = usePagination({ data: currentAdmissions || [], itemsPerPage: 10 });
  const dischargedTodayPagination = usePagination({ data: dischargedToday, itemsPerPage: 10 });
  const allPagination = usePagination({ data: allAdmissions || [], itemsPerPage: 10 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">In-Patient Admissions</h1>
          <p className="text-muted-foreground">Manage patient admissions and discharges</p>
        </div>
        {(isAdmin || isDoctor) && (
          <Dialog open={admitDialogOpen} onOpenChange={setAdmitDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Admit Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Admit New Patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <PatientLookupInput
                  value={newAdmission.patient_id}
                  onChange={(patient_id) => setNewAdmission({ ...newAdmission, patient_id })}
                  label="Patient"
                />
                <div className="space-y-2">
                  <Label>Assign Bed</Label>
                  <Select
                    value={newAdmission.bed_id}
                    onValueChange={(v) => setNewAdmission({ ...newAdmission, bed_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select available bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBeds?.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          {bed.ward?.name} - Bed {bed.bed_number} (₹{bed.daily_rate}/day)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Admitting Doctor</Label>
                  <Select
                    value={newAdmission.admitting_doctor_id}
                    onValueChange={(v) => setNewAdmission({ ...newAdmission, admitting_doctor_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.user_id}>
                          {doc.doctor_profile?.full_name || "Unknown"} - {doc.doctor_profile?.specialty || "General"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Admission Reason</Label>
                  <Textarea
                    value={newAdmission.admission_reason}
                    onChange={(e) => setNewAdmission({ ...newAdmission, admission_reason: e.target.value })}
                    placeholder="Reason for admission"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Initial Diagnosis</Label>
                  <Input
                    value={newAdmission.diagnosis}
                    onChange={(e) => setNewAdmission({ ...newAdmission, diagnosis: e.target.value })}
                    placeholder="Diagnosis"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Discharge Date</Label>
                  <Input
                    type="date"
                    value={newAdmission.expected_discharge}
                    onChange={(e) => setNewAdmission({ ...newAdmission, expected_discharge: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAdmitDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdmit}
                  disabled={!newAdmission.patient_id || !newAdmission.bed_id || !newAdmission.admitting_doctor_id}
                >
                  Admit Patient
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Admissions</p>
                <p className="text-3xl font-bold">{currentAdmissions?.length || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bed className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Beds</p>
                <p className="text-3xl font-bold text-green-600">{availableBeds?.length || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Bed className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Discharged Today</p>
                <p className="text-3xl font-bold text-blue-600">{dischargedToday.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <LogOut className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admissions Tabs */}
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current ({currentAdmissions?.length || 0})</TabsTrigger>
          <TabsTrigger value="discharged-today">Discharged Today ({dischargedToday.length})</TabsTrigger>
          <TabsTrigger value="all">All Admissions</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4 mt-4">
          {currentAdmissions?.length === 0 ? (
            <InlineEmptyState
              icon={Bed}
              title="No current admissions"
              description="All beds are currently available. Admit a patient to get started."
              action={(isAdmin || isDoctor) ? {
                label: "Admit Patient",
                onClick: () => setAdmitDialogOpen(true),
                icon: UserPlus
              } : undefined}
            />
          ) : (
            <>
              {currentPagination.paginatedData.map(renderAdmissionCard)}
              <DataTablePagination
                currentPage={currentPagination.currentPage}
                totalPages={currentPagination.totalPages}
                onPageChange={currentPagination.goToPage}
                hasNextPage={currentPagination.hasNextPage}
                hasPrevPage={currentPagination.hasPrevPage}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="discharged-today" className="space-y-4 mt-4">
          {dischargedToday.length === 0 ? (
            <InlineEmptyState
              icon={LogOut}
              title="No discharges today"
              description="No patients have been discharged today. Discharged patients will appear here."
            />
          ) : (
            <>
              {dischargedTodayPagination.paginatedData.map(renderAdmissionCard)}
              <DataTablePagination
                currentPage={dischargedTodayPagination.currentPage}
                totalPages={dischargedTodayPagination.totalPages}
                onPageChange={dischargedTodayPagination.goToPage}
                hasNextPage={dischargedTodayPagination.hasNextPage}
                hasPrevPage={dischargedTodayPagination.hasPrevPage}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          {allAdmissions?.length === 0 ? (
            <InlineEmptyState
              icon={Bed}
              title="No admissions yet"
              description="Your hospital's admission history will appear here once you start admitting patients."
              action={(isAdmin || isDoctor) ? {
                label: "Admit First Patient",
                onClick: () => setAdmitDialogOpen(true),
                icon: UserPlus
              } : undefined}
            />
          ) : (
            <>
              {allPagination.paginatedData.map(renderAdmissionCard)}
              <DataTablePagination
                currentPage={allPagination.currentPage}
                totalPages={allPagination.totalPages}
                onPageChange={allPagination.goToPage}
                hasNextPage={allPagination.hasNextPage}
                hasPrevPage={allPagination.hasPrevPage}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Discharge Dialog */}
      <Dialog open={dischargeDialogOpen} onOpenChange={setDischargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Discharging: {selectedAdmission?.patient_profile?.display_name || "Unknown Patient"}
            </p>
            <div className="space-y-2">
              <Label>Discharge Notes / Summary</Label>
              <Textarea
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                placeholder="Enter discharge summary..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDischargeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDischarge}>Confirm Discharge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Transferring: {selectedAdmission?.patient_profile?.display_name || "Unknown Patient"}
            </p>
            <p className="text-sm text-muted-foreground">
              Current: {selectedAdmission?.bed?.ward?.name} - Bed {selectedAdmission?.bed?.bed_number}
            </p>
            <div className="space-y-2">
              <Label>New Bed</Label>
              <Select value={transferBedId} onValueChange={setTransferBedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new bed" />
                </SelectTrigger>
                <SelectContent>
                  {availableBeds?.map((bed) => (
                    <SelectItem key={bed.id} value={bed.id}>
                      {bed.ward?.name} - Bed {bed.bed_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={!transferBedId}>
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discharge Summary Dialog */}
      {selectedAdmission && (
        <DischargeSummaryDialog
          admission={selectedAdmission}
          hospital={hospital}
          open={summaryDialogOpen}
          onOpenChange={setSummaryDialogOpen}
        />
      )}
    </div>
  );
}
