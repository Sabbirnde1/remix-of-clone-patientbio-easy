import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { useDoctorPatients, useLookupPatientByCode, useGrantPatientAccess } from "@/hooks/useDoctorPatients";
import { useDoctorPrescriptions } from "@/hooks/usePrescriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Award,
  Stethoscope,
  Clock,
  BadgeCheck,
  Edit,
  Users,
  Pill,
  QrCode,
  TrendingUp,
  Calendar,
  UserPlus,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useDoctorProfile();
  const { data: patients } = useDoctorPatients(user?.id);
  const { data: prescriptions } = useDoctorPrescriptions();

  // Add Patient Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [patientCode, setPatientCode] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const lookupPatient = useLookupPatientByCode();
  const grantAccess = useGrantPatientAccess();

  const doctorId = user?.id?.substring(0, 8).toUpperCase() || "--------";
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "DR";

  // Calculate statistics
  const totalPatients = patients?.length || 0;
  const totalPrescriptions = prescriptions?.length || 0;
  const activePrescriptions = prescriptions?.filter((rx) => rx.is_active)?.length || 0;

  // Get recent patients (last 5)
  const recentPatients = patients?.slice(0, 5) || [];

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

  const quickActions = [
    {
      title: "Add Patient",
      description: "Add a new patient by ID",
      icon: UserPlus,
      color: "bg-primary/10 text-primary",
      onClick: () => setAddDialogOpen(true),
    },
    {
      title: "My Patients",
      description: "View and manage patient records",
      icon: Users,
      href: "/doctor/patients",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Prescriptions",
      description: "View all issued prescriptions",
      icon: Pill,
      href: "/doctor/prescriptions",
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "My QR Code",
      description: "Share with patients to connect",
      icon: QrCode,
      href: "/doctor/qr-code",
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  const stats = [
    {
      title: "Total Patients",
      value: totalPatients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Prescriptions",
      value: totalPrescriptions,
      icon: Pill,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Active Prescriptions",
      value: activePrescriptions,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.full_name?.split(" ")[0] || "Doctor"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your practice
          </p>
        </div>
        <Button asChild>
          <Link to="/doctor/profile">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Quick Actions - Moved to top for visibility */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {quickActions.map((action) => {
            const CardWrapper = action.href ? Link : "div";
            return (
              <Card
                key={action.title}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={action.onClick}
              >
                <CardWrapper to={action.href || "#"}>
                  <CardContent className="p-6">
                    <div
                      className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}
                    >
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </CardContent>
                </CardWrapper>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Doctor Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Badge variant="outline" className="text-xs">
                ID: {doctorId}
              </Badge>
              {profile?.is_verified && (
                <Badge className="mt-2 bg-green-500">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex-1 grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </p>
                <p className="font-medium">{profile?.full_name || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="font-medium">{user?.email || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p className="font-medium">{profile?.phone || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  License Number
                </p>
                <p className="font-medium">{profile?.license_number || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Specialty
                </p>
                <p className="font-medium">{profile?.specialty || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Experience
                </p>
                <p className="font-medium">
                  {profile?.experience_years
                    ? `${profile.experience_years} years`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Patients */}
      {recentPatients.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Patients
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/patients">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.map((patient: any) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {patient.display_name?.[0]?.toUpperCase() || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {patient.display_name || "Unknown Patient"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Connected {patient.granted_at
                          ? format(new Date(patient.granted_at), "MMM d, yyyy")
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={patient.is_active ? "default" : "secondary"}>
                    {patient.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        if (!open) resetDialog();
      }}>
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
  );
};

export default DoctorDashboard;
