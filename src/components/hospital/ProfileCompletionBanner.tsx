import { Link } from "react-router-dom";
import { Hospital } from "@/types/hospital";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface ProfileCompletionBannerProps {
  hospital: Hospital;
}

const PROFILE_FIELDS = [
  { key: "name", label: "Hospital name" },
  { key: "city", label: "City" },
  { key: "phone", label: "Phone number" },
  { key: "email", label: "Email address" },
  { key: "address", label: "Street address" },
  { key: "description", label: "Description" },
] as const;

export default function ProfileCompletionBanner({ hospital }: ProfileCompletionBannerProps) {
  const completedFields = PROFILE_FIELDS.filter(
    (field) => hospital[field.key as keyof Hospital]
  );
  const missingFields = PROFILE_FIELDS.filter(
    (field) => !hospital[field.key as keyof Hospital]
  );
  
  const completionPercent = Math.round((completedFields.length / PROFILE_FIELDS.length) * 100);

  // Don't show if profile is 80% or more complete
  if (completionPercent >= 80) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                Complete Your Hospital Profile
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Add more details to help doctors and patients find your facility.
            </p>
            
            <div className="flex items-center gap-3 mb-3">
              <Progress value={completionPercent} className="flex-1 h-2" />
              <span className="text-sm font-medium text-primary">
                {completionPercent}%
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {missingFields.slice(0, 3).map((field) => (
                <span
                  key={field.key}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  + {field.label}
                </span>
              ))}
              {missingFields.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  +{missingFields.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <Button asChild>
            <Link to="settings">
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
