import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PublicizeCase() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    category: "",
    jurisdiction: "",
    allegedOrganizations: [] as string[],
    fullContent: "",
    newOrg: "",
  });

  const submitMutation = trpc.caseProfiles.submit.useMutation({
    onSuccess: (data) => {
      toast.success("Case profile submitted for review!");
      setStep(3);
      setTimeout(() => window.location.href = "/case-gallery", 3000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit case profile");
    },
  });

  const handleAddOrganization = () => {
    if (formData.newOrg.trim()) {
      setFormData({
        ...formData,
        allegedOrganizations: [...formData.allegedOrganizations, formData.newOrg.trim()],
        newOrg: "",
      });
    }
  };

  const handleRemoveOrganization = (index: number) => {
    setFormData({
      ...formData,
      allegedOrganizations: formData.allegedOrganizations.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.summary || !formData.category || !formData.jurisdiction || formData.allegedOrganizations.length === 0 || !formData.fullContent) {
      toast.error("Please fill in all required fields");
      return;
    }

    submitMutation.mutate({
      title: formData.title,
      summary: formData.summary,
      category: formData.category as any,
      jurisdiction: formData.jurisdiction as any,
      allegedOrganizations: formData.allegedOrganizations,
      fullContent: formData.fullContent,
    });
  };

  const isStep1Complete = formData.title && formData.summary && formData.category && formData.jurisdiction;
  const isStep2Complete = formData.allegedOrganizations.length > 0 && formData.fullContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/case-gallery">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Publicize Your Case</h1>
          <p className="text-lg text-muted-foreground">
            Share your case with the public to raise awareness. Your name will be redacted for privacy.
          </p>
        </div>

        {/* Success State */}
        {step === 3 && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <CardTitle>Case Profile Submitted Successfully!</CardTitle>
                  <CardDescription>
                    Your case profile has been submitted for review. Our team will verify the information and publish it within 2-3 business days.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You'll be redirected to the case gallery shortly...
              </p>
              <Button asChild>
                <Link href="/case-gallery">View All Cases</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {step !== 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      step === 1
                        ? "bg-primary text-primary-foreground"
                        : isStep1Complete
                        ? "bg-green-100 dark:bg-green-950 text-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    onClick={() => step > 1 && setStep(1)}
                  >
                    <p className="font-semibold">Step 1: Case Basics</p>
                    <p className="text-sm opacity-75">Title, category, jurisdiction</p>
                  </div>

                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      step === 2
                        ? "bg-primary text-primary-foreground"
                        : isStep2Complete
                        ? "bg-green-100 dark:bg-green-950 text-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    onClick={() => isStep1Complete && setStep(2)}
                  >
                    <p className="font-semibold">Step 2: Details</p>
                    <p className="text-sm opacity-75">Organizations, content</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted text-muted-foreground">
                    <p className="font-semibold">Step 3: Review</p>
                    <p className="text-sm opacity-75">Admin approval</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {/* Step 1: Case Basics */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Case Basics</CardTitle>
                    <CardDescription>
                      Provide basic information about your case
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Case Title *
                      </label>
                      <Input
                        placeholder="e.g., Police Misconduct During Arrest in Billings"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        A clear, descriptive title for your case
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Summary *
                      </label>
                      <Textarea
                        placeholder="Provide a brief overview of your case (50-1000 characters)"
                        value={formData.summary}
                        onChange={(e) =>
                          setFormData({ ...formData, summary: e.target.value })
                        }
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.summary.length}/1000 characters
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Category *
                        </label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CIVIL_RIGHTS">Civil Rights</SelectItem>
                            <SelectItem value="POLICE_MISCONDUCT">
                              Police Misconduct
                            </SelectItem>
                            <SelectItem value="LEGAL_MALPRACTICE">
                              Legal Malpractice
                            </SelectItem>
                            <SelectItem value="PROSECUTORIAL_MISCONDUCT">
                              Prosecutorial Misconduct
                            </SelectItem>
                            <SelectItem value="CONSTITUTIONAL_VIOLATION">
                              Constitutional Violation
                            </SelectItem>
                            <SelectItem value="INSTITUTIONAL_CORRUPTION">
                              Institutional Corruption
                            </SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Jurisdiction *
                        </label>
                        <Select
                          value={formData.jurisdiction}
                          onValueChange={(value) =>
                            setFormData({ ...formData, jurisdiction: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select jurisdiction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Montana">Montana</SelectItem>
                            <SelectItem value="Washington">Washington</SelectItem>
                            <SelectItem value="Federal">Federal</SelectItem>
                            <SelectItem value="Multi-State">Multi-State</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!isStep1Complete}
                        className="ml-auto"
                      >
                        Next Step
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Case Details</CardTitle>
                    <CardDescription>
                      Provide detailed information and identify organizations involved
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Alleged Organizations *
                      </label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="e.g., Billings Police Department"
                          value={formData.newOrg}
                          onChange={(e) =>
                            setFormData({ ...formData, newOrg: e.target.value })
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddOrganization();
                            }
                          }}
                        />
                        <Button onClick={handleAddOrganization} variant="outline">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.allegedOrganizations.map((org, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveOrganization(idx)}
                          >
                            {org} ×
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        These will be publicly displayed. Click to remove.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Full Case Description *
                      </label>
                      <Textarea
                        placeholder="Provide a detailed description of your case. Include facts, dates, locations, and what happened. Victim names will be redacted automatically."
                        value={formData.fullContent}
                        onChange={(e) =>
                          setFormData({ ...formData, fullContent: e.target.value })
                        }
                        rows={10}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports Markdown formatting. Minimum 100 characters.
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-semibold mb-1">Privacy Note</p>
                        <p>
                          Your personal name and identifying information will be redacted from the public profile. 
                          Only the facts and alleged organizations will be displayed.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setStep(1)}
                        variant="outline"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!isStep2Complete || submitMutation.isPending}
                        className="ml-auto"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit for Review"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
