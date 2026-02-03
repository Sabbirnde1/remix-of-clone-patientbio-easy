import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const QRCodePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate patient ID from user UUID
  const patientId = user?.id?.substring(0, 8).toUpperCase() || "N/A";

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
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl flex items-center justify-center">
              <QrCode className="h-32 w-32 text-primary/30" />
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground text-center mb-4">
            QR code generation coming soon
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
            <Button variant="outline" className="flex-1" disabled>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-primary to-secondary border-0" disabled>
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
