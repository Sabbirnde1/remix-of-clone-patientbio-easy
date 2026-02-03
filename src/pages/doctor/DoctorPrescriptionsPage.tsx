import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctorPrescriptions, Prescription } from "@/hooks/usePrescriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, subDays, isAfter } from "date-fns";
import { 
  Search, 
  Pill, 
  Loader2, 
  Calendar, 
  User, 
  FileText, 
  Eye, 
  Filter,
  X,
  CheckCircle,
  Clock
} from "lucide-react";
import { PrescriptionViewDialog } from "@/components/doctor/PrescriptionViewDialog";
import { usePagination } from "@/hooks/usePagination";
import { DataTablePagination } from "@/components/admin/DataTablePagination";

type StatusFilter = "all" | "active" | "completed";
type DateFilter = "all" | "7days" | "30days" | "90days";

const DoctorPrescriptionsPage = () => {
  const { user } = useAuth();
  const { data: prescriptions, isLoading } = useDoctorPrescriptions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const filteredPrescriptions = useMemo(() => {
    if (!prescriptions) return [];

    return prescriptions.filter((rx: Prescription) => {
      // Text search
      const matchesSearch = 
        rx.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.medications?.some((med) =>
          med.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rx.is_active) ||
        (statusFilter === "completed" && !rx.is_active);

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all" && rx.created_at) {
        const createdDate = new Date(rx.created_at);
        const daysAgo = dateFilter === "7days" ? 7 : dateFilter === "30days" ? 30 : 90;
        const cutoffDate = subDays(new Date(), daysAgo);
        matchesDate = isAfter(createdDate, cutoffDate);
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [prescriptions, searchTerm, statusFilter, dateFilter]);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedPrescriptions,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination({ data: filteredPrescriptions, itemsPerPage: 10 });

  const activeFiltersCount = 
    (statusFilter !== "all" ? 1 : 0) + 
    (dateFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Prescriptions</h1>
        <p className="text-sm text-muted-foreground">
          All prescriptions you have issued
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by diagnosis, patient, or medication..."
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
              variant={statusFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("completed")}
              className="h-8 text-xs px-3"
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              Completed
            </Button>
          </div>

          {/* Divider - hidden on mobile */}
          <div className="hidden sm:block w-px h-6 bg-border mx-1" />

          {/* Date filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 mr-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Issued:</span>
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
        {prescriptions && prescriptions.length > 0 && (
          <p className="text-xs text-muted-foreground pt-1">
            Showing {filteredPrescriptions.length} of {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Prescriptions List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : prescriptions?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pill className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No prescriptions yet</h3>
            <p className="text-muted-foreground text-center">
              Prescriptions you issue to patients will appear here
            </p>
          </CardContent>
        </Card>
      ) : filteredPrescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No matching prescriptions</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedPrescriptions.map((rx: Prescription) => (
            <Card key={rx.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{rx.diagnosis || "No diagnosis"}</span>
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                      <span className="flex items-center gap-1 text-xs">
                        <User className="h-3 w-3" />
                        {rx.patient_name || `ID: ${rx.patient_id?.substring(0, 8).toUpperCase()}`}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(rx.created_at), "MMM d, yyyy")}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge 
                      variant={rx.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {rx.is_active ? "Active" : "Completed"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => {
                        setSelectedPrescription(rx);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {rx.medications && rx.medications.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Medications ({rx.medications.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {rx.medications.slice(0, 4).map((med, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs font-normal">
                          <Pill className="h-3 w-3 mr-1" />
                          {med.name}
                          {med.dosage && ` - ${med.dosage}`}
                        </Badge>
                      ))}
                      {rx.medications.length > 4 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          +{rx.medications.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {rx.follow_up_date && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Follow-up: {format(new Date(rx.follow_up_date), "MMM d, yyyy")}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        </div>
      )}

      {/* View/Print Dialog */}
      <PrescriptionViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        prescription={selectedPrescription}
        patientName={selectedPrescription?.patient_name}
      />
    </div>
  );
};

export default DoctorPrescriptionsPage;