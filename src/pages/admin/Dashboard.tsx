import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Mail, TrendingUp, Calendar, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ContactMessage {
  id: string;
  status: string;
  created_at: string;
}

interface UserSignup {
  created_at: string;
  email_confirmed_at: string | null;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["admin-messages-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id, status, created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const { data: teamCount, isLoading: teamLoading } = useQuery({
    queryKey: ["admin-team-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true });

      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-users?action=stats", {
        method: "GET",
      });

      if (error) throw error;
      return data as { signups: UserSignup[]; totalUsers: number };
    },
  });

  const isLoading = messagesLoading || teamLoading || userStatsLoading;

  const stats = useMemo(() => {
    if (!messages) return { total: 0, unread: 0, thisWeek: 0 };
    
    const now = new Date();
    const weekAgo = subDays(now, 7);
    
    return {
      total: messages.length,
      unread: messages.filter(m => m.status === "new").length,
      thisWeek: messages.filter(m => new Date(m.created_at) >= weekAgo).length,
    };
  }, [messages]);

  const userStatsCalc = useMemo(() => {
    if (!userStats?.signups) return { total: 0, thisWeek: 0, verified: 0 };
    
    const now = new Date();
    const weekAgo = subDays(now, 7);
    
    return {
      total: userStats.totalUsers,
      thisWeek: userStats.signups.filter(u => new Date(u.created_at) >= weekAgo).length,
      verified: userStats.signups.filter(u => u.email_confirmed_at).length,
    };
  }, [userStats]);

  const messagesByDay = useMemo(() => {
    if (!messages) return [];
    
    const now = new Date();
    const startDate = subDays(now, 29);
    const days = eachDayOfInterval({ start: startDate, end: now });
    
    const countsByDay = new Map<string, number>();
    messages.forEach(msg => {
      const day = format(startOfDay(new Date(msg.created_at)), "yyyy-MM-dd");
      countsByDay.set(day, (countsByDay.get(day) || 0) + 1);
    });
    
    return days.map(day => ({
      date: format(day, "MMM d"),
      fullDate: format(day, "yyyy-MM-dd"),
      messages: countsByDay.get(format(day, "yyyy-MM-dd")) || 0,
    }));
  }, [messages]);

  const signupsByDay = useMemo(() => {
    if (!userStats?.signups) return [];
    
    const now = new Date();
    const startDate = subDays(now, 29);
    const days = eachDayOfInterval({ start: startDate, end: now });
    
    const countsByDay = new Map<string, number>();
    let cumulative = 0;
    
    // Count signups before the start date for cumulative
    userStats.signups.forEach(user => {
      const userDate = new Date(user.created_at);
      if (userDate < startDate) {
        cumulative++;
      }
    });
    
    // Count by day
    userStats.signups.forEach(user => {
      const day = format(startOfDay(new Date(user.created_at)), "yyyy-MM-dd");
      countsByDay.set(day, (countsByDay.get(day) || 0) + 1);
    });
    
    return days.map(day => {
      const dayKey = format(day, "yyyy-MM-dd");
      const signups = countsByDay.get(dayKey) || 0;
      cumulative += signups;
      return {
        date: format(day, "MMM d"),
        fullDate: dayKey,
        signups,
        total: cumulative,
      };
    });
  }, [userStats]);

  const messagesByStatus = useMemo(() => {
    if (!messages) return [];
    
    const statusCounts = messages.reduce((acc, msg) => {
      const status = msg.status === "new" ? "Unread" : "Read";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [messages]);

  const statCards = [
    {
      title: "Total Users",
      value: userStatsCalc.total,
      description: `${userStatsCalc.verified} verified`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Team Members",
      value: teamCount ?? 0,
      description: "Active team members",
      icon: UserCog,
      color: "text-secondary",
    },
    {
      title: "Total Messages",
      value: stats.total,
      description: `${stats.unread} unread`,
      icon: Mail,
      color: "text-accent",
    },
    {
      title: "New This Week",
      value: userStatsCalc.thisWeek,
      description: "User signups",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  const chartConfig = {
    messages: {
      label: "Messages",
      color: "hsl(var(--primary))",
    },
    signups: {
      label: "Signups",
      color: "hsl(var(--chart-2))",
    },
    total: {
      label: "Total Users",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome to the admin panel</p>
      </div>

      {isLoading ? (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
            <ChartSkeleton className="col-span-full lg:col-span-2" />
            <ChartSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-3 sm:p-6 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">User Signups</CardTitle>
                <CardDescription className="text-xs sm:text-sm">New registrations over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={signupsByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="signups" 
                        fill="hsl(var(--chart-2))" 
                        radius={[4, 4, 0, 0]}
                        name="Signups"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">User Growth</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Cumulative user count over 30 days</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={signupsByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone"
                        dataKey="total" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2}
                        dot={false}
                        name="Total Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Message Volume</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Messages received over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={messagesByDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="messages"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorMessages)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Message Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Read vs unread breakdown</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={messagesByStatus} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis 
                        dataKey="status" 
                        type="category" 
                        tick={{ fontSize: 10 }} 
                        tickLine={false}
                        axisLine={false}
                        width={50}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 4, 4, 0]}
                        name="Messages"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
