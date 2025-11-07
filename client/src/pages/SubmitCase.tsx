import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Shield, ArrowLeft, ArrowRight, CheckCircle, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { updateSEOMetadata, setCanonicalURL, pageMetadata } from "@/lib/seo";

type CategoryType = "CIVIL_RIGHTS" | "POLICE_MISCONDUCT" | "LEGAL_MALPRACTICE" | "PROSECUTORIAL_MISCONDUCT" | "CONSTITUTIONAL_VIOLATION" | "INSTITUTIONAL_CORRUPTION" | "OTHER";
type JurisdictionType = "Montana" | "Washington" | "Federal" | "Multi-State";

type FormData = {
  category: CategoryType | "";
  title: string;
  description: string;
  jurisdiction: JurisdictionType | "";
  urgencyLevel: number;
  contactEmail?: string;
  contactPhone?: string;
  personalDetails?: {
    age?: number;
    location?: string;
    additionalInfo?: string;
  };
};

export default function SubmitCase() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  useEffect(() => {
    updateSEOMetadata({
      ...pageMetadata.submit,
      url: "https://www.misjusticealliance.org/submit",
      type: "website",
    });
    setCanonicalURL("https://www.misjusticealliance.org/submit");
  }, []);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    title: "",
    description: "",
    jurisdiction: "",
    urgencyLevel: 5,
  });
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  const createSubmission = trpc.submissions.create.useMutation({
    onSuccess: (data) => {
      setSubmittedCaseId(data.caseId);
      toast.success("Case submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit case");
    },
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePersonalDetails = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.category || !formData.title || !formData.description || !formData.jurisdiction) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.title.length < 5 || formData.title.length > 200) {
      toast.error("Title must be between 5 and 200 characters");
      return;
    }

    if (formData.description.length < 20 || formData.description.length > 10000) {
      toast.error("Description must be between 20 and 10,000 characters");
      return;
    }

    await createSubmission.mutateAsync({
      ...formData,
      category: formData.category as CategoryType,
      jurisdiction: formData.jurisdiction as JurisdictionType,
    });
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Success screen
  if (submittedCaseId) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">Case Submitted Successfully</CardTitle>
                <CardDescription className="text-lg">
                  Your case has been securely submitted to our legal team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg">
                  <Label className="text-sm text-muted-foreground mb-2 block">Your Case ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-mono font-bold text-primary flex-1">
                      {submittedCaseId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(submittedCaseId);
                        toast.success("Case ID copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Keep this Case ID safe.</strong> You'll need it to track your case 
                      status and communicate with our team.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Our legal professionals will review your submission within 24-48 hours.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p>
                      All information is encrypted and stored securely. Your identity remains 
                      completely anonymous.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href={`/track-case?caseId=${submittedCaseId}`}>
                    <Button asChild className="w-full sm:w-auto">
                      <span>Track Your Case</span>
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <span>Return Home</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

   return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <DisclaimerBanner variant="critical" className="mb-6" />
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Submit Your Case</h1>
          </div>
          <p className="text-muted-foreground">
            All information is encrypted and anonymous. You'll receive a case ID to track your submission.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Steps */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Case Information"}
                {step === 2 && "Case Details"}
                {step === 3 && "Contact Information (Optional)"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about the type of case you're submitting"}
                {step === 2 && "Provide detailed information about your situation"}
                {step === 3 && "Optionally provide contact information for follow-up"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Case Information */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">Case Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => updateFormData("category", v)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CIVIL_RIGHTS">Civil Rights Violations</SelectItem>
                        <SelectItem value="POLICE_MISCONDUCT">Police Misconduct</SelectItem>
                        <SelectItem value="LEGAL_MALPRACTICE">Legal Malpractice</SelectItem>
                        <SelectItem value="PROSECUTORIAL_MISCONDUCT">Prosecutorial Misconduct</SelectItem>
                        <SelectItem value="CONSTITUTIONAL_VIOLATION">Constitutional Violation</SelectItem>
                        <SelectItem value="INSTITUTIONAL_CORRUPTION">Institutional Corruption</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                    <Select value={formData.jurisdiction} onValueChange={(v) => updateFormData("jurisdiction", v)}>
                      <SelectTrigger id="jurisdiction">
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

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level: {formData.urgencyLevel}/10</Label>
                    <Slider
                      id="urgency"
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.urgencyLevel]}
                      onValueChange={(v) => updateFormData("urgencyLevel", v[0])}
                      className="py-4"
                    />
                    <p className="text-sm text-muted-foreground">
                      How urgent is your case? (1 = Not urgent, 10 = Extremely urgent)
                    </p>
                  </div>
                </>
              )}

              {/* Step 2: Case Details */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Case Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief summary of your case (5-200 characters)"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      maxLength={200}
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.title.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide a detailed description of what happened, including dates, locations, people involved, and any evidence you have. (20-10,000 characters)"
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      rows={12}
                      maxLength={10000}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.description.length}/10,000 characters
                    </p>
                  </div>
                </>
              )}

              {/* Step 3: Contact Information */}
              {step === 3 && (
                <>
                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground">
                      <Lock className="inline h-4 w-4 mr-1" />
                      Contact information is optional and will be encrypted. You can still track 
                      your case and communicate with us using only your case ID.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail || ""}
                      onChange={(e) => updateFormData("contactEmail", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.contactPhone || ""}
                      onChange={(e) => updateFormData("contactPhone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age (Optional)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Your age"
                      value={formData.personalDetails?.age || ""}
                      onChange={(e) => updatePersonalDetails("age", parseInt(e.target.value) || undefined)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.personalDetails?.location || ""}
                      onChange={(e) => updatePersonalDetails("location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional">Additional Information (Optional)</Label>
                    <Textarea
                      id="additional"
                      placeholder="Any other relevant information"
                      value={formData.personalDetails?.additionalInfo || ""}
                      onChange={(e) => updatePersonalDetails("additionalInfo", e.target.value)}
                      rows={4}
                    />
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {step < totalSteps ? (
                  <Button onClick={() => setStep(step + 1)}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={createSubmission.isPending}
                  >
                    {createSubmission.isPending ? "Submitting..." : "Submit Case"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
