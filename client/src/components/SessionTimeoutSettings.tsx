import { useState, useEffect } from 'react';
import { useSessionTimeout } from '@/_core/hooks/useSessionTimeout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function SessionTimeoutSettings() {
  const { getTimeoutMinutes, setTimeoutMinutes } = useSessionTimeout();
  const [timeoutMinutes, setTimeoutMinutes_Local] = useState<number>(60);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTimeoutMinutes_Local(getTimeoutMinutes());
  }, [getTimeoutMinutes]);

  const handleSave = async () => {
    if (timeoutMinutes < 5) {
      toast.error('Session timeout must be at least 5 minutes');
      return;
    }

    if (timeoutMinutes > 480) {
      toast.error('Session timeout cannot exceed 8 hours');
      return;
    }

    setIsSaving(true);
    try {
      setTimeoutMinutes(timeoutMinutes);
      toast.success(`Session timeout updated to ${timeoutMinutes} minutes`);
    } catch (error) {
      toast.error('Failed to update session timeout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTimeoutMinutes_Local(60);
    setTimeoutMinutes(60);
    toast.success('Session timeout reset to 60 minutes');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Session Timeout Settings</CardTitle>
            <CardDescription>
              Configure how long admin sessions remain active before automatic logout
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Inactivity Timeout</p>
            <p>Sessions will automatically log out after the specified period of inactivity. A warning will appear 5 minutes before logout.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="timeout-minutes" className="text-base font-medium">
              Session Timeout (minutes)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Range: 5 - 480 minutes (8 hours)
            </p>
            <Input
              id="timeout-minutes"
              type="number"
              min="5"
              max="480"
              value={timeoutMinutes}
              onChange={(e) => setTimeoutMinutes_Local(Math.max(5, Math.min(480, parseInt(e.target.value) || 60)))}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Current setting: {timeoutMinutes} minutes ({Math.floor(timeoutMinutes / 60)} hours {timeoutMinutes % 60} minutes)
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
            >
              Reset to Default
            </Button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Note:</span> The warning notification will appear {Math.max(5, Math.min(timeoutMinutes - 5, 5))} minutes before your session expires.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
