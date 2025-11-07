import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function CaseGallery() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState<string>("");
  const [offset, setOffset] = useState(0);

  const { data: profiles, isLoading, error } = trpc.caseProfiles.getPublished.useQuery({
    limit: 12,
    offset,
    category: category || undefined,
    jurisdiction: jurisdiction || undefined,
  });

  useEffect(() => {
    document.title = "Public Case Profiles - MISJustice Alliance";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Browse publicly documented cases of civil rights violations, police misconduct, and institutional corruption. Raise awareness for cases seeking justice.");
    }
  }, []);

  const filteredProfiles = profiles?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.summary.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Public Case Profiles</h1>
          <p className="text-lg opacity-90">
            Documented cases of civil rights violations and institutional misconduct. 
            Victim names are redacted to protect privacy, but alleged organizations are public.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="container py-8">
        <DisclaimerBanner variant="info" className="mb-8" />
      </div>

      {/* Filters */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="CIVIL_RIGHTS">Civil Rights</SelectItem>
              <SelectItem value="POLICE_MISCONDUCT">Police Misconduct</SelectItem>
              <SelectItem value="LEGAL_MALPRACTICE">Legal Malpractice</SelectItem>
              <SelectItem value="PROSECUTORIAL_MISCONDUCT">Prosecutorial Misconduct</SelectItem>
              <SelectItem value="CONSTITUTIONAL_VIOLATION">Constitutional Violation</SelectItem>
              <SelectItem value="INSTITUTIONAL_CORRUPTION">Institutional Corruption</SelectItem>
            </SelectContent>
          </Select>

          <Select value={jurisdiction} onValueChange={setJurisdiction}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Jurisdictions</SelectItem>
              <SelectItem value="Montana">Montana</SelectItem>
              <SelectItem value="Washington">Washington</SelectItem>
              <SelectItem value="Federal">Federal</SelectItem>
              <SelectItem value="Multi-State">Multi-State</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex items-start gap-3 mb-8">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Error loading cases</h3>
              <p className="text-sm">Failed to load case profiles. Please try again later.</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cases found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search filters or check back later for new case profiles.
            </p>
            <Button asChild variant="outline">
              <Link href="/publicize-case">Submit a Case Profile</Link>
            </Button>
          </div>
        )}

        {/* Case Grid */}
        {!isLoading && filteredProfiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Link key={profile.id} href={`/case/${profile.profileSlug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary">{profile.category.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline">{profile.jurisdiction}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{profile.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{profile.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.allegedOrganizations && (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">Alleged Organizations:</p>
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(profile.allegedOrganizations).map((org: string, idx: number) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {org}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>👁️ {profile.viewCount || 0} views</span>
                        <span>{new Date(profile.publishedAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredProfiles.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - 12))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setOffset(offset + 12)}
            >
              Next
            </Button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Have a Case to Publicize?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Share your case with the public to raise awareness and seek support. 
            Your name will be redacted for privacy, but the facts and organizations involved will be public.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/publicize-case">Submit a Case Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
