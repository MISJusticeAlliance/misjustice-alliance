import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast as sonnerToast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Edit2, Save, X, Trash2, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  // Use sonner toast instead
  const toast = (props: any) => {
    if (props.variant === "destructive") {
      sonnerToast.error(props.description, { description: props.title });
    } else {
      sonnerToast.success(props.description, { description: props.title });
    }
  };
  const [, navigate] = useLocation();

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  // Queries
  const profileQuery = trpc.profile.getProfile.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  const preferencesQuery = trpc.profile.getPreferences.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  const tokensQuery = trpc.profile.getRememberMeTokens.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  // Mutations
  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      sonnerToast.success("Profile updated successfully");
      setIsEditing(false);
      profileQuery.refetch();
    },
    onError: (error) => {
      sonnerToast.error(error.message || "Failed to update profile");
    },
  });

  const revokeTokenMutation = trpc.profile.revokeRememberMeToken.useMutation({
    onSuccess: () => {
      sonnerToast.success("Device removed successfully");
      tokensQuery.refetch();
    },
    onError: (error) => {
      sonnerToast.error(error.message || "Failed to remove device");
    },
  });

  const revokeAllTokensMutation = trpc.profile.revokeAllRememberMeTokens.useMutation({
    onSuccess: () => {
      sonnerToast.success("All devices have been signed out");
      tokensQuery.refetch();
    },
    onError: (error) => {
      sonnerToast.error(error.message || "Failed to sign out all devices");
    },
  });

  // Initialize form data
  useEffect(() => {
    if (profileQuery.data) {
      setFormData({
        name: profileQuery.data.name || "",
        email: profileQuery.data.email || "",
      });
    }
  }, [profileQuery.data]);

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRevokeToken = (tokenId: number) => {
    revokeTokenMutation.mutate({ tokenId });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Account Type</Label>
                        <div className="mt-1 p-3 bg-muted rounded-md text-foreground capitalize">
                          {profileQuery.data?.role || "User"}
                        </div>
                      </div>

                      <div>
                        <Label>Member Since</Label>
                        <div className="mt-1 p-3 bg-muted rounded-md text-foreground">
                          {profileQuery.data?.createdAt
                            ? new Date(profileQuery.data.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="default"
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                            className="gap-2"
                          >
                            {updateProfileMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => {
                              setIsEditing(false);
                              if (profileQuery.data) {
                                setFormData({
                                  name: profileQuery.data.name || "",
                                  email: profileQuery.data.email || "",
                                });
                              }
                            }}
                            variant="outline"
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive updates</CardDescription>
              </CardHeader>
              <CardContent>
                {preferencesQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Notification preferences are coming soon. You will be able to customize
                      how you receive updates about your cases and system alerts.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Devices</CardTitle>
                <CardDescription>Manage devices where you are signed in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tokensQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : tokensQuery.data && tokensQuery.data.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {tokensQuery.data.map((token) => (
                        <div
                          key={token.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{token.deviceName}</p>
                            <p className="text-sm text-muted-foreground">
                              IP: {token.ipAddress || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last used:{" "}
                              {token.lastUsedAt
                                ? new Date(token.lastUsedAt).toLocaleDateString()
                                : "Never"}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleRevokeToken(token.id)}
                            disabled={revokeTokenMutation.isPending}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>

                    {tokensQuery.data.length > 1 && (
                      <div className="pt-4 border-t border-border">
                        <Button
                          onClick={() => revokeAllTokensMutation.mutate()}
                          disabled={revokeAllTokensMutation.isPending}
                          variant="outline"
                          className="w-full"
                        >
                          {revokeAllTokensMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Sign Out All Devices
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No active devices. You will see devices here when you use the "Remember Me"
                    feature.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
