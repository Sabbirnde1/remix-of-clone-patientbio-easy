import { useState, useEffect } from "react";
import { useHealthData, HealthDataUpdate } from "@/hooks/useHealthData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Save, Loader2, Phone, User, AlertTriangle } from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HealthDataPage = () => {
  const { healthData, loading, saving, updateHealthData } = useHealthData();
  
  const [formData, setFormData] = useState<HealthDataUpdate>({
    height: "",
    blood_group: "",
    previous_diseases: "",
    current_medications: "",
    bad_habits: "",
    chronic_diseases: "",
    health_allergies: "",
    birth_defects: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  // Populate form when health data loads
  useEffect(() => {
    if (healthData) {
      setFormData({
        height: healthData.height || "",
        blood_group: healthData.blood_group || "",
        previous_diseases: healthData.previous_diseases || "",
        current_medications: healthData.current_medications || "",
        bad_habits: healthData.bad_habits || "",
        chronic_diseases: healthData.chronic_diseases || "",
        health_allergies: healthData.health_allergies || "",
        birth_defects: healthData.birth_defects || "",
        emergency_contact_name: healthData.emergency_contact_name || "",
        emergency_contact_phone: healthData.emergency_contact_phone || "",
      });
    }
  }, [healthData]);

  const handleChange = (field: keyof HealthDataUpdate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHealthData(formData);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Personal Health Data
          </CardTitle>
          <CardDescription>
            Keep your health information up to date for better care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Health Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  placeholder="e.g., 5 ft 10 in or 178 cm"
                  value={formData.height || ""}
                  onChange={(e) => handleChange("height", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select
                  value={formData.blood_group || ""}
                  onValueChange={(value) => handleChange("blood_group", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medical History */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Medical History
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="previous_diseases">Previous Diseases</Label>
                <Textarea
                  id="previous_diseases"
                  placeholder="List any previous illnesses or conditions..."
                  className="min-h-[80px]"
                  value={formData.previous_diseases || ""}
                  onChange={(e) => handleChange("previous_diseases", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_medications">Current Medications</Label>
                <Textarea
                  id="current_medications"
                  placeholder="List any medications you're currently taking..."
                  className="min-h-[80px]"
                  value={formData.current_medications || ""}
                  onChange={(e) => handleChange("current_medications", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronic_diseases">Chronic Diseases</Label>
                <Textarea
                  id="chronic_diseases"
                  placeholder="List any ongoing or chronic conditions..."
                  className="min-h-[80px]"
                  value={formData.chronic_diseases || ""}
                  onChange={(e) => handleChange("chronic_diseases", e.target.value)}
                />
              </div>
            </div>

            {/* Allergies & Other */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Allergies & Other Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="health_allergies" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Health Allergies
                </Label>
                <Textarea
                  id="health_allergies"
                  placeholder="List any allergies (medications, food, environmental)..."
                  className="min-h-[80px]"
                  value={formData.health_allergies || ""}
                  onChange={(e) => handleChange("health_allergies", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_defects">Birth Defects</Label>
                <Textarea
                  id="birth_defects"
                  placeholder="Any congenital conditions or birth defects..."
                  className="min-h-[80px]"
                  value={formData.birth_defects || ""}
                  onChange={(e) => handleChange("birth_defects", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bad_habits">Lifestyle Habits</Label>
                <Textarea
                  id="bad_habits"
                  placeholder="e.g., Smoking, alcohol consumption, etc."
                  className="min-h-[80px]"
                  value={formData.bad_habits || ""}
                  onChange={(e) => handleChange("bad_habits", e.target.value)}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Emergency Contact
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Contact Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="emergency_contact_name"
                      placeholder="Emergency contact name"
                      className="pl-10"
                      value={formData.emergency_contact_name || ""}
                      onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="emergency_contact_phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      value={formData.emergency_contact_phone || ""}
                      onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary border-0"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Health Data
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDataPage;
