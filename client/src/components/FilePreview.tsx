import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, X, ZoomIn, ZoomOut } from "lucide-react";

interface FilePreviewProps {
  fileId: number;
  filename: string;
  fileType: string;
  mimeType: string;
  onClose?: () => void;
}

export function FilePreview({ fileId, filename, fileType, mimeType, onClose }: FilePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);

  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf";
  const isText = mimeType.startsWith("text/");
  const isDocument = mimeType.includes("word") || mimeType.includes("document");

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>File Preview</CardTitle>
          <CardDescription>{filename}</CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {(isImage || isPdf) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Preview Content */}
        <div className="border rounded-lg bg-muted/50 overflow-auto max-h-96">
          {isImage ? (
            <div className="flex items-center justify-center p-4">
              <img
                src={`/api/files/${fileId}/preview`}
                alt={filename}
                style={{ maxWidth: "100%", height: "auto", transform: `scale(${zoom / 100})` }}
                onLoad={() => setIsLoading(false)}
                className="transition-transform"
              />
            </div>
          ) : isPdf ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">PDF preview requires external viewer</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : isText ? (
            <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words text-foreground">
              {/* Text content would be loaded here */}
              [Text file content preview]
            </pre>
          ) : isDocument ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Document preview not available</p>
                <p className="text-xs text-muted-foreground mt-1">Please download to view</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download Document
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Preview not available for this file type</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
          <p>File Type: {fileType.toUpperCase()}</p>
          <p>MIME Type: {mimeType}</p>
        </div>
      </CardContent>
    </Card>
  );
}
