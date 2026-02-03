import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Heart,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  Phone,
  MapPin,
  Calendar,
  Pill,
  Droplet,
  AlertTriangle,
  XCircle,
  Home,
} from "lucide-react";
import { format } from "date-fns";

interface PatientProfile {
  display_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  location: string | null;
  phone: string | null;
}

interface HealthData {
  blood_group: string | null;
  health_allergies: string | null;
  current_medications: string | null;
  chronic_diseases: string | null;
  previous_diseases: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  height: string | null;
}

interface HealthRecord {
  id: string;
  title: string;
  category: string | null;
  record_date: string | null;
  provider_name: string | null;
}

type PageState = "loading" | "valid" | "expired" | "revoked" | "invalid";

const ShareViewPage = () => {
  const { token } = useParams<{ token: string }>();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    const validateAndFetch = async () => {
      if (!token) {
        setPageState("invalid");
        return;
      }

      try {
        // Fetch token details
        const { data: tokenData, error: tokenError } = await supabase
          .from("access_tokens")
          .select("*")
          .eq("token", token)
          .single();

        if (tokenError || !tokenData) {
          setPageState("invalid");
          return;
        }

        // Check if revoked
        if (tokenData.is_revoked) {
          setPageState("revoked");
          return;
        }

        // Check if expired
        if (new Date(tokenData.expires_at) < new Date()) {
          setPageState("expired");
          setExpiresAt(tokenData.expires_at);
          return;
        }

        setExpiresAt(tokenData.expires_at);

        // Update access tracking
        await supabase
          .from("access_tokens")
          .update({
            accessed_at: new Date().toISOString(),
            access_count: (tokenData.access_count || 0) + 1,
          })
          .eq("id", tokenData.id);

        // Fetch patient data using user_id from token
        const userId = tokenData.user_id;

        const [profileRes, healthRes, recordsRes] = await Promise.all([
          supabase.from("user_profiles").select("*").eq("user_id", userId).single(),
          supabase.from("health_data").select("*").eq("user_id", userId).single(),
          supabase
            .from("health_records")
            .select("id, title, category, record_date, provider_name")
            .eq("user_id", userId)
            .order("record_date", { ascending: false })
            .limit(10),
        ]);

        setProfile(profileRes.data);
        setHealthData(healthRes.data);
        setRecords(recordsRes.data || []);
        setPageState("valid");
      } catch {
        setPageState("invalid");
      }
    };

    validateAndFetch();
  }, [token]);

  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (pageState === "invalid") {
    return (
      <ErrorPage
        icon={<XCircle className="h-16 w-16 text-destructive" />}
        title="Invalid Link"
        description="This sharing link is invalid or does not exist."
      />
    );
  }

  if (pageState === "revoked") {
    return (
      <ErrorPage
        icon={<AlertCircle className="h-16 w-16 text-destructive" />}
        title="Access Revoked"
        description="The patient has revoked access to this link."
      />
    );
  }

  if (pageState === "expired") {
    return (
      <ErrorPage
        icon={<Clock className="h-16 w-16 text-muted-foreground" />}
        title="Link Expired"
        description={`This link expired on ${expiresAt ? format(new Date(expiresAt), "PPP 'at' p") : "an unknown date"}.`}
      />
    );
  }

  const patientName = profile?.display_name || "Patient";
  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">PatientBio</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            Expires {expiresAt ? format(new Date(expiresAt), "MMM d, p") : "soon"}
          </Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Patient Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{patientName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    {age && <span>{age} years old</span>}
                    {profile?.gender && <span>• {profile.gender}</span>}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {profile?.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.date_of_birth && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>DOB: {format(new Date(profile.date_of_birth), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Critical Info Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoBlock
                icon={<Droplet className="h-4 w-4" />}
                label="Blood Group"
                value={healthData?.blood_group}
                highlight
              />
              <InfoBlock
                icon={<User className="h-4 w-4" />}
                label="Height"
                value={healthData?.height}
              />
            </div>

            <Separator />

            {/* Allergies */}
            {healthData?.health_allergies && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Allergies
                </h4>
                <p className="text-sm bg-destructive/10 text-destructive rounded-lg p-3">
                  {healthData.health_allergies}
                </p>
              </div>
            )}

            {/* Medications */}
            {healthData?.current_medications && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-primary" />
                  Current Medications
                </h4>
                <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  {healthData.current_medications}
                </p>
              </div>
            )}

            {/* Chronic Diseases */}
            {healthData?.chronic_diseases && (
              <div>
                <h4 className="text-sm font-medium mb-2">Chronic Conditions</h4>
                <p className="text-sm text-muted-foreground">{healthData.chronic_diseases}</p>
              </div>
            )}

            {/* Previous Diseases */}
            {healthData?.previous_diseases && (
              <div>
                <h4 className="text-sm font-medium mb-2">Medical History</h4>
                <p className="text-sm text-muted-foreground">{healthData.previous_diseases}</p>
              </div>
            )}

            {/* No health data message */}
            {!healthData?.blood_group &&
              !healthData?.health_allergies &&
              !healthData?.current_medications && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No health information has been added yet.
                </p>
              )}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {(healthData?.emergency_contact_name || healthData?.emergency_contact_phone) && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <Phone className="h-4 w-4" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{healthData.emergency_contact_name}</p>
              {healthData.emergency_contact_phone && (
                <a
                  href={`tel:${healthData.emergency_contact_phone}`}
                  className="text-primary hover:underline text-sm"
                >
                  {healthData.emergency_contact_phone}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Records */}
        {records.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Recent Records
              </CardTitle>
              <CardDescription>Latest health documents on file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{record.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.provider_name && `${record.provider_name} • `}
                          {record.record_date
                            ? format(new Date(record.record_date), "MMM d, yyyy")
                            : "No date"}
                        </p>
                      </div>
                    </div>
                    {record.category && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {record.category.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center pt-6 pb-12">
          <p className="text-xs text-muted-foreground mb-4">
            This is a read-only view. The patient controls what information is shared.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Learn about PatientBio
            </Link>
          </Button>
        </footer>
      </main>
    </div>
  );
};

// Helper Components
const InfoBlock = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) => (
  <div className={`p-3 rounded-lg ${highlight ? "bg-primary/10" : "bg-muted/50"}`}>
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className={`font-semibold ${highlight ? "text-primary" : ""}`}>
      {value || "Not specified"}
    </p>
  </div>
);

const ErrorPage = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <Card className="max-w-md w-full text-center">
      <CardContent className="pt-12 pb-8">
        <div className="flex justify-center mb-6">{icon}</div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default ShareViewPage;
