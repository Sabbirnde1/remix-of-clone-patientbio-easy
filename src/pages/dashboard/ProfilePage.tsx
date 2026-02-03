import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, UserProfileUpdate } from "@/hooks/useUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Calendar, MapPin, Phone, Save, Loader2, Bell } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, loading, saving, updateProfile } = useUserProfile();
  
  const [formData, setFormData] = useState<UserProfileUpdate>({
    display_name: "",
    date_of_birth: "",
    gender: "",
    location: "",
    phone: "",
    notification_email_enabled: true,
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        location: profile.location || "",
        phone: profile.phone || "",
        notification_email_enabled: profile.notification_email_enabled ?? true,
      });
    }
  }, [profile]);

  const handleChange = (field: keyof UserProfileUpdate, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(formData.date_of_birth || null);

  // Generate a patient ID from user UUID (first 8 chars, uppercase)
  const patientId = user?.id?.substring(0, 8).toUpperCase() || "N/A";

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Read-only Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient Basic Information
          </CardTitle>
          <CardDescription>
            Your account information and patient ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user?.email}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Patient ID</Label>
              <div className="text-sm font-mono bg-muted px-2 py-1 rounded w-fit">
                {patientId}
              </div>
            </div>
            {age !== null && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Age</Label>
                <div className="text-sm">{age} years old</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editable Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="display_name"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.display_name || ""}
                  onChange={(e) => handleChange("display_name", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date_of_birth"
                    type="date"
                    className="pl-10"
                    value={formData.date_of_birth || ""}
                    onChange={(e) => handleChange("date_of_birth", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) => handleChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="City, Country"
                  className="pl-10"
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
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
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications about your shared health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notification-toggle" className="text-base">
                Email notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive an email when someone accesses your shared health data links
              </p>
            </div>
            <Switch
              id="notification-toggle"
              checked={formData.notification_email_enabled ?? true}
              onCheckedChange={(checked) => {
                handleChange("notification_email_enabled", checked);
                // Auto-save notification preference
                updateProfile({ notification_email_enabled: checked });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
