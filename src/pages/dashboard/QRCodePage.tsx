import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const QRCodePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate patient ID from user UUID
  const patientId = user?.id?.substring(0, 8).toUpperCase() || "N/A";
  const qrValue = `patientbio:${patientId}`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(patientId);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Patient ID copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the ID manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById("patient-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 512, 512);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `PatientBio-QR-${patientId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        toast({
          title: "Downloaded!",
          description: "QR code saved as PNG.",
        });
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Patient Bio QR Code",
          text: `My Patient ID: ${patientId}`,
        });
        toast({
          title: "Shared!",
          description: "Patient ID shared successfully.",
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== "AbortError") {
          handleCopyId();
        }
      }
    } else {
      // Fallback to copy
      handleCopyId();
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            My QR Code
          </CardTitle>
          <CardDescription>
            Your personal QR code for quick identification
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {/* QR Code Display */}
          <div className="w-64 h-64 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 p-4">
            <QRCodeSVG
              id="patient-qr-code"
              value={qrValue}
              size={224}
              level="H"
              bgColor="#ffffff"
              fgColor="#1f2937"
            />
          </div>
          
          <p className="text-sm text-muted-foreground text-center mb-4">
            Scan this code for instant identification
          </p>

          {/* Patient ID */}
          <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-3 mb-6">
            <span className="font-mono font-bold text-lg">{patientId}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyId}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-secondary border-0" 
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How to use your QR code</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Show this QR code to healthcare providers for quick access</li>
            <li>• Emergency responders can scan to view critical health info</li>
            <li>• You control what information is shared</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodePage;
