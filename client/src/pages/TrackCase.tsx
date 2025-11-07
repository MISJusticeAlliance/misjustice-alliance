import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Search, ArrowLeft, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { updateSEOMetadata, setCanonicalURL, pageMetadata } from "@/lib/seo";
import { ExportCaseReportButton } from "@/components/ExportCaseReportButton";

export default function TrackCase() {
  const [caseId, setCaseId] = useState("");
  const [searchedCaseId, setSearchedCaseId] = useState("");
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    updateSEOMetadata({
      ...pageMetadata.trackCase,
      url: "https://www.misjusticealliance.org/track-case",
      type: "website",
    });
    setCanonicalURL("https://www.misjusticealliance.org/track-case");
  }, []);

  // Get case ID from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCaseId = params.get("caseId");
    if (urlCaseId) {
      setCaseId(urlCaseId);
      setSearchedCaseId(urlCaseId);
    }
  }, []);

  const { data: submission, isLoading, error } = trpc.submissions.getByCaseId.useQuery(
    { caseId: searchedCaseId },
    { enabled: !!searchedCaseId }
  );

  const { data: messages, refetch: refetchMessages } = trpc.messages.getByCaseId.useQuery(
    { caseId: searchedCaseId },
    { enabled: !!searchedCaseId }
  );

  const sendMessage = trpc.messages.create.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully");
      setMessageContent("");
      refetchMessages();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (caseId.trim()) {
      setSearchedCaseId(caseId.trim());
    } else {
      toast.error("Please enter a case ID");
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!searchedCaseId) {
      toast.error("No case selected");
      return;
    }

    await sendMessage.mutateAsync({
      caseId: searchedCaseId,
      content: messageContent,
      sender: "SUBMITTER",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500";
      case "UNDER_REVIEW":
        return "bg-yellow-500";
      case "IN_PROGRESS":
        return "bg-purple-500";
      case "AWAITING_INFO":
        return "bg-orange-500";
      case "RESOLVED":
        return "bg-green-500";
      case "CLOSED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ");
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/">
            <Button asChild variant="ghost" size="sm" className="mb-4">
              <span><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Track Your Case</h1>
              <p className="text-muted-foreground">
                Enter your case ID to view status and communicate securely
              </p>
            </div>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Case ID</CardTitle>
              <CardDescription>
                Use the case ID provided when you submitted your case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="CASE-XXXXXXXXXX"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading case information...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Case Not Found</h3>
                <p className="text-muted-foreground">
                  The case ID you entered could not be found. Please check the ID and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Case Details */}
          {submission && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{submission.title}</CardTitle>
                      <CardDescription className="text-base">
                        Case ID: <code className="font-mono font-semibold">{submission.caseId}</code>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExportCaseReportButton caseId={submission.caseId} />
                      <Badge className={`${getStatusColor(submission.status)} text-white`}>
                        {getStatusLabel(submission.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Category</Label>
                      <p className="font-medium">{submission.category.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Jurisdiction</Label>
                      <p className="font-medium">{submission.jurisdiction}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Urgency Level</Label>
                      <p className="font-medium">{submission.urgencyLevel}/10</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Description</Label>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {submission.description}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Last Updated: {new Date(submission.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Secure Messages</CardTitle>
                  <CardDescription>
                    Communicate securely with our legal team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Messages List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {messages && messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-lg ${
                            msg.sender === "ADMIN"
                              ? "bg-primary/10 ml-0 mr-8"
                              : "bg-muted ml-8 mr-0"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={msg.sender === "ADMIN" ? "default" : "secondary"}>
                              {msg.sender === "ADMIN" ? "Legal Team" : "You"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No messages yet. Send a message to start the conversation.</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Send Message Form */}
                  <div className="space-y-3">
                    <Label htmlFor="message">Send a Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={4}
                      maxLength={5000}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {messageContent.length}/5000 characters
                      </span>
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMessage.isPending || !messageContent.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {sendMessage.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
