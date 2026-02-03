import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const MyDoctorsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            My Doctors
          </CardTitle>
          <CardDescription>
            Healthcare providers connected to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No connected providers</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              You haven't connected any healthcare providers yet. Share your Patient ID with your doctor to get started.
            </p>
            <Button variant="outline" disabled>
              <UserPlus className="mr-2 h-4 w-4" />
              Provider connection coming soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyDoctorsPage;
