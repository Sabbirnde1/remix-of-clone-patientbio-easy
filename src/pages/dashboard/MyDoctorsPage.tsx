import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Edit, Trash2, Phone, Mail, Building2, Stethoscope, Loader2, ShieldCheck, Clock, XCircle } from "lucide-react";
import { useDoctorConnections, DoctorConnection } from "@/hooks/useDoctorConnections";
import { usePatientDoctorAccess } from "@/hooks/usePatientDoctorAccess";
import { format, formatDistanceToNow } from "date-fns";

interface DoctorFormData {
  doctor_name: string;
  specialty: string;
  hospital_clinic: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyFormData: DoctorFormData = {
  doctor_name: "",
  specialty: "",
  hospital_clinic: "",
  phone: "",
  email: "",
  notes: "",
};

const MyDoctorsPage = () => {
  const { doctors, isLoading, createDoctor, isCreating, updateDoctor, isUpdating, deleteDoctor, isDeleting } = useDoctorConnections();
  const { accessRecords, isLoading: accessLoading, revokeAccess, isRevoking } = usePatientDoctorAccess();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorConnection | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>(emptyFormData);

  const handleOpenAdd = () => {
    setFormData(emptyFormData);
    setEditingDoctor(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (doctor: DoctorConnection) => {
    setFormData({
      doctor_name: doctor.doctor_name,
      specialty: doctor.specialty || "",
      hospital_clinic: doctor.hospital_clinic || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
      notes: doctor.notes || "",
    });
    setEditingDoctor(doctor);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingDoctor(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctor_name.trim()) return;

    if (editingDoctor) {
      updateDoctor(
        { id: editingDoctor.id, ...formData },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createDoctor(formData, { onSuccess: handleCloseDialog });
    }
  };

  const handleInputChange = (field: keyof DoctorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading || accessLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hospital Doctors with Access */}
      {accessRecords.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Doctors with Portal Access
            </CardTitle>
            <CardDescription>
              These doctors can view your health records in their hospital portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accessRecords.map((access) => (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={access.doctor_profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        Dr. {access.doctor_profile?.full_name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {access.doctor_profile?.specialty && (
                          <span>{access.doctor_profile.specialty}</span>
                        )}
                        {access.hospital_name && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {access.hospital_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-muted-foreground hidden sm:block">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Granted {formatDistanceToNow(new Date(access.granted_at), { addSuffix: true })}
                      </div>
                      {access.last_accessed_at && (
                        <div>
                          Last viewed {formatDistanceToNow(new Date(access.last_accessed_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <XCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Revoke</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Doctor Access</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dr. {access.doctor_profile?.full_name} will no longer be able to view your health records in their portal. You can always grant access again later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => revokeAccess(access.id)}
                            disabled={isRevoking}
                          >
                            Revoke Access
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Doctors */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                My Doctors
              </CardTitle>
              <CardDescription>
                Healthcare providers connected to your account ({doctors.length})
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-primary to-secondary border-0 w-full sm:w-auto">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingDoctor
                        ? "Update the provider's information"
                        : "Add a healthcare provider to your list"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor_name">Doctor Name *</Label>
                      <Input
                        id="doctor_name"
                        placeholder="e.g., Dr. Jane Smith"
                        value={formData.doctor_name}
                        onChange={(e) => handleInputChange("doctor_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input
                          id="specialty"
                          placeholder="e.g., Cardiology"
                          value={formData.specialty}
                          onChange={(e) => handleInputChange("specialty", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hospital_clinic">Hospital/Clinic</Label>
                        <Input
                          id="hospital_clinic"
                          placeholder="e.g., City Hospital"
                          value={formData.hospital_clinic}
                          onChange={(e) => handleInputChange("hospital_clinic", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="doctor@clinic.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional notes about this provider..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating || isUpdating || !formData.doctor_name.trim()}>
                      {isCreating || isUpdating ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                      ) : editingDoctor ? (
                        "Update"
                      ) : (
                        "Add Doctor"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No saved providers</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Add your healthcare providers to keep track of who has access to your health data and share records with them easily.
              </p>
              <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-primary to-secondary border-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Your First Doctor
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{doctor.doctor_name}</h4>
                          {doctor.specialty && (
                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(doctor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Doctor</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {doctor.doctor_name} from your list? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteDoctor(doctor.id)}
                                disabled={isDeleting}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm">
                      {doctor.hospital_clinic && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="truncate">{doctor.hospital_clinic}</span>
                        </div>
                      )}
                      {doctor.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${doctor.phone}`} className="hover:text-primary truncate">
                            {doctor.phone}
                          </a>
                        </div>
                      )}
                      {doctor.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${doctor.email}`} className="hover:text-primary truncate">
                            {doctor.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {doctor.notes && (
                      <p className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded p-2 line-clamp-2">
                        {doctor.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyDoctorsPage;
