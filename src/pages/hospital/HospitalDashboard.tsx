import { useOutletContext } from "react-router-dom";
import { Hospital } from "@/types/hospital";
import { useHospitalStaff } from "@/hooks/useHospitalStaff";
import { useHospitalApplications } from "@/hooks/useDoctorApplications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Clock, CheckCircle, Building2 } from "lucide-react";

interface HospitalContext {
  hospital: Hospital;
  isAdmin: boolean;
}

export default function HospitalDashboard() {
  const { hospital, isAdmin } = useOutletContext<HospitalContext>();
  const { data: staff } = useHospitalStaff(hospital.id);
  const { data: applications } = useHospitalApplications(hospital.id);

  const pendingApplications = applications?.filter((a) => a.status === "pending") || [];
  const doctorCount = staff?.filter((s) => s.role === "doctor").length || 0;
  const totalStaff = staff?.length || 0;

  const stats = [
    {
      title: "Total Staff",
      value: totalStaff,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Doctors",
      value: doctorCount,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pending Applications",
      value: pendingApplications.length,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to {hospital.name} management portal
        </p>
      </div>

      {/* Hospital Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{hospital.name}</CardTitle>
              <CardDescription>
                {hospital.city && `${hospital.city}, ${hospital.state}`}
                {hospital.registration_number && ` • Reg: ${hospital.registration_number}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {hospital.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{hospital.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      {isAdmin && pendingApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Pending Applications
            </CardTitle>
            <CardDescription>
              {pendingApplications.length} doctor{pendingApplications.length !== 1 ? "s" : ""} awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApplications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{app.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.specialty || "General"} • {app.experience_years || 0} years exp.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
