import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ArrowLeft, Share2, Download } from "lucide-react";
import { Streamdown } from "streamdown";

export default function CaseDetail() {
  const [match, params] = useRoute("/case/:slug");

  const { data: profile, isLoading, error } = trpc.caseProfiles.getBySlug.useQuery(
    { slug: params?.slug || "" },
    { enabled: !!params?.slug }
  );

  const { data: attachments } = trpc.caseProfiles.getAttachments.useQuery(
    { caseProfileId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );

  const { data: updates } = trpc.caseProfiles.getUpdates.useQuery(
    { caseProfileId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );

  useEffect(() => {
    if (profile) {
      document.title = `${profile.title} - MISJustice Alliance`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", profile.metaDescription || profile.summary);
      }
    }
  }, [profile]);

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/case-gallery">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Link>
          </Button>
          <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-6 w-6 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold mb-2">Case Not Found</h2>
              <p>The case profile you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allegedOrgs = profile.allegedOrganizations ? JSON.parse(profile.allegedOrganizations) : [];

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge>{profile.category.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline">{profile.jurisdiction}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-3xl mb-2">{profile.title}</CardTitle>
                <CardDescription className="text-base">{profile.summary}</CardDescription>
              </CardHeader>
            </Card>

            {/* Alleged Organizations */}
            {allegedOrgs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alleged Organizations</CardTitle>
                  <CardDescription>
                    Organizations and entities alleged to have violated laws, regulations, or engaged in misconduct
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {allegedOrgs.map((org: string, idx: number) => (
                      <Badge key={idx} variant="destructive" className="text-sm px-3 py-1">
                        {org}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Content */}
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <Streamdown>{profile.fullContent}</Streamdown>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Supporting Documents & Media</CardTitle>
                  <CardDescription>
                    Files and evidence related to this case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.s3Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <div>
                          <p className="font-medium">{attachment.originalName}</p>
                          <p className="text-sm text-muted-foreground">
                            {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Updates */}
            {updates && updates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Case Updates</CardTitle>
                  <CardDescription>
                    Latest developments and new information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {updates.map((update) => (
                      <div key={update.id} className="border-l-2 border-primary pl-4 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{update.title}</h4>
                          <time className="text-sm text-muted-foreground">
                            {new Date(update.publishedAt!).toLocaleDateString()}
                          </time>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <Streamdown>{update.content}</Streamdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{profile.category.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jurisdiction</p>
                  <p className="font-semibold">{profile.jurisdiction}</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="font-semibold">
                    {new Date(profile.publishedAt!).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="font-semibold">{profile.viewCount || 0}</p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-primary text-primary-foreground border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Have Updates?</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Submit new information about this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/update-case/${profile.profileSlug}`}>
                    Submit an Update
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Privacy Notice</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Victim names and personal identifying information have been redacted to protect privacy. 
                  Only alleged organizations and factual information about misconduct are displayed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
