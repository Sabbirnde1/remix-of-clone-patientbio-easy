import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";

const ShareDataPage = () => {
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

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Your Data
          </CardTitle>
          <CardDescription>
            Share your health records securely with healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient ID Section */}
          <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Patient ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-bold tracking-wider">
                {patientId}
              </span>
              <Button
                variant="outline"
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
            <p className="text-xs text-muted-foreground mt-2">
              Share this ID with your healthcare provider
            </p>
          </div>

          {/* QR Code Section */}
          <div className="border border-border rounded-xl p-6 text-center">
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 p-2 shadow-sm">
              <QRCodeSVG
                value={qrValue}
                size={112}
                level="H"
                bgColor="#ffffff"
                fgColor="#1f2937"
              />
            </div>
            <h3 className="font-semibold mb-2">QR Code Sharing</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Scan to share your patient info instantly
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/qr-code">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Full Size
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Your data is encrypted and only accessible to providers you authorize.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareDataPage;
