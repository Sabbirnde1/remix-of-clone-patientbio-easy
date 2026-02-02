import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Mail, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ContactMessage {
  id: string;
  status: string;
  created_at: string;
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

function ChartSkeleton() {
  return (
    <Card className="col-span-full lg:col-span-2">
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

  const isLoading = messagesLoading || teamLoading;

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
      title: "Team Members",
      value: teamCount ?? 0,
      description: "Active team members",
      icon: UserCog,
      color: "text-blue-500",
    },
    {
      title: "Total Messages",
      value: stats.total,
      description: `${stats.unread} unread`,
      icon: Mail,
      color: "text-green-500",
    },
    {
      title: "This Week",
      value: stats.thisWeek,
      description: "Messages received",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Today",
      value: messagesByDay[messagesByDay.length - 1]?.messages || 0,
      description: format(new Date(), "MMM d, yyyy"),
      icon: Calendar,
      color: "text-orange-500",
    },
  ];

  const chartConfig = {
    messages: {
      label: "Messages",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the admin panel</p>
      </div>

      {isLoading ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartSkeleton />
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
                <CardDescription>Messages received over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={messagesByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
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
              <CardHeader>
                <CardTitle>Message Status</CardTitle>
                <CardDescription>Read vs unread breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={messagesByStatus} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis 
                        dataKey="status" 
                        type="category" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        width={60}
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
