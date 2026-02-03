import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctorPrescriptions } from "@/hooks/usePrescriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, Pill, Loader2, Calendar, User, FileText } from "lucide-react";

const DoctorPrescriptionsPage = () => {
  const { user } = useAuth();
  const { data: prescriptions, isLoading } = useDoctorPrescriptions();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPrescriptions = prescriptions?.filter((rx: any) =>
    rx.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rx.medications?.some((med: any) =>
      med.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
        <p className="text-muted-foreground">
          All prescriptions you have issued
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by diagnosis or medication..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Prescriptions List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPrescriptions?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pill className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No prescriptions yet</h3>
            <p className="text-muted-foreground text-center">
              Prescriptions you issue to patients will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPrescriptions?.map((rx: any) => (
            <Card key={rx.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {rx.diagnosis || "No diagnosis"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(rx.created_at), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Patient ID: {rx.patient_id?.substring(0, 8).toUpperCase()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={rx.is_active ? "default" : "secondary"}>
                    {rx.is_active ? "Active" : "Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {rx.medications && rx.medications.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Medications:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rx.medications.map((med: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Pill className="h-3 w-3 mr-1" />
                          {med.name}
                          {med.dosage && ` - ${med.dosage}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {rx.instructions && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <p className="font-medium">Instructions:</p>
                    <p>{rx.instructions}</p>
                  </div>
                )}
                {rx.follow_up_date && (
                  <div className="mt-3 text-sm">
                    <Badge variant="secondary">
                      Follow-up: {format(new Date(rx.follow_up_date), "MMM d, yyyy")}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptionsPage;
