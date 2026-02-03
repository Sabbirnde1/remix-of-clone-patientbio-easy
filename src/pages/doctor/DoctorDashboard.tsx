import { useAuth } from "@/contexts/AuthContext";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useDoctorProfile();

  const doctorId = user?.id?.substring(0, 8).toUpperCase() || "--------";
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "DR";

  const quickActions = [
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.full_name?.split(" ")[0] || "Doctor"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your profile
          </p>
        </div>
        <Button asChild>
          <Link to="/doctor/profile">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
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
                  <Award className="h-4 w-4" />
                  Qualification
                </p>
                <p className="font-medium">{profile?.qualification || "—"}</p>
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

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Consultation Fee</p>
                <p className="font-medium">
                  {profile?.consultation_fee
                    ? `৳${profile.consultation_fee}`
                    : "—"}
                </p>
              </div>

              {profile?.bio && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="text-sm">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <Link to={action.href}>
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
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
