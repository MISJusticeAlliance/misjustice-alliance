import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface DisclaimerBannerProps {
  variant?: "warning" | "info" | "critical";
  showLink?: boolean;
  dismissible?: boolean;
  className?: string;
}

export function DisclaimerBanner({
  variant = "warning",
  showLink = true,
  dismissible = true,
  className = "",
}: DisclaimerBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const variantStyles = {
    warning: "bg-orange-50 border-orange-200 text-orange-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
    critical: "bg-red-50 border-red-200 text-red-900",
  };

  const iconStyles = {
    warning: "text-orange-600",
    info: "text-blue-600",
    critical: "text-red-600",
  };

  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[variant]}`} />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">Legal Disclaimer</p>
          <p className="text-sm mb-2">
            The information provided on this page is for educational and informational purposes only and is not a
            substitute for professional legal advice. Always consult with a licensed attorney before taking any legal
            action.
          </p>
          {showLink && (
            <Link href="/disclaimer">
              <Button variant="link" size="sm" className="h-auto p-0 text-sm">
                Read full disclaimer →
              </Button>
            </Link>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact disclaimer banner for inline use
 */
export function CompactDisclaimerBanner() {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-900">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-600" />
        <div>
          <span className="font-semibold">Disclaimer:</span> This information is not legal advice. Consult a licensed
          attorney.{" "}
          <Link href="/disclaimer">
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Learn more
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline disclaimer text
 */
export function InlineDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-muted-foreground italic ${className}`}>
      <strong>Disclaimer:</strong> This information is provided for educational purposes only and is not a substitute
      for professional legal advice. Always consult with a licensed attorney.{" "}
      <Link href="/disclaimer">
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          Read full disclaimer
        </Button>
      </Link>
    </p>
  );
}
