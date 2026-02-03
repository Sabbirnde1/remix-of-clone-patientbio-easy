import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, FolderOpen, Trash2, ExternalLink, Calendar, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useHealthRecords } from "@/hooks/useHealthRecords";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type HealthRecord = Tables<"health_records">;

const DISEASE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "cancer", label: "Cancer" },
  { value: "covid19", label: "COVID-19" },
  { value: "diabetes", label: "Diabetes" },
  { value: "heart_disease", label: "Heart Disease" },
  { value: "other", label: "Other" },
];

const PrescriptionsPage = () => {
  const { records, isLoading, deleteRecord, isDeleting, getSignedUrl } = useHealthRecords();
  const [activeTab, setActiveTab] = useState("general");
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());

  // Filter records by disease category
  const filteredRecords = records.filter(
    (record) => record.disease_category === activeTab
  );

  // Get signed URL for a record
  const fetchSignedUrl = async (record: HealthRecord) => {
    if (signedUrls[record.id] || loadingUrls.has(record.id)) return;
    
    setLoadingUrls((prev) => new Set([...prev, record.id]));
    const url = await getSignedUrl(record.file_url);
    if (url) {
      setSignedUrls((prev) => ({ ...prev, [record.id]: url }));
    }
    setLoadingUrls((prev) => {
      const next = new Set(prev);
      next.delete(record.id);
      return next;
    });
  };

  // Fetch signed URLs when records change
  useEffect(() => {
    filteredRecords.forEach(fetchSignedUrl);
  }, [filteredRecords.map((r) => r.id).join(",")]);

  const getCategoryBadgeColor = (category: string | null) => {
    switch (category) {
      case "prescription":
        return "bg-primary/10 text-primary";
      case "lab_result":
        return "bg-secondary/10 text-secondary-foreground";
      case "imaging":
        return "bg-accent/10 text-accent-foreground";
      case "vaccination":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCategory = (category: string | null) => {
    if (!category) return "Other";
    return category.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Prescriptions & Records
          </CardTitle>
          <CardDescription>
            View and manage your uploaded health documents ({records.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No records yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                You haven't uploaded any health documents. Start by uploading your first prescription or medical record.
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-secondary border-0">
                <Link to="/dashboard/upload">Upload Your First Record</Link>
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-6 mb-6">
                  {DISEASE_CATEGORIES.map((cat) => {
                    const count = records.filter(
                      (r) => r.disease_category === cat.value
                    ).length;
                    return (
                      <TabsTrigger
                        key={cat.value}
                        value={cat.value}
                        className="text-xs sm:text-sm whitespace-nowrap"
                      >
                        {cat.label}
                        {count > 0 && (
                          <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {DISEASE_CATEGORIES.map((cat) => (
                <TabsContent key={cat.value} value={cat.value}>
                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No records in this category
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredRecords.map((record) => (
                        <Card key={record.id} className="overflow-hidden">
                          <div className="relative">
                            {/* Preview thumbnail */}
                            {record.file_type?.startsWith("image/") &&
                            signedUrls[record.id] ? (
                              <img
                                src={signedUrls[record.id]}
                                alt={record.title}
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="w-full h-32 bg-muted flex items-center justify-center">
                                <FileText className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <Badge
                              className={`absolute top-2 right-2 ${getCategoryBadgeColor(record.category)}`}
                            >
                              {formatCategory(record.category)}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold truncate mb-2">
                              {record.title}
                            </h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {record.record_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(record.record_date), "MMM d, yyyy")}
                                </div>
                              )}
                              {record.provider_name && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {record.provider_name}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  const url = signedUrls[record.id];
                                  if (url) window.open(url, "_blank");
                                }}
                                disabled={!signedUrls[record.id]}
                              >
                                {loadingUrls.has(record.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View
                                  </>
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{record.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => deleteRecord(record)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionsPage;
