import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function ExportStatisticsButton() {
  const generateReport = trpc.pdfExport.generateStatisticsReport.useMutation({
    onSuccess: (data) => {
      // Decode base64 and create blob
      const binaryString = atob(data.buffer);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Statistics report downloaded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate statistics report");
    },
  });

  return (
    <Button
      onClick={() =>
        generateReport.mutate({
          includeSubmissions: true,
          includeUpdates: true,
          includeFiles: true,
          includeProfiles: true,
          includeActivity: true,
        })
      }
      disabled={generateReport.isPending}
      variant="outline"
      size="sm"
    >
      {generateReport.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export as PDF
        </>
      )}
    </Button>
  );
}
