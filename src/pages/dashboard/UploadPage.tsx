import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileImage, FileText } from "lucide-react";

const UploadPage = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Health Record
          </CardTitle>
          <CardDescription>
            Upload prescriptions, lab results, and other medical documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upload area placeholder */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Drop files here or click to upload</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JPEG, PNG, GIF, WebP, and PDF files up to 10MB
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileImage className="h-4 w-4" /> Images
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> Documents
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Full upload functionality coming soon. Your files will be securely stored and encrypted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
