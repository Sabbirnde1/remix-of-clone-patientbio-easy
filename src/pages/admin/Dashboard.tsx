import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, Mail, FileText, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [teamResult, messagesResult] = await Promise.all([
        supabase.from("team_members").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id, status", { count: "exact" }),
      ]);

      const newMessages = messagesResult.data?.filter(m => m.status === "new").length ?? 0;

      return {
        teamMembers: teamResult.count ?? 0,
        totalMessages: messagesResult.count ?? 0,
        newMessages,
      };
    },
  });

  const statCards = [
    {
      title: "Team Members",
      value: stats?.teamMembers ?? 0,
      description: "Active team members",
      icon: UserCog,
      color: "text-blue-500",
    },
    {
      title: "Messages",
      value: stats?.totalMessages ?? 0,
      description: `${stats?.newMessages ?? 0} unread`,
      icon: Mail,
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the admin panel</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
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
      )}
    </div>
  );
}
