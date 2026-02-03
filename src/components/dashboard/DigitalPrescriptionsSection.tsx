import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Prescription, usePatientPrescriptions } from "@/hooks/usePrescriptions";
import { PatientPrescriptionViewDialog } from "./PatientPrescriptionViewDialog";
import { format } from "date-fns";
import { FileText, Pill, Calendar, Stethoscope, User } from "lucide-react";

export const DigitalPrescriptionsSection = () => {
  const { data: prescriptions = [], isLoading } = usePatientPrescriptions();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (statusFilter === "active") return p.is_active;
    if (statusFilter === "completed") return !p.is_active;
    return true;
  });

  const activeCount = prescriptions.filter((p) => p.is_active).length;
  const completedCount = prescriptions.filter((p) => !p.is_active).length;

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prescriptions.length === 0) {
    return null; // Don't show section if no digital prescriptions
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Digital Prescriptions
          </CardTitle>
          <CardDescription>
            Prescriptions issued by your healthcare providers ({prescriptions.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All
                <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {prescriptions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                {activeCount > 0 && (
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedCount > 0 && (
                  <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                    {completedCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-0">
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {statusFilter !== "all" ? statusFilter : ""} prescriptions found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPrescriptions.map((prescription) => (
                    <Card
                      key={prescription.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewPrescription(prescription)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                Dr. {prescription.doctor_name || "Unknown"}
                              </h4>
                              {prescription.doctor_specialty && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Stethoscope className="h-3 w-3" />
                                  {prescription.doctor_specialty}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant={prescription.is_active ? "default" : "secondary"}>
                            {prescription.is_active ? "Active" : "Completed"}
                          </Badge>
                        </div>

                        {prescription.diagnosis && (
                          <p className="text-sm text-muted-foreground mb-2 truncate">
                            {prescription.diagnosis}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Pill className="h-3.5 w-3.5" />
                            <span>{prescription.medications.length} medication(s)</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(prescription.created_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPrescription(prescription);
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PatientPrescriptionViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        prescription={selectedPrescription}
      />
    </>
  );
};
