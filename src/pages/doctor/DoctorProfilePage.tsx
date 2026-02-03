import { useState, useEffect } from "react";
import { useDoctorProfile, useUpdateDoctorProfile } from "@/hooks/useDoctorProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SPECIALTIES } from "@/types/hospital";
import { Loader2, Save } from "lucide-react";

const DoctorProfilePage = () => {
  const { data: profile, isLoading } = useDoctorProfile();
  const updateProfile = useUpdateDoctorProfile();

  const [formData, setFormData] = useState({
    full_name: "",
    license_number: "",
    specialty: "",
    qualification: "",
    experience_years: "",
    consultation_fee: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        license_number: profile.license_number || "",
        specialty: profile.specialty || "",
        qualification: profile.qualification || "",
        experience_years: profile.experience_years?.toString() || "",
        consultation_fee: profile.consultation_fee?.toString() || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateProfile.mutateAsync({
      full_name: formData.full_name,
      license_number: formData.license_number || null,
      specialty: formData.specialty || null,
      qualification: formData.qualification || null,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
      phone: formData.phone || null,
      bio: formData.bio || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Update your professional information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            This information will be visible to patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  placeholder="Dr. John Doe"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">BMDC / License Number</Label>
                <Input
                  id="license_number"
                  placeholder="A-12345"
                  value={formData.license_number}
                  onChange={(e) => handleChange("license_number", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleChange("specialty", value)}
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  placeholder="MBBS, MD"
                  value={formData.qualification}
                  onChange={(e) => handleChange("qualification", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="70"
                  placeholder="5"
                  value={formData.experience_years}
                  onChange={(e) => handleChange("experience_years", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultation_fee">Consultation Fee (৳)</Label>
                <Input
                  id="consultation_fee"
                  type="number"
                  min="0"
                  placeholder="500"
                  value={formData.consultation_fee}
                  onChange={(e) => handleChange("consultation_fee", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+880 1XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio / About</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell patients about yourself, your experience, and expertise..."
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateProfile.isPending || !formData.full_name}
            >
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfilePage;
