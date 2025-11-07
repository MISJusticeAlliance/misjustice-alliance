import { useState } from "react";
import { Download, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  description?: string;
  createdAt: Date;
  downloadCount: number;
}

interface FileAttachmentsListProps {
  caseId: string;
  attachments: Attachment[];
  onDelete?: (attachmentId: number) => void;
  showDelete?: boolean;
}

export default function FileAttachmentsList({
  caseId,
  attachments,
  onDelete,
  showDelete = false,
}: FileAttachmentsListProps) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const deleteAttachmentMutation = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      toast.success("Attachment deleted successfully");
      if (onDelete) onDelete(deletingId!);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete attachment");
    },
  });

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

  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadMutation = trpc.attachments.getDownloadUrl.useQuery(
    { attachmentId: -1 },
    { enabled: false }
  );

  const handleDownload = async (attachment: Attachment) => {
    setDownloadingId(attachment.id);
    try {
      const result = await downloadMutation.refetch();
      if (!result.data) {
        throw new Error("Failed to get download URL");
      }

      const link = document.createElement("a");
      link.href = result.data.downloadUrl;
      link.download = result.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("File downloaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    setDeletingId(attachmentId);
    try {
      await deleteAttachmentMutation.mutateAsync({ attachmentId });
    } finally {
      setDeletingId(null);
    }
  };

  if (attachments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No attachments yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-medium text-foreground mb-4">
        Attachments ({attachments.length})
      </h3>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">
                {getFileIcon(attachment.mimeType)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {attachment.fileName}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(attachment.fileSize)}</span>
                  <span>•</span>
                  <span>{formatDate(attachment.createdAt)}</span>
                  {attachment.downloadCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{attachment.downloadCount} downloads</span>
                    </>
                  )}
                </div>
                {attachment.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {attachment.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment)}
                disabled={downloadingId === attachment.id}
                className="h-8 w-8 p-0"
                title="Download file"
              >
                {downloadingId === attachment.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>

              {showDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deletingId === attachment.id}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete attachment"
                >
                  {deletingId === attachment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
