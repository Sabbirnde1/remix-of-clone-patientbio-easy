import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Share2, QrCode, Copy, Stethoscope } from "lucide-react";

const DoctorQRCodePage = () => {
  const { user } = useAuth();
  const { data: profile } = useDoctorProfile();
  const qrRef = useRef<HTMLDivElement>(null);

  const doctorId = user?.id?.substring(0, 8).toUpperCase() || "--------";
  const qrValue = `patientbio:doctor:${doctorId}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 400);
      }

      const link = document.createElement("a");
      link.download = `doctor-qr-${doctorId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR Code downloaded!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShare = async () => {
    const shareText = `Connect with Dr. ${profile?.full_name || "Doctor"} on PatientBio!\n\nDoctor ID: ${doctorId}\n\nScan the QR code or enter this ID in the app to connect.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Connect with your Doctor",
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(doctorId);
    toast.success("Doctor ID copied to clipboard!");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">My QR Code</h1>
        <p className="text-muted-foreground">
          Patients can scan this to connect with you
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5" />
            Doctor QR Code
          </CardTitle>
          <CardDescription>
            Share this with patients to grant them access
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {/* QR Code */}
          <div
            ref={qrRef}
            className="bg-white p-6 rounded-xl shadow-inner mb-6"
          >
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "",
                height: 0,
                width: 0,
                excavate: false,
              }}
            />
          </div>

          {/* Doctor Info */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">
                {profile?.full_name || "Doctor"}
              </span>
            </div>
            {profile?.specialty && (
              <p className="text-muted-foreground text-sm">
                {profile.specialty}
              </p>
            )}
            <div className="mt-3 flex items-center justify-center gap-2">
              <code className="bg-muted px-3 py-1 rounded-md text-lg font-mono font-bold">
                {doctorId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyId}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
              1
            </span>
            <p>Patient opens their PatientBio app</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
              2
            </span>
            <p>They scan your QR code or enter your Doctor ID</p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
              3
            </span>
            <p>You get access to view their health data and prescribe</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorQRCodePage;
