import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, AlertTriangle, Trash2, MessageSquare } from "lucide-react";

interface FileApprovalWorkflowProps {
  fileId: number;
  filename: string;
  currentStatus: string;
  virusScanStatus: string;
  onApprove?: (notes: string) => void;
  onReject?: (reason: string) => void;
  onQuarantine?: (reason: string) => void;
  isLoading?: boolean;
}

export function FileApprovalWorkflow({
  fileId,
  filename,
  currentStatus,
  virusScanStatus,
  onApprove,
  onReject,
  onQuarantine,
  isLoading = false,
}: FileApprovalWorkflowProps) {
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [quarantineReason, setQuarantineReason] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showQuarantineDialog, setShowQuarantineDialog] = useState(false);

  const isAlreadyApproved = currentStatus === "CLEAN" || currentStatus === "ARCHIVED";
  const isSuspicious = virusScanStatus === "SUSPICIOUS" || virusScanStatus === "INFECTED";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Workflow</CardTitle>
        <CardDescription>Review and approve file for case processing</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Current Status</p>
          <div className="flex items-center gap-2">
            {currentStatus === "CLEAN" && (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-600">Approved</Badge>
              </>
            )}
            {currentStatus === "PROCESSING" && (
              <>
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <Badge className="bg-blue-600">Processing</Badge>
              </>
            )}
            {currentStatus === "SUSPICIOUS" && (
              <>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <Badge className="bg-orange-600">Requires Review</Badge>
              </>
            )}
            {currentStatus === "INFECTED" && (
              <>
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <Badge className="bg-red-600">Quarantined</Badge>
              </>
            )}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            File Category
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EVIDENCE">Evidence</SelectItem>
              <SelectItem value="CORRESPONDENCE">Correspondence</SelectItem>
              <SelectItem value="LEGAL_DOCUMENTS">Legal Documents</SelectItem>
              <SelectItem value="WITNESS_STATEMENTS">Witness Statements</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Virus Scan Warning */}
        {isSuspicious && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Suspicious File Detected</p>
                <p className="text-sm text-orange-800 mt-1">
                  This file has been flagged by the virus scanner. Please review carefully before approving.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approval Notes */}
        {!isAlreadyApproved && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Approval Notes (Optional)
            </label>
            <Textarea
              placeholder="Add notes about this file approval..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="min-h-24"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t">
          {!isAlreadyApproved ? (
            <>
              <Button
                className="w-full"
                onClick={() => setShowApproveDialog(true)}
                disabled={isLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve File
              </Button>

              {isSuspicious && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowApproveDialog(true)}
                  disabled={isLoading}
                >
                  Approve Anyway
                </Button>
              )}

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowRejectDialog(true)}
                disabled={isLoading}
              >
                Reject File
              </Button>

              {isSuspicious && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowQuarantineDialog(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Quarantine
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">File Already Approved</p>
              <p className="text-sm">This file has been processed and approved.</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve File?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve "{filename}"? This file will be marked as clean and
              available for case processing.
              {isSuspicious && (
                <p className="mt-2 font-medium text-orange-600">
                  ⚠️ Warning: This file was flagged as suspicious. Review carefully.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onApprove?.(approvalNotes);
              setShowApproveDialog(false);
            }}
          >
            Approve
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject File?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this file. The submitter will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-24"
          />
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onReject?.(rejectionReason);
                setShowRejectDialog(false);
              }}
            >
              Reject
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quarantine Dialog */}
      <AlertDialog open={showQuarantineDialog} onOpenChange={setShowQuarantineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quarantine File?</AlertDialogTitle>
            <AlertDialogDescription>
              This file will be isolated and removed from case processing. Provide a reason for
              quarantine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for quarantine..."
            value={quarantineReason}
            onChange={(e) => setQuarantineReason(e.target.value)}
            className="min-h-24"
          />
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onQuarantine?.(quarantineReason);
                setShowQuarantineDialog(false);
              }}
            >
              Quarantine
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
