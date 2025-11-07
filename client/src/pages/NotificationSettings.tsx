import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

export default function NotificationSettings() {
  const { loading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const { data: preferences, isLoading, refetch } = trpc.notifications.getPreferences.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });

  useEffect(() => {
    document.title = "Notification Settings - MISJustice Alliance";
  }, []);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleToggle = (key: string, value: boolean) => {
    updateMutation.mutate({ [key]: value } as any);
  };

  const handleSelectChange = (key: string, value: string) => {
    updateMutation.mutate({ [key]: value } as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notification Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage how and when you receive notifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Control when you receive email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Enable Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.emailNotificationsEnabled || false}
                    onCheckedChange={(value) =>
                      handleToggle("emailNotificationsEnabled", value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>

                {preferences?.emailNotificationsEnabled && (
                  <>
                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Case Updates</p>
                          <p className="text-sm text-muted-foreground">
                            Email when your case has updates
                          </p>
                        </div>
                        <Switch
                          checked={preferences?.emailOnCaseUpdate || false}
                          onCheckedChange={(value) =>
                            handleToggle("emailOnCaseUpdate", value)
                          }
                          disabled={updateMutation.isPending}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Messages</p>
                          <p className="text-sm text-muted-foreground">
                            Email when you receive new messages
                          </p>
                        </div>
                        <Switch
                          checked={preferences?.emailOnMessage || false}
                          onCheckedChange={(value) =>
                            handleToggle("emailOnMessage", value)
                          }
                          disabled={updateMutation.isPending}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Profile Published</p>
                          <p className="text-sm text-muted-foreground">
                            Email when your case profile is published
                          </p>
                        </div>
                        <Switch
                          checked={preferences?.emailOnProfilePublished || false}
                          onCheckedChange={(value) =>
                            handleToggle("emailOnProfilePublished", value)
                          }
                          disabled={updateMutation.isPending}
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <label className="block text-sm font-semibold mb-2">
                          Email Digest Frequency
                        </label>
                        <Select
                          value={preferences?.emailDigestFrequency || "IMMEDIATE"}
                          onValueChange={(value) =>
                            handleSelectChange("emailDigestFrequency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                            <SelectItem value="DAILY">Daily Digest</SelectItem>
                            <SelectItem value="WEEKLY">Weekly Digest</SelectItem>
                            <SelectItem value="NEVER">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* In-App Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>In-App Notifications</CardTitle>
                <CardDescription>
                  Control notifications within the website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Enable In-App Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Show notifications while using the website
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.inAppNotificationsEnabled || false}
                    onCheckedChange={(value) =>
                      handleToggle("inAppNotificationsEnabled", value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Show Badge</p>
                    <p className="text-sm text-muted-foreground">
                      Display notification badge with unread count
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.showNotificationBadge || false}
                    onCheckedChange={(value) =>
                      handleToggle("showNotificationBadge", value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>
                  Control system and admin notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">System Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about platform updates
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.receiveSystemUpdates || false}
                    onCheckedChange={(value) =>
                      handleToggle("receiveSystemUpdates", value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Admin Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Receive important alerts from administrators
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.receiveAdminAlerts || false}
                    onCheckedChange={(value) =>
                      handleToggle("receiveAdminAlerts", value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and resources
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.receiveMarketingEmails || false}
                    onCheckedChange={(value) =>
                      handleToggle("receiveMarketingEmails", value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Do Not Disturb */}
            <Card>
              <CardHeader>
                <CardTitle>Do Not Disturb</CardTitle>
                <CardDescription>
                  Set quiet hours when you don't want notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Enable Do Not Disturb</p>
                    <p className="text-sm text-muted-foreground">
                      Pause notifications during specific hours
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.doNotDisturbEnabled || false}
                    onCheckedChange={(value) =>
                      handleToggle("doNotDisturbEnabled", value)
                    }
                    disabled={updateMutation.isPending}
                  />
                </div>

                {preferences?.doNotDisturbEnabled && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={preferences?.doNotDisturbStart || "22:00"}
                        onChange={(e) =>
                          handleSelectChange("doNotDisturbStart", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={preferences?.doNotDisturbEnd || "08:00"}
                        onChange={(e) =>
                          handleSelectChange("doNotDisturbEnd", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Customize your notification preferences to stay informed without being overwhelmed.
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Important case updates and admin alerts will still be sent even with notifications disabled.
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Changes are saved automatically as you adjust your preferences.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
