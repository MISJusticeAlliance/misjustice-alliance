import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Scale, Users, Eye, Zap, Heart, Lock } from "lucide-react";
import { updateSEOMetadata, setCanonicalURL } from "@/lib/seo";

export default function Mission() {
  useEffect(() => {
    updateSEOMetadata({
      title: "Our Mission - MISJustice Alliance | Anonymous Legal Assistance",
      description: "Learn about MISJustice Alliance's mission to defend constitutional and civil rights through anonymous legal advocacy. Exposing institutional corruption and misconduct.",
      url: "https://www.misjusticealliance.org/mission",
      type: "website",
      image: "https://www.misjusticealliance.org/og-mission.jpg",
    });
    setCanonicalURL("https://www.misjusticealliance.org/mission");

    window.scrollTo(0, 0);

    // Add structured data for Organization
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "MISJustice Alliance",
      description: "Anonymous Legal Assistance Group - Independent non-profit civil litigation advocacy collective",
      url: "https://www.misjusticealliance.org",
      mission: "Defending constitutional and civil rights of individuals victimized by systemic corruption and misconduct",
      areaServed: ["Montana", "Washington", "Federal", "Multi-State"],
      knowsAbout: [
        "Civil rights violations",
        "Police misconduct",
        "Prosecutorial misconduct",
        "Legal malpractice",
        "Institutional corruption",
      ],
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, []);

  const areasOfExpertise = [
    {
      title: "Civil Rights Violations",
      description: "Constitutional deprivations and civil rights abuses",
      icon: Shield,
    },
    {
      title: "Police Misconduct",
      description: "Law enforcement abuse of power and excessive force",
      icon: Scale,
    },
    {
      title: "Prosecutorial Misconduct",
      description: "Judicial system failures and prosecutorial abuse",
      icon: Eye,
    },
    {
      title: "Legal Malpractice",
      description: "Attorney negligence and court-appointed counsel failures",
      icon: Users,
    },
    {
      title: "Institutional Corruption",
      description: "Government agencies and non-profit organization misconduct",
      icon: Zap,
    },
    {
      title: "Retaliation & Abuse",
      description: "Inter-jurisdictional harassment and whistleblower retaliation",
      icon: Lock,
    },
  ];

  const guidingPrinciples = [
    {
      title: "Justice Through Collective Action",
      description:
        "We believe that coordinated legal expertise can effectively challenge even the most powerful institutions when they engage in systemic misconduct.",
    },
    {
      title: "Protection Through Anonymity",
      description:
        "Our anonymous structure ensures that both our volunteers and clients can pursue justice without fear of professional or personal retaliation.",
    },
    {
      title: "Transparency in Accountability",
      description:
        "While we protect individual identities, we are committed to bringing institutional misconduct into the public light where it can be properly addressed and remedied.",
    },
    {
      title: "Empowerment Through Knowledge",
      description:
        "We strive to educate and empower individuals to understand their rights and navigate complex legal systems with confidence and clarity.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Scale className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Our Mission</h1>
              <p className="text-lg opacity-90 mt-2">
                Defending Constitutional and Civil Rights Through Anonymous Legal Advocacy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Mission Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg leading-relaxed">
                The <strong>Anonymous Legal Assistance Group</strong> is an independent, non-profit civil litigation advocacy collective dedicated to defending the constitutional and civil rights of individuals who have been victimized by systemic corruption and misconduct within legal, governmental, and institutional frameworks.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                Operating under a strict code of anonymity to protect both our volunteer legal professionals and the vulnerable individuals who seek our assistance, we serve as a powerful watchdog organization committed to exposing patterns of abuse that exploit power imbalances and overwhelm individual resources.
              </p>
            </CardContent>
          </Card>

          {/* Core Purpose Section */}
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl">Core Purpose</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-base leading-relaxed">
                We exist to shine a public light on private and public institutions whose conduct demonstrates clear patterns of <strong>systemic corruption and misconduct that victimizes innocent individuals</strong>. Our particular focus centers on institutions whose sheer size, power, or jurisdictional scope enables them to overwhelm the resources any single individual could reasonably marshal in their own defense.
              </p>
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded">
                <p className="font-semibold text-primary mb-2">Our Commitment:</p>
                <p className="text-sm text-muted-foreground">
                  We hold powerful institutions accountable and ensure that individual victims are not left defenseless against systemic abuse.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Areas of Expertise */}
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl">Areas of Expertise</CardTitle>
              <CardDescription>
                Our volunteer legal professionals contribute their specialized knowledge in the following areas:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areasOfExpertise.map((area, idx) => {
                  const Icon = area.icon;
                  return (
                    <div key={idx} className="flex gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary mt-1" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{area.title}</h4>
                        <p className="text-xs text-muted-foreground">{area.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Commitment to Anonymity */}
          <Card className="border-2 border-amber-200 bg-amber-50/50">
            <CardHeader className="bg-amber-100/30">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Lock className="h-6 w-6 text-amber-700" />
                Our Commitment to Anonymity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-base leading-relaxed">
                <strong>Strict anonymity is fundamental to our mission.</strong> We maintain complete confidentiality for both our volunteer legal professionals and those seeking assistance to protect against retaliation, professional sanctions, and other forms of retribution that powerful institutions routinely deploy against those who challenge their misconduct.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-amber-900">We protect against:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Professional sanctions and career retaliation</li>
                  <li>• Personal safety threats and harassment</li>
                  <li>• Institutional retaliation mechanisms</li>
                  <li>• Legal and financial intimidation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Serve */}
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl">How We Serve</CardTitle>
              <CardDescription>
                The Anonymous Legal Assistance Group is <strong>not a substitute for formal legal representation</strong> but works to bridge critical gaps in the justice system by:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[
                  "Providing comprehensive case review and legal analysis of civil rights violations and systemic misconduct",
                  "Offering strategic guidance and recommendations on how to proceed with complex legal matters",
                  "Connecting individuals with qualified legal representation appropriate to their specific circumstances and jurisdictional requirements",
                  "Developing comprehensive case narratives that document patterns of institutional abuse and corruption",
                  "Providing resources and support for navigating oversight agencies and regulatory bodies",
                  "Educating the public about civil rights, legal protections, and available remedies",
                ].map((service, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded">
                    <div className="flex-shrink-0 pt-1">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        ✓
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{service}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vision Section */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg font-semibold text-primary">
                We envision a society where <strong>no individual stands alone against institutional abuse of power.</strong>
              </p>
              <p className="text-base leading-relaxed">
                Through our collective expertise and unwavering commitment to justice, we work to restore balance to a system where powerful institutions are held accountable for their actions and where every person's constitutional rights are protected and defended.
              </p>
              <p className="text-sm italic text-muted-foreground mt-4">
                The Anonymous Legal Assistance Group stands as a beacon of hope for those facing seemingly insurmountable institutional power, providing the collective strength, expertise, and resources necessary to pursue justice and accountability in our democratic society.
              </p>
            </CardContent>
          </Card>

          {/* Guiding Principles */}
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl">Guiding Principles</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guidingPrinciples.map((principle, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1 flex-shrink-0">{idx + 1}</Badge>
                      <h4 className="font-semibold text-base">{principle.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground ml-10">{principle.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Seek Justice?</h3>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                  If you believe you have been victimized by institutional misconduct or systemic corruption, we are here to help. Our anonymous platform ensures your safety while we work toward accountability.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Link href="/submit">
                    <Button asChild size="lg" variant="secondary">
                      <span>Submit Your Case</span>
                    </Button>
                  </Link>
                  <Link href="/resources">
                    <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <span>Learn More</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
