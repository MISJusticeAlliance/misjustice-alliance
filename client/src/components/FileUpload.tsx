import { useState, useRef } from "react";
import { Upload, X, File, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxSize?: number; // in bytes
  maxFiles?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

interface FileItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function FileUpload({
  onFilesSelected,
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  acceptedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`,
      };
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileItem[] = [];
    const validFiles: File[] = [];

    // Check max files limit
    if (files.length + fileList.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);

      if (validation.valid) {
        newFiles.push({
          file,
          progress: 0,
          status: "pending",
        });
        validFiles.push(file);
      } else {
        newFiles.push({
          file,
          progress: 0,
          status: "error",
          error: validation.error,
        });
      }
    }

    setFiles([...files, ...newFiles]);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎬";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    return "📎";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          accept={acceptedTypes.join(",")}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground">
              Drag and drop files here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select files
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-foreground mb-3">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-xl flex-shrink-0">
                    {getFileIcon(item.file.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {item.status === "pending" && (
                    <div className="text-xs text-muted-foreground">Pending</div>
                  )}
                  {item.status === "uploading" && (
                    <div className="w-20">
                      <Progress value={item.progress} className="h-1" />
                    </div>
                  )}
                  {item.status === "success" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {item.status === "error" && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span
                        className="text-xs text-red-600 cursor-help"
                        title={item.error}
                      >
                        Error
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={item.status === "uploading"}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        Supported formats: PDF, Word documents, images (JPG, PNG), and other legal documents.
        Files are encrypted and securely stored.
      </p>
    </div>
  );
}
