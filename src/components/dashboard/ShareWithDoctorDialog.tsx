import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Copy, Mail, Check, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DoctorConnection } from "@/hooks/useDoctorConnections";
import { useAccessTokens } from "@/hooks/useAccessTokens";
import { useDoctorShareHistory } from "@/hooks/useDoctorShareHistory";
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

const ShareWithDoctorDialog = ({ doctors, doctorsLoading }: ShareWithDoctorDialogProps) => {
  const { toast } = useToast();
  const { createToken, isCreating } = useAccessTokens();
  const { createShareHistory } = useDoctorShareHistory();
  
  const [open, setOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [expiryHours, setExpiryHours] = useState("168");
  const [customMessage, setCustomMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedTokenId, setGeneratedTokenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const resetDialog = () => {
    setSelectedDoctorId("");
    setExpiryHours("168");
    setCustomMessage("");
    setGeneratedLink(null);
    setGeneratedTokenId(null);
    setCopied(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetDialog();
    }
  };

  const generateShareLink = async () => {
    if (!selectedDoctor) return;

    setIsGenerating(true);
    
    const label = `For ${selectedDoctor.doctor_name}`;
    
    // Create the token using the hook's mutation
    createToken(
      {
        expiresInHours: parseInt(expiryHours),
        label,
      },
      {
        onSuccess: async (token) => {
          const shareUrl = `${window.location.origin}/share/${token.token}`;
          setGeneratedLink(shareUrl);
          setGeneratedTokenId(token.id);
          
          // Record the share in history
          await createShareHistory({
            doctor_id: selectedDoctor.id,
            token_id: token.id,
            notes: customMessage || undefined,
          });
          
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
    
    let message = `Dear ${selectedDoctor.doctor_name},\n\n`;
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

  const hasDoctors = doctors.length > 0;

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
            Create a secure link to share your health records with a saved provider
          </DialogDescription>
        </DialogHeader>

        {doctorsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasDoctors ? (
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
            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Provider</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
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
                placeholder="Add a personal note to include in your message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                onClick={generateShareLink}
                disabled={!selectedDoctorId || isCreating || isGenerating}
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
                For {selectedDoctor?.doctor_name}
              </p>
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
                Send Email to {selectedDoctor.doctor_name}
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
