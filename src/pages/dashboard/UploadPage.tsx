import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, FileImage, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { useHealthRecords } from "@/hooks/useHealthRecords";
import { Constants } from "@/integrations/supabase/types";

const UploadPage = () => {
  const { createRecord, isCreating, uploadProgress } = useHealthRecords();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("prescription");
  const [diseaseCategory, setDiseaseCategory] = useState<string>("general");
  const [providerName, setProviderName] = useState("");
  const [recordDate, setRecordDate] = useState("");

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title.trim()) return;

    createRecord(
      {
        file: selectedFile,
        metadata: {
          title: title.trim(),
          description: description.trim() || null,
          category: category as "prescription" | "lab_result" | "imaging" | "vaccination" | "other",
          disease_category: diseaseCategory as "general" | "cancer" | "covid19" | "diabetes" | "heart_disease" | "other",
          provider_name: providerName.trim() || null,
          record_date: recordDate || null,
        },
      },
      {
        onSuccess: () => {
          // Reset form
          setSelectedFile(null);
          setPreview(null);
          setTitle("");
          setDescription("");
          setCategory("prescription");
          setDiseaseCategory("general");
          setProviderName("");
          setRecordDate("");
        },
      }
    );
  };

  const recordCategories = Constants.public.Enums.record_category;
  const diseaseCategories = Constants.public.Enums.disease_category;

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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : selectedFile
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                onChange={handleInputChange}
              />
              
              {selectedFile ? (
                <div className="space-y-4">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                      <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Upload progress */}
            {isCreating && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Blood Test Results - January 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Record Type</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disease-category">Disease Category</Label>
                  <Select value={diseaseCategory} onValueChange={setDiseaseCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {diseaseCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "covid19" ? "COVID-19" : cat.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider/Doctor Name</Label>
                  <Input
                    id="provider"
                    placeholder="e.g., Dr. Smith"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="record-date">Record Date</Label>
                  <Input
                    id="record-date"
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Notes (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional notes about this record..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary border-0"
              disabled={!selectedFile || !title.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Record
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
