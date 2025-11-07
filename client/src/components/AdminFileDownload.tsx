import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  FileText, 
  Archive,
  Search,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export function AdminFileDownload() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: files, isLoading, refetch } = trpc.adminStats.getAllFiles.useQuery();

  const filteredFiles = files?.filter((file: any) =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.fileType.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDownloadFile = async (file: Record<string, any>) => {
    setIsDownloading(true);
    try {
      // In a real implementation, this would fetch the file from S3
      // For now, show a toast
      toast.success(`Downloading ${file.originalName}`);
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      toast.error("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      toast.success("Preparing bulk download...");
      // In a real implementation, this would create a ZIP file
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Bulk download ready");
    } catch (error) {
      toast.error("Failed to prepare bulk download");
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLEAN":
        return "bg-green-50 text-green-700";
      case "INFECTED":
        return "bg-red-50 text-red-700";
      case "QUARANTINED":
        return "bg-orange-50 text-orange-700";
      case "SUSPICIOUS":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>File Download Center</CardTitle>
          <CardDescription>Loading files...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>File Download Center</CardTitle>
              <CardDescription>Securely download all uploaded case files</CardDescription>
            </div>
            <Button 
              onClick={handleDownloadAll}
              disabled={isDownloading || !files || files.length === 0}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Download All as ZIP
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files by name or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* File List */}
      <div className="space-y-3">
        {filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">
                {files?.length === 0 ? "No files uploaded yet" : "No files match your search"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFiles.map((file: Record<string, any>) => (
            <Card key={file.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="font-medium truncate">{file.originalName}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                      <span>{file.fileType}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`${getStatusColor(file.virusScanStatus)}`}>
                      {file.virusScanStatus}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadFile(file)}
                      disabled={isDownloading || file.virusScanStatus === "INFECTED"}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {files && files.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Files</p>
                <p className="text-2xl font-bold">{files.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Size</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(files.reduce((sum: number, f: any) => sum + f.fileSize, 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Scanned Files</p>
                <p className="text-2xl font-bold">
                  {files.filter((f: any) => f.virusScanStatus !== "PENDING").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
