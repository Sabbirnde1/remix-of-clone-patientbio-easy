import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Copy, Mail, Check, Loader2, ExternalLink, Building2, User, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DoctorConnection } from "@/hooks/useDoctorConnections";
import { useAccessTokens } from "@/hooks/useAccessTokens";
import { useDoctorShareHistory } from "@/hooks/useDoctorShareHistory";
import { useHospitalDoctors, HospitalDoctor } from "@/hooks/useHospitalDoctors";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface ShareWithDoctorDialogProps {
  doctors: DoctorConnection[];
  doctorsLoading: boolean;
}

const EXPIRY_OPTIONS = [
  { value: "24", label: "24 hours" },
  { value: "168", label: "7 days" },
  { value: "720", label: "30 days" },
];

type DoctorType = "saved" | "hospital";

interface SelectedDoctor {
  type: DoctorType;
  id: string;
  userId?: string;
  name: string;
  email?: string | null;
  specialty?: string | null;
  hospitalName?: string;
}

const ShareWithDoctorDialog = ({ doctors, doctorsLoading }: ShareWithDoctorDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createToken, isCreating } = useAccessTokens();
  const { createShareHistory } = useDoctorShareHistory();
  const { data: hospitalDoctors, isLoading: hospitalDoctorsLoading } = useHospitalDoctors();
  
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DoctorType>("saved");
  const [selectedDoctor, setSelectedDoctor] = useState<SelectedDoctor | null>(null);
  const [expiryHours, setExpiryHours] = useState("168");
  const [customMessage, setCustomMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const resetDialog = () => {
    setSelectedDoctor(null);
    setExpiryHours("168");
    setCustomMessage("");
    setGeneratedLink(null);
    setCopied(false);
    setActiveTab("saved");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetDialog();
    }
  };

  const handleSelectSavedDoctor = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor({
        type: "saved",
        id: doctor.id,
        name: doctor.doctor_name,
        email: doctor.email,
        specialty: doctor.specialty,
      });
    }
  };

  const handleSelectHospitalDoctor = (staffId: string) => {
    const doctor = hospitalDoctors?.find((d) => d.id === staffId);
    if (doctor) {
      setSelectedDoctor({
        type: "hospital",
        id: doctor.id,
        userId: doctor.user_id,
        name: doctor.full_name,
        specialty: doctor.specialty,
        hospitalName: doctor.hospital_name,
      });
    }
  };

  const generateShareLink = async () => {
    if (!selectedDoctor || !user?.id) return;

    setIsGenerating(true);
    
    const label = selectedDoctor.type === "hospital" 
      ? `For Dr. ${selectedDoctor.name} (${selectedDoctor.hospitalName})`
      : `For ${selectedDoctor.name}`;
    
    createToken(
      {
        expiresInHours: parseInt(expiryHours),
        label,
      },
      {
        onSuccess: async (token) => {
          const shareUrl = `${window.location.origin}/share/${token.token}`;
          setGeneratedLink(shareUrl);
          
          // Record share history for saved doctors
          if (selectedDoctor.type === "saved") {
            await createShareHistory({
              doctor_id: selectedDoctor.id,
              token_id: token.id,
              notes: customMessage || undefined,
            });
          }
          
          // Create doctor_patient_access for hospital doctors
          if (selectedDoctor.type === "hospital" && selectedDoctor.userId) {
            try {
              // Use upsert to handle existing access records
              const { error } = await supabase
                .from("doctor_patient_access")
                .upsert({
                  doctor_id: selectedDoctor.userId,
                  patient_id: user.id,
                  access_token_id: token.id,
                  is_active: true,
                }, {
                  onConflict: "doctor_id,patient_id",
                });
              
              if (error) {
                console.error("Error creating doctor access:", error);
              } else {
                toast({
                  title: "Access Granted",
                  description: `Dr. ${selectedDoctor.name} can now view your records in their portal.`,
                });
              }
            } catch (err) {
              console.error("Error granting access:", err);
            }
          }
          
          setIsGenerating(false);
        },
        onError: () => {
          setIsGenerating(false);
        },
      }
    );
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({ title: "Link Copied!", description: "Share link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  const handleCopyMessage = async () => {
    if (!generatedLink || !selectedDoctor) return;
    
    const message = buildMessage();
    try {
      await navigator.clipboard.writeText(message);
      toast({ title: "Message Copied!", description: "Full message copied to clipboard." });
    } catch {
      toast({ title: "Failed to copy", description: "Please copy the message manually.", variant: "destructive" });
    }
  };

  const buildMessage = () => {
    if (!selectedDoctor || !generatedLink) return "";
    
    const expiryLabel = EXPIRY_OPTIONS.find((o) => o.value === expiryHours)?.label || "7 days";
    
    let message = `Dear Dr. ${selectedDoctor.name},\n\n`;
    message += `I'm sharing my health records with you through MedVault.\n\n`;
    if (customMessage) {
      message += `${customMessage}\n\n`;
    }
    message += `You can access my records using this secure link:\n${generatedLink}\n\n`;
    message += `This link will expire in ${expiryLabel}.\n\n`;
    message += `Best regards`;
    
    return message;
  };

  const handleSendEmail = () => {
    if (!selectedDoctor?.email || !generatedLink) return;
    
    const subject = encodeURIComponent("Shared Health Records - MedVault");
    const body = encodeURIComponent(buildMessage());
    
    window.open(`mailto:${selectedDoctor.email}?subject=${subject}&body=${body}`, "_blank");
  };

  const hasSavedDoctors = doctors.length > 0;
  const hasHospitalDoctors = (hospitalDoctors?.length || 0) > 0;
  const isLoading = doctorsLoading || hospitalDoctorsLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Share with Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share with Healthcare Provider</DialogTitle>
          <DialogDescription>
            Create a secure link to share your health records
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasSavedDoctors && !hasHospitalDoctors ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-muted-foreground">
              You haven't added any healthcare providers yet.
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/doctors">
                <ExternalLink className="mr-2 h-4 w-4" />
                Add a Doctor
              </Link>
            </Button>
          </div>
        ) : !generatedLink ? (
          <div className="space-y-4 py-2">
            {/* Doctor Type Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as DoctorType);
              setSelectedDoctor(null);
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="saved" className="gap-2">
                  <User className="h-4 w-4" />
                  My Doctors
                </TabsTrigger>
                <TabsTrigger value="hospital" className="gap-2" disabled={!hasHospitalDoctors}>
                  <Building2 className="h-4 w-4" />
                  Hospital
                </TabsTrigger>
              </TabsList>

              <TabsContent value="saved" className="mt-4 space-y-4">
                {hasSavedDoctors ? (
                  <div className="space-y-2">
                    <Label>Select Provider</Label>
                    <Select 
                      value={selectedDoctor?.type === "saved" ? selectedDoctor.id : ""} 
                      onValueChange={handleSelectSavedDoctor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.doctor_name}
                            {doctor.specialty && ` • ${doctor.specialty}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <p>No saved doctors yet</p>
                    <Button variant="link" size="sm" asChild>
                      <Link to="/dashboard/doctors">Add a doctor</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hospital" className="mt-4 space-y-4">
                {hasHospitalDoctors ? (
                  <div className="space-y-2">
                    <Label>Select Hospital Doctor</Label>
                    <Select 
                      value={selectedDoctor?.type === "hospital" ? selectedDoctor.id : ""} 
                      onValueChange={handleSelectHospitalDoctor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitalDoctors?.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={doctor.avatar_url || undefined} />
                                <AvatarFallback>
                                  <Stethoscope className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <span>Dr. {doctor.full_name}</span>
                              <span className="text-muted-foreground text-xs">
                                {doctor.hospital_name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Hospital doctors will also be able to view your records in their portal
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <p>No hospital doctors available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {selectedDoctor && (
              <>
                {/* Selected Doctor Info */}
                <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedDoctor.type === "hospital" ? "Dr. " : ""}
                      {selectedDoctor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDoctor.specialty || "Healthcare Provider"}
                      {selectedDoctor.hospitalName && ` • ${selectedDoctor.hospitalName}`}
                    </p>
                  </div>
                </div>

                {/* Expiry Selection */}
                <div className="space-y-2">
                  <Label htmlFor="expiry">Link expires in</Label>
                  <Select value={expiryHours} onValueChange={setExpiryHours}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal note..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                onClick={generateShareLink}
                disabled={!selectedDoctor || isCreating || isGenerating}
                className="w-full bg-gradient-to-r from-primary to-secondary border-0"
              >
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  "Generate Share Link"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Success State */}
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Link Created!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                For {selectedDoctor?.type === "hospital" ? "Dr. " : ""}{selectedDoctor?.name}
              </p>
              {selectedDoctor?.type === "hospital" && (
                <p className="text-xs text-primary mb-3">
                  ✓ Doctor can now see you in their patient portal
                </p>
              )}
              <div className="bg-background border rounded-md p-2 text-xs font-mono break-all">
                {generatedLink}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? (
                  <><Check className="mr-2 h-4 w-4 text-primary" /> Copied</>
                ) : (
                  <><Copy className="mr-2 h-4 w-4" /> Copy Link</>
                )}
              </Button>
              <Button variant="outline" onClick={handleCopyMessage}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Message
              </Button>
            </div>

            {selectedDoctor?.email && (
              <Button onClick={handleSendEmail} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Send Email to {selectedDoctor.name}
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={resetDialog}
            >
              Share with Another Doctor
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareWithDoctorDialog;
