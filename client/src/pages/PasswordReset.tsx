import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PasswordReset() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verify token on mount if present
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      await trpc.passwordReset.verifyToken.useQuery({ token });
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Invalid or expired reset token");
      setStep("request");
    } finally {
      setIsLoading(false);
    }
  };

  const requestResetMutation = trpc.passwordReset.requestReset.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("Check your email for password reset instructions");
      setTimeout(() => navigate("/"), 3000);
    },
    onError: (err) => {
      setError(err.message || "Failed to request password reset");
    },
  });

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await requestResetMutation.mutateAsync({ email });
  };

  const resetPasswordMutation = trpc.passwordReset.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("Password reset successfully");
      setTimeout(() => navigate("/"), 3000);
    },
    onError: (err) => {
      setError(err.message || "Failed to reset password");
    },
  });

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    await resetPasswordMutation.mutateAsync({
      token,
      newPassword,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {step === "request"
                ? "Enter your email to receive a password reset link"
                : "Create a new password for your account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <p className="text-center text-foreground">
                  Your password has been reset successfully. Redirecting you to home...
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {step === "request" ? (
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@misjusticealliance.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={requestResetMutation.isPending || !email}
                      className="w-full"
                    >
                      {requestResetMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      Remember your password?{" "}
                      <a href="/" className="text-primary hover:underline">
                        Back to home
                      </a>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={resetPasswordMutation.isPending || !newPassword || !confirmPassword}
                      className="w-full"
                    >
                      {resetPasswordMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
