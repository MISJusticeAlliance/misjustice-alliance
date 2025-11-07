import { AlertCircle, FileText, Scale, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-foreground">Legal Disclaimer</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Important information about the use of MISJustice Alliance resources
          </p>
        </div>

        {/* Main Disclaimer Card */}
        <Card className="border-orange-200 bg-orange-50 mb-8">
          <CardHeader>
            <CardTitle className="text-orange-900">Important Legal Notice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-orange-900">
            <p className="text-base font-semibold">
              The resources, information, and guidance provided by MISJustice Alliance are NOT a substitute for
              professional legal representation and should not be construed as legal advice.
            </p>
            <p className="text-sm">
              All materials on this website are provided for informational and educational purposes only. They are
              intended to supplement, not replace, the advice of a licensed attorney. You should always consult with a
              qualified legal professional before taking any action based on information provided on this website.
            </p>
          </CardContent>
        </Card>

        {/* Detailed Disclaimers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Not Legal Advice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Not Legal Advice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                MISJustice Alliance is not a law firm, and the information provided on this website does not
                constitute legal advice. The resources, guides, and case information are provided for educational and
                informational purposes only.
              </p>
              <p>
                No attorney-client relationship is created by accessing or using this website. If you need legal
                advice, you must consult with a licensed attorney in your jurisdiction.
              </p>
            </CardContent>
          </Card>

          {/* No Warranties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                No Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                All information provided on this website is provided "as is" without warranty of any kind, either
                express or implied. MISJustice Alliance makes no representations or warranties regarding the accuracy,
                completeness, or reliability of any information.
              </p>
              <p>
                We do not warrant that the website will be uninterrupted or error-free, or that defects will be
                corrected.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                In no event shall MISJustice Alliance, its officers, directors, employees, or agents be liable for any
                indirect, incidental, special, consequential, or punitive damages arising out of or related to your use
                of this website or the information provided.
              </p>
              <p>
                This includes damages for loss of profits, data, or other intangible losses, even if we have been
                advised of the possibility of such damages.
              </p>
            </CardContent>
          </Card>

          {/* Consultation Required */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Consult a Licensed Attorney
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Before taking any action based on information provided on this website, you should consult with a
                licensed attorney in your jurisdiction. An attorney can review your specific situation and provide
                advice tailored to your circumstances.
              </p>
              <p>
                Laws vary by jurisdiction and change frequently. Only a qualified attorney can advise you on how the
                law applies to your particular situation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Disclaimer Sections */}
        <div className="space-y-6 mb-8">
          {/* Case Information Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle>Case Information & Public Profiles</CardTitle>
              <CardDescription>
                Information about cases published on this platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Case information and public profiles published on MISJustice Alliance are provided for informational
                purposes to raise awareness about potential injustices. This information is not legal advice and should
                not be relied upon as a substitute for professional legal representation.
              </p>
              <p>
                The publication of case information does not constitute an endorsement of any particular legal theory,
                claim, or remedy. Each case is unique, and outcomes in similar cases do not guarantee similar results in
                your situation.
              </p>
              <p>
                All case information is subject to verification and may be updated or corrected as additional
                information becomes available. MISJustice Alliance does not guarantee the accuracy or completeness of
                any case information.
              </p>
            </CardContent>
          </Card>

          {/* Legal Resources Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle>Legal Resources & Guides</CardTitle>
              <CardDescription>
                Information about legal resources and educational materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Legal resources, guides, and educational materials provided by MISJustice Alliance are intended for
                general informational purposes only. They are not a substitute for legal advice from a qualified
                attorney.
              </p>
              <p>
                The law is complex and varies by jurisdiction. What is legal in one jurisdiction may be illegal in
                another. Laws also change frequently. Always verify current legal requirements with a licensed attorney
                in your jurisdiction.
              </p>
              <p>
                MISJustice Alliance does not provide legal advice through its resources, and accessing these resources
                does not create an attorney-client relationship.
              </p>
            </CardContent>
          </Card>

          {/* Submission Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle>Case Submissions & Communications</CardTitle>
              <CardDescription>
                Information about case submissions and communications with MISJustice Alliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                By submitting a case or communicating with MISJustice Alliance, you understand and agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  No attorney-client relationship is created by submitting information or communicating with
                  MISJustice Alliance
                </li>
                <li>
                  The information you provide may be reviewed by volunteers and staff members, not licensed attorneys
                </li>
                <li>
                  Any guidance or information provided is not legal advice and should not be relied upon as such
                </li>
                <li>
                  You should consult with a licensed attorney regarding your specific situation
                </li>
                <li>
                  MISJustice Alliance is not responsible for any outcomes or consequences resulting from actions taken
                  based on information provided
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Jurisdictional Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle>Jurisdictional Information</CardTitle>
              <CardDescription>
                Information about legal jurisdictions and applicable laws
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                MISJustice Alliance primarily focuses on cases in Montana and Washington. However, the principles and
                legal concepts discussed may have broader application. Laws vary significantly by jurisdiction, and
                what applies in one jurisdiction may not apply in another.
              </p>
              <p>
                If your case involves a different jurisdiction, you should consult with an attorney licensed in that
                jurisdiction to understand how the law applies to your specific situation.
              </p>
            </CardContent>
          </Card>

          {/* No Guarantee of Outcome */}
          <Card>
            <CardHeader>
              <CardTitle>No Guarantee of Outcome</CardTitle>
              <CardDescription>
                Information about case outcomes and results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                MISJustice Alliance makes no guarantees regarding the outcome of any case or legal matter. The
                publication of information about successful cases or remedies does not guarantee similar results in
                your situation.
              </p>
              <p>
                Each case is unique and depends on specific facts, circumstances, applicable law, and the quality of
                legal representation. Past results do not guarantee future results. Only a qualified attorney can
                evaluate your specific situation and advise you on the likelihood of success.
              </p>
            </CardContent>
          </Card>

          {/* Finding Legal Representation */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Finding Legal Representation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-blue-900">
              <p>
                If you need legal representation, we recommend:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  Contacting your state bar association for referrals to qualified attorneys
                </li>
                <li>
                  Consulting with legal aid organizations if you cannot afford private representation
                </li>
                <li>
                  Asking for recommendations from trusted friends, family, or community organizations
                </li>
                <li>
                  Interviewing multiple attorneys to find one who is a good fit for your case
                </li>
                <li>
                  Ensuring the attorney is licensed to practice in your jurisdiction
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Acceptance and Navigation */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground italic">
            By using MISJustice Alliance resources and services, you acknowledge that you have read and understood this
            disclaimer and agree to its terms.
          </p>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
            <Link href="/resources">
              <Button>View Legal Resources</Button>
            </Link>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 pt-8 border-t text-xs text-muted-foreground">
          <p>Last Updated: November 2024</p>
          <p>
            This disclaimer is subject to change at any time. Please check this page periodically for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
