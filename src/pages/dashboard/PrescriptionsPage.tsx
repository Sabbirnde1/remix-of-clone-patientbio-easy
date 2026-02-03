import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PrescriptionsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Prescriptions & Records
          </CardTitle>
          <CardDescription>
            View and manage your uploaded health documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No records yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              You haven't uploaded any health documents. Start by uploading your first prescription or medical record.
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-secondary border-0">
              <Link to="/dashboard/upload">Upload Your First Record</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionsPage;
