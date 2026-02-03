import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHealthData } from "@/hooks/useHealthData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Upload,
  Share2,
  User,
  Heart,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";

const DashboardHome = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { healthData, loading: healthLoading } = useHealthData();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Get display name
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";

  // Onboarding checklist items
  const checklistItems = [
    {
      id: "profile",
      label: "Complete your profile",
      completed: !!profile?.display_name,
      link: "/dashboard/profile",
    },
    {
      id: "health",
      label: "Add your health information",
      completed: !!healthData?.blood_group,
      link: "/dashboard/health-data",
    },
    {
      id: "record",
      label: "Upload your first health record",
      completed: false, // Will be dynamic later
      link: "/dashboard/upload",
    },
  ];

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const progressPercent = (completedCount / checklistItems.length) * 100;

  const quickActions = [
    {
      title: "Upload Record",
      description: "Add a new health document",
      icon: Upload,
      link: "/dashboard/upload",
      gradient: "from-primary to-secondary",
    },
    {
      title: "Share Data",
      description: "Share with your provider",
      icon: Share2,
      link: "/dashboard/share",
      gradient: "from-secondary to-accent",
    },
    {
      title: "View Records",
      description: "Browse your prescriptions",
      icon: FileText,
      link: "/dashboard/prescriptions",
      gradient: "from-accent to-primary",
    },
  ];

  const summaryCards = [
    {
      title: "Health Records",
      value: "0",
      description: "No documents yet",
      icon: FileText,
      link: "/dashboard/prescriptions",
    },
    {
      title: "Profile Status",
      value: profile ? "Active" : "Incomplete",
      description: profile?.display_name ? "Looking good!" : "Add your info",
      icon: User,
      link: "/dashboard/profile",
    },
    {
      title: "Health Data",
      value: healthData ? "Added" : "Not set",
      description: healthData?.blood_group || "Add your details",
      icon: Heart,
      link: "/dashboard/health-data",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {getGreeting()}, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Your health data at a glance. Take control of your medical records.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-secondary border-0 w-fit">
            <Link to="/dashboard/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Record
            </Link>
          </Button>
        </div>
      </div>

      {/* Getting Started Checklist */}
      {(profileLoading || healthLoading) ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-2 w-full mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : completedCount < checklistItems.length ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to get the most out of Patient Bio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {completedCount} of {checklistItems.length} completed
            </p>

            {/* Checklist */}
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span
                      className={
                        item.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <Link to={card.link}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.link}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
