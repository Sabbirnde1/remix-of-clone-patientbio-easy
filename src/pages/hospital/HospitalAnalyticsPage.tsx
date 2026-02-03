import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Hospital } from "@/types/hospital";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, Users, Bed, Banknote, CalendarDays, 
  Activity, UserCheck, Clock 
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";

interface HospitalContext {
  hospital: Hospital;
  isAdmin: boolean;
}

// Custom hook for hospital analytics data
const useHospitalAnalytics = (hospitalId: string) => {
  return useQuery({
    queryKey: ["hospital-analytics", hospitalId],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      const startOfCurrentMonth = startOfMonth(today);
      const endOfCurrentMonth = endOfMonth(today);

      // Fetch admissions
      const { data: admissions } = await supabase
        .from("admissions")
        .select("id, admission_date, actual_discharge, status, bed_id")
        .eq("hospital_id", hospitalId)
        .gte("admission_date", thirtyDaysAgo.toISOString());

      // Fetch invoices for revenue
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_date, total_amount, amount_paid, status")
        .eq("hospital_id", hospitalId)
        .gte("invoice_date", thirtyDaysAgo.toISOString());

      // Fetch appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, appointment_date, status")
        .eq("hospital_id", hospitalId)
        .gte("appointment_date", thirtyDaysAgo.toISOString());

      // Fetch beds for occupancy
      const { data: beds } = await supabase
        .from("beds")
        .select("id, status")
        .eq("hospital_id", hospitalId);

      // Fetch wards for ward-wise stats
      const { data: wards } = await supabase
        .from("wards")
        .select("id, name, type")
        .eq("hospital_id", hospitalId)
        .eq("is_active", true);

      return {
        admissions: admissions || [],
        invoices: invoices || [],
        appointments: appointments || [],
        beds: beds || [],
        wards: wards || [],
      };
    },
    enabled: !!hospitalId,
  });
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function HospitalAnalyticsPage() {
  const { hospital } = useOutletContext<HospitalContext>();
  const { data, isLoading } = useHospitalAnalytics(hospital.id);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  const { admissions, invoices, appointments, beds, wards } = data || {
    admissions: [],
    invoices: [],
    appointments: [],
    beds: [],
    wards: [],
  };

  // Calculate summary stats
  const totalAdmissions = admissions.length;
  const currentAdmissions = admissions.filter(a => a.status === "admitted").length;
  const dischargedThisMonth = admissions.filter(a => a.status === "discharged").length;
  
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const collectedRevenue = invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
  const pendingRevenue = totalRevenue - collectedRevenue;

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === "occupied").length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === "completed").length;
  const cancelledAppointments = appointments.filter(a => a.status === "cancelled").length;

  // Prepare chart data - Daily admissions trend
  const last14Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date(),
  });

  const admissionsTrend = last14Days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const count = admissions.filter(a => 
      format(new Date(a.admission_date), "yyyy-MM-dd") === dayStr
    ).length;
    return {
      date: format(day, "MMM d"),
      admissions: count,
    };
  });

  // Revenue trend by week
  const revenueTrend = last14Days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayRevenue = invoices
      .filter(inv => format(new Date(inv.invoice_date), "yyyy-MM-dd") === dayStr)
      .reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
    return {
      date: format(day, "MMM d"),
      revenue: dayRevenue,
    };
  });

  // Appointment status distribution
  const appointmentDistribution = [
    { name: "Completed", value: completedAppointments, color: "#10b981" },
    { name: "Scheduled", value: appointments.filter(a => a.status === "scheduled").length, color: "hsl(var(--primary))" },
    { name: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length, color: "#3b82f6" },
    { name: "Cancelled", value: cancelledAppointments, color: "#ef4444" },
    { name: "No Show", value: appointments.filter(a => a.status === "no_show").length, color: "#f59e0b" },
  ].filter(item => item.value > 0);

  // Bed status distribution
  const bedDistribution = [
    { name: "Available", value: beds.filter(b => b.status === "available").length, color: "#10b981" },
    { name: "Occupied", value: occupiedBeds, color: "hsl(var(--primary))" },
    { name: "Maintenance", value: beds.filter(b => b.status === "maintenance").length, color: "#f59e0b" },
    { name: "Reserved", value: beds.filter(b => b.status === "reserved").length, color: "#8b5cf6" },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Hospital performance metrics and trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Admissions</p>
                <p className="text-3xl font-bold">{currentAdmissions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalAdmissions} total this month
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bed Occupancy</p>
                <p className="text-3xl font-bold">{occupancyRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {occupiedBeds} of {totalBeds} beds
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Bed className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Collected</p>
                <p className="text-3xl font-bold text-green-600">৳{(collectedRevenue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ৳{(pendingRevenue / 1000).toFixed(1)}K pending
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <p className="text-3xl font-bold">{totalAppointments}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedAppointments} completed
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="admissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="admissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Admissions Trend (Last 14 Days)
              </CardTitle>
              <CardDescription>Daily patient admissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={admissionsTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="admissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Revenue Trend (Last 14 Days)
              </CardTitle>
              <CardDescription>Daily revenue collected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `৳${value / 1000}K`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Bed Status Distribution
                </CardTitle>
                <CardDescription>Current bed availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {bedDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bedDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {bedDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No bed data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Occupancy Summary</CardTitle>
                <CardDescription>Key occupancy metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Beds</p>
                    <p className="text-2xl font-bold">{totalBeds}</p>
                  </div>
                  <Bed className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Currently Occupied</p>
                    <p className="text-2xl font-bold text-primary">{occupiedBeds}</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Now</p>
                    <p className="text-2xl font-bold text-green-600">
                      {beds.filter(b => b.status === "available").length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Appointment Status
                </CardTitle>
                <CardDescription>Last 30 days breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {appointmentDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appointmentDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {appointmentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No appointment data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Metrics</CardTitle>
                <CardDescription>Performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Appointments</p>
                    <p className="text-2xl font-bold">{totalAppointments}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalAppointments > 0 
                        ? Math.round((completedAppointments / totalAppointments) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                    <p className="text-2xl font-bold text-red-600">
                      {totalAppointments > 0 
                        ? Math.round((cancelledAppointments / totalAppointments) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
