import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Scale, Users, FileText, ArrowRight, Lock, Eye, Heart, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { updateSEOMetadata, setCanonicalURL, injectStructuredData, generateOrganizationSchema, generateLocalBusinessSchema, generateLegalServiceSchema, generateFAQSchema, pageMetadata } from "@/lib/seo";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Update SEO metadata
    updateSEOMetadata({
      ...pageMetadata.home,
      url: "https://www.misjusticealliance.org/",
      type: "website",
    });

    // Set canonical URL
    setCanonicalURL("https://www.misjusticealliance.org/");

    // Inject structured data
    injectStructuredData(generateOrganizationSchema());
    injectStructuredData(generateLocalBusinessSchema());
    injectStructuredData(generateLegalServiceSchema());
    injectStructuredData(generateFAQSchema());
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">MISJustice Alliance</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/mission" className="text-foreground hover:text-primary transition-colors">Mission</Link>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
              <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
              <Link href="/resources" className="text-foreground hover:text-primary transition-colors">Resources</Link>
              <Link href="/track-case" className="text-foreground hover:text-primary transition-colors">Track Case</Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition-colors">Contact</Link>
              <NotificationCenter />
              {isAuthenticated && user?.role === "admin" && (
                <>
                  <Link href="/notification-settings" className="text-foreground hover:text-primary transition-colors text-sm">Settings</Link>
                  <a href="/admin" className="text-foreground hover:text-primary transition-colors text-sm font-medium">Admin</a>
                </>
              )}
              {!isAuthenticated && (
                <Button asChild className="bg-primary hover:bg-primary/90 text-sm">
                  <a href={getLoginUrl()}>Admin Login</a>
                </Button>
              )}
              {!isAuthenticated ? (
                <Link href="/submit">
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <span>Submit Case</span>
                  </Button>
                </Link>
              ) : null}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-3">
              <Link href="/mission" className="block text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Mission</Link>
              <a href="#about" className="block text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a href="#services" className="block text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Services</a>
              <Link href="/resources" className="block text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
              <Link href="/track-case" className="block text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Track Case</Link>
              <Link href="/contact" className="block text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              {isAuthenticated && user?.role === "admin" && (
                <>
                  <Link href="/notification-settings" className="block text-foreground hover:text-primary transition-colors py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                  <a href="/admin" className="block text-foreground hover:text-primary transition-colors py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Admin</a>
                </>
              )}
              <div className="pt-2 border-t space-y-2">
                {!isAuthenticated && (
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-sm">
                    <a href={getLoginUrl()}>Admin Login</a>
                  </Button>
                )}
                {!isAuthenticated ? (
                  <Link href="/submit" onClick={() => setMobileMenuOpen(false)}>
                    <Button asChild className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <span>Submit Case</span>
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </nav>

            {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Justice for Those Who Have Been Wronged
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Anonymous legal advocacy for victims of civil rights violations, police misconduct, 
              and institutional corruption in Montana and Washington.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6">
                  Submit Your Case <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/track-case">
                <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6">
                  <span>Track Existing Case</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 justify-center">
              <Lock className="h-6 w-6 text-primary" />
              <span className="font-semibold">100% Anonymous</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Eye className="h-6 w-6 text-primary" />
              <span className="font-semibold">Confidential & Secure</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-semibold">No Cost to You</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">Our Mission</h2>
            <p className="text-xl text-muted-foreground text-center mb-12 leading-relaxed">
              The MISJustice Alliance exists to provide a voice for those who have been silenced by 
              systemic injustice. We specialize in cases involving civil rights violations, police 
              misconduct, legal malpractice, and institutional corruption.
            </p>
            <div className="prose prose-lg mx-auto">
              <p>
                Our platform offers a secure, anonymous way for victims to report their experiences 
                and connect with legal professionals who can help. We understand that coming forward 
                can be difficult and potentially dangerous, which is why we've built our system with 
                privacy and security as the top priorities.
              </p>
              <p>
                Whether you've experienced excessive force, false arrest, prosecutorial misconduct, 
                or violations of your constitutional rights, we're here to help you navigate the 
                legal system and seek justice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">How We Help</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            We provide comprehensive support for victims of injustice through our secure platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Civil Rights</CardTitle>
                <CardDescription>
                  1st, 4th, 8th, and 14th Amendment violations
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Scale className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Police Misconduct</CardTitle>
                <CardDescription>
                  Excessive force, false arrest, and constitutional violations
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Legal Malpractice</CardTitle>
                <CardDescription>
                  Attorney negligence and ethical violations
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Prosecutorial Misconduct</CardTitle>
                <CardDescription>
                  Malicious prosecution and Brady violations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">Simple & Secure Process</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            Getting help is easy and completely confidential.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Submit Your Case</h3>
              <p className="text-muted-foreground">
                Fill out our secure, anonymous form with details about your situation. 
                No personal information required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Get Your Case ID</h3>
              <p className="text-muted-foreground">
                Receive a unique case ID to track your submission and communicate 
                securely with our team.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">We Review & Respond</h3>
              <p className="text-muted-foreground">
                Our legal professionals review your case and provide guidance through 
                our secure messaging system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Seek Justice?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Don't let injustice go unchallenged. Submit your case today or browse public case profiles 
            to raise awareness for cases seeking justice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit">
              <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6">
                <span>Submit Your Case <ArrowRight className="ml-2 h-5 w-5" /></span>
              </Button>
            </Link>
            <Link href="/case-gallery">
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6">
                <span>View Public Cases</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6" />
                <span className="font-bold text-lg">MISJustice Alliance</span>
              </div>
              <p className="text-white/70">
                Anonymous legal advocacy for victims of civil rights violations and institutional corruption.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/submit" className="hover:text-white transition-colors">Submit Case</Link></li>
                <li><Link href="/track-case" className="hover:text-white transition-colors">Track Case</Link></li>
                <li><Link href="/case-gallery" className="hover:text-white transition-colors">Public Cases</Link></li>
                <li><Link href="/publicize-case" className="hover:text-white transition-colors">Publicize Case</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors">Legal Resources</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Jurisdictions</h4>
              <ul className="space-y-2 text-white/70">
                <li>Montana</li>
                <li>Washington</li>
                <li>Federal Cases</li>
                <li>Multi-State Coordination</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2024 MISJustice Alliance. All rights reserved. Your privacy is our priority.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
