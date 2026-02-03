import { useOutletContext } from "react-router-dom";
import { useDoctorPrescriptions } from "@/hooks/usePrescriptions";
import { Hospital } from "@/types/hospital";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Pill, Search, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface OutletContext {
  hospital: Hospital;
  isAdmin: boolean;
  isDoctor: boolean;
}

export default function DoctorPrescriptionsPage() {
  const { hospital } = useOutletContext<OutletContext>();
  const { data: prescriptions, isLoading } = useDoctorPrescriptions();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrescriptions = prescriptions?.filter((rx) => {
    const diagnosis = rx.diagnosis?.toLowerCase() || "";
    const meds = rx.medications.map((m) => m.name.toLowerCase()).join(" ");
    const query = searchQuery.toLowerCase();
    return diagnosis.includes(query) || meds.includes(query);
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          My Prescriptions
        </h1>
        <p className="text-muted-foreground mt-1">
          All prescriptions you've issued at {hospital.name}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by diagnosis or medication..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions && filteredPrescriptions.length > 0 ? (
        <div className="space-y-4">
          {filteredPrescriptions.map((rx) => (
            <Card key={rx.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {rx.diagnosis || "General Prescription"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(rx.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                  <Badge variant={rx.is_active ? "default" : "secondary"}>
                    {rx.is_active ? "Active" : "Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Medications */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Medications ({rx.medications.length})
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {rx.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-muted/50 text-sm"
                      >
                        <p className="font-medium">{med.name}</p>
                        <p className="text-muted-foreground">
                          {med.dosage} • {med.frequency}
                          {med.duration && ` • ${med.duration}`}
                        </p>
                        {med.instructions && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                {rx.instructions && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Instructions</h4>
                    <p className="text-sm text-muted-foreground">{rx.instructions}</p>
                  </div>
                )}

                {/* Follow-up */}
                {rx.follow_up_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Follow-up: {format(new Date(rx.follow_up_date), "MMM d, yyyy")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Pill className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Prescriptions Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Prescriptions you create for patients will appear here. 
              Go to "My Patients" to view patient records and write prescriptions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
