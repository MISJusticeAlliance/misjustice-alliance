import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Search, BookOpen, Scale, FileText } from "lucide-react";
import { Link } from "wouter";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { trpc } from "@/lib/trpc";
import { updateSEOMetadata, setCanonicalURL, pageMetadata } from "@/lib/seo";

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    updateSEOMetadata({
      ...pageMetadata.resources,
      url: "https://www.misjusticealliance.org/resources",
      type: "website",
    });
    setCanonicalURL("https://www.misjusticealliance.org/resources");
  }, []);

  const { data: resources, isLoading } = trpc.resources.getPublished.useQuery();

  const filteredResources = resources?.filter((resource) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      resource.category.toLowerCase().includes(query) ||
      (resource.excerpt && resource.excerpt.toLowerCase().includes(query))
    );
  });

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes("civil")) return <Shield className="h-5 w-5" />;
    if (category.toLowerCase().includes("police")) return <Scale className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <DisclaimerBanner variant="warning" className="mb-6" />

          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Legal Resources</h1>
              <p className="text-muted-foreground">
                Educational materials about civil rights, police misconduct, and legal advocacy
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search resources by title, category, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          )}

          {/* Resources Grid */}
          {!isLoading && filteredResources && filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {getCategoryIcon(resource.category)}
                      </div>
                      <Badge variant="secondary">{resource.category}</Badge>
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    {resource.excerpt && (
                      <CardDescription className="line-clamp-3">
                        {resource.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-3">
                      {resource.jurisdiction && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Jurisdiction:</strong> {resource.jurisdiction}
                        </div>
                      )}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Link href={`/resources/${resource.slug}`}>
                        <Button asChild variant="outline" className="w-full">
                          <span>Read More</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !isLoading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "Resources will be available soon"}
                  </p>
                </CardContent>
              </Card>
            )
          )}

          {/* Info Section */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>
                If you can't find the information you're looking for, submit your case and our 
                legal team will provide personalized guidance.
              </CardDescription>
            </CardHeader>
            <CardContent>
            <Link href="/submit">
              <Button asChild>
                <span>Submit Your Case</span>
              </Button>
            </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
