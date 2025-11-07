import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SubmitCase from "./pages/SubmitCase";
import TrackCase from "./pages/TrackCase";
import Resources from "./pages/Resources";
import AdminDashboard from "./pages/AdminDashboard";
import CaseGallery from "./pages/CaseGallery";
import CaseDetail from "./pages/CaseDetail";
import PublicizeCase from "./pages/PublicizeCase";
import NotificationSettings from "./pages/NotificationSettings";
import AdminFileReview from "./pages/AdminFileReview";
import Disclaimer from "./pages/Disclaimer";
import Mission from "./pages/Mission";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import PasswordReset from "./pages/PasswordReset";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/mission"} component={Mission} />
      <Route path={"/submit"} component={SubmitCase} />
      <Route path={"/track-case"} component={TrackCase} />
      <Route path={"/resources"} component={Resources} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/file-review" component={AdminFileReview} />
      <Route path={"/case-gallery"} component={CaseGallery} />
      <Route path={"/case/:slug"} component={CaseDetail} />
      <Route path={"/publicize-case"} component={PublicizeCase} />
      <Route path="/notification-settings" component={NotificationSettings} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/contact" component={Contact} />
      <Route path="/profile" component={Profile} />
      <Route path="/password-reset" component={PasswordReset} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
