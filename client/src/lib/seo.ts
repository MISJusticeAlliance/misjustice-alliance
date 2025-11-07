/**
 * SEO and GEO Optimization Utilities
 * Handles meta tags, structured data, and search engine optimization
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "organization";
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

/**
 * Update document head with SEO metadata
 */
export function updateSEOMetadata(metadata: SEOMetadata) {
  // Update title
  document.title = metadata.title;
  updateMetaTag("og:title", metadata.title);
  updateMetaTag("twitter:title", metadata.title);

  // Update description
  updateMetaTag("description", metadata.description);
  updateMetaTag("og:description", metadata.description);
  updateMetaTag("twitter:description", metadata.description);

  // Update keywords
  if (metadata.keywords && metadata.keywords.length > 0) {
    updateMetaTag("keywords", metadata.keywords.join(", "));
  }

  // Update image
  if (metadata.image) {
    updateMetaTag("og:image", metadata.image);
    updateMetaTag("twitter:image", metadata.image);
  }

  // Update URL
  if (metadata.url) {
    updateMetaTag("og:url", metadata.url);
    updateMetaTag("canonical", metadata.url);
  }

  // Update type
  if (metadata.type) {
    updateMetaTag("og:type", metadata.type);
  }

  // Update article metadata
  if (metadata.publishedDate) {
    updateMetaTag("article:published_time", metadata.publishedDate);
  }
  if (metadata.modifiedDate) {
    updateMetaTag("article:modified_time", metadata.modifiedDate);
  }
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    if (name.startsWith("og:") || name.startsWith("article:")) {
      element.setAttribute("property", name);
    } else {
      element.setAttribute("name", name);
    }
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

/**
 * Add canonical URL to prevent duplicate content
 */
export function setCanonicalURL(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", url);
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MISJustice Alliance",
    url: "https://www.misjusticealliance.org",
    logo: "https://www.misjusticealliance.org/logo.svg",
    description:
      "Anonymous legal advocacy for victims of civil rights violations, police misconduct, and institutional corruption in Montana and Washington.",
    sameAs: [
      "https://www.facebook.com/misjusticealliance",
      "https://www.twitter.com/misjusticealliance",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Legal Services",
      url: "https://www.misjusticealliance.org/submit",
    },
    areaServed: ["MT", "WA", "US"],
    serviceType: "Legal Advocacy",
  };
}

/**
 * Generate JSON-LD structured data for LocalBusiness
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "MISJustice Alliance",
    url: "https://www.misjusticealliance.org",
    description:
      "Legal advocacy organization specializing in civil rights violations and police misconduct cases.",
    areaServed: [
      {
        "@type": "State",
        name: "Montana",
      },
      {
        "@type": "State",
        name: "Washington",
      },
    ],
    serviceArea: {
      "@type": "GeoShape",
      box: "45.0 -109.6 49.0 -104.0 47.0 -124.7 49.0 -116.9",
    },
  };
}

/**
 * Generate JSON-LD structured data for LegalService
 */
export function generateLegalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "MISJustice Alliance",
    url: "https://www.misjusticealliance.org",
    description:
      "Anonymous legal advocacy for civil rights violations, police misconduct, legal malpractice, and prosecutorial misconduct.",
    areaServed: ["MT", "WA"],
    availableLanguage: ["en"],
    knowsAbout: [
      "Civil Rights Law",
      "Police Misconduct",
      "Constitutional Law",
      "Legal Malpractice",
      "Prosecutorial Misconduct",
    ],
  };
}

/**
 * Generate JSON-LD structured data for FAQ
 */
export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is my submission truly anonymous?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all submissions are completely anonymous. We do not collect any personally identifiable information unless you voluntarily provide it, and even then, it is encrypted.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to review my case?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our legal professionals typically review submissions within 24-48 hours. Complex cases may take longer.",
        },
      },
      {
        "@type": "Question",
        name: "What types of cases do you handle?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We handle civil rights violations, police misconduct, legal malpractice, prosecutorial misconduct, and institutional corruption cases in Montana and Washington.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a cost to submit a case?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, there is absolutely no cost to submit your case or communicate with our legal team.",
        },
      },
      {
        "@type": "Question",
        name: "How do I track my case?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You will receive a unique case ID when you submit your case. Use this ID to track your case status and communicate securely with our team.",
        },
      },
    ],
  };
}

/**
 * Generate JSON-LD structured data for BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Inject JSON-LD structured data into the document head
 */
export function injectStructuredData(data: Record<string, any>) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * SEO Metadata for different pages
 */
export const pageMetadata = {
  home: {
    title: "MISJustice Alliance - Anonymous Legal Advocacy for Civil Rights Violations",
    description:
      "Secure, anonymous legal advocacy platform for victims of civil rights violations, police misconduct, and institutional corruption in Montana and Washington. Free case submission and tracking.",
    keywords: [
      "civil rights violations",
      "police misconduct",
      "legal advocacy",
      "Montana",
      "Washington",
      "constitutional rights",
      "excessive force",
      "false arrest",
      "legal malpractice",
      "prosecutorial misconduct",
      "anonymous legal help",
    ],
  },
  submit: {
    title: "Submit Your Case - MISJustice Alliance",
    description:
      "Anonymously submit your civil rights violation or police misconduct case. Secure, encrypted, and completely confidential. No personal information required.",
    keywords: [
      "submit case",
      "anonymous submission",
      "civil rights case",
      "police misconduct report",
      "legal help",
    ],
  },
  trackCase: {
    title: "Track Your Case - MISJustice Alliance",
    description:
      "Track your anonymous case status and communicate securely with our legal team using your unique case ID. No login required.",
    keywords: ["track case", "case status", "case tracking", "legal communication"],
  },
  resources: {
    title: "Legal Resources - MISJustice Alliance",
    description:
      "Educational materials about civil rights law, police misconduct, constitutional violations, and legal advocacy. Learn about your rights.",
    keywords: [
      "legal resources",
      "civil rights education",
      "police misconduct",
      "constitutional law",
      "legal guides",
    ],
  },
};
