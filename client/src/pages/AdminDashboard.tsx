import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { AdminStatsDashboard } from "@/components/AdminStatsDashboard";
import { AdminFileDownload } from "@/components/AdminFileDownload";
import { SessionTimeoutSettings } from "@/components/SessionTimeoutSettings";
import { useSessionTimeout } from "@/_core/hooks/useSessionTimeout";
import { useState } from "react";

export default function AdminDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth({ redirectOnUnauthenticated: true });
  useSessionTimeout(); // Initialize session timeout tracking
  const [, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: submissions, isLoading: submissionsLoading, refetch } = trpc.submissions.getAll.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const updateStatus = trpc.submissions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Redirect if not authenticated or not admin
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredSubmissions = submissions?.filter((sub) => {
    if (!selectedStatus) return true;
    return sub.status === selectedStatus;
  });

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
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">MISJustice Alliance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cases">All Cases</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="files">File Downloads</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <Link href="/admin/file-review">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                File Review
              </Button>
            </Link>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.totalSubmissions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">All time submissions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Cases</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {statsLoading ? "..." : stats?.newSubmissions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {statsLoading ? "..." : stats?.inProgress || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Active cases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {statsLoading ? "..." : stats?.resolved || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Successfully closed</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest case submissions requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : filteredSubmissions && filteredSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSubmissions.slice(0, 5).map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{submission.title}</h4>
                            <Badge className={`${getStatusColor(submission.status)} text-white text-xs`}>
                              {getStatusLabel(submission.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Case ID: {submission.caseId}</span>
                            <span>•</span>
                            <span>{submission.category.replace(/_/g, " ")}</span>
                            <span>•</span>
                            <span>{submission.jurisdiction}</span>
                            <span>•</span>
                            <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link href={`/admin/case/${submission.id}`}>
                          <Button asChild variant="outline" size="sm">
                            <span>View Details</span>
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No cases found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Cases Tab */}
          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Cases</CardTitle>
                    <CardDescription>Manage and review all case submissions</CardDescription>
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="AWAITING_INFO">Awaiting Info</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : filteredSubmissions && filteredSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {filteredSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{submission.title}</h4>
                            <Badge className={`${getStatusColor(submission.status)} text-white text-xs`}>
                              {getStatusLabel(submission.status)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Urgency: {submission.urgencyLevel}/10
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {submission.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>ID: {submission.caseId}</span>
                            <span>•</span>
                            <span>{submission.category.replace(/_/g, " ")}</span>
                            <span>•</span>
                            <span>{submission.jurisdiction}</span>
                            <span>•</span>
                            <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Select
                            value={submission.status}
                            onValueChange={(value) => {
                              updateStatus.mutate({ id: submission.id, status: value as any });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">New</SelectItem>
                              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="AWAITING_INFO">Awaiting Info</SelectItem>
                              <SelectItem value="RESOLVED">Resolved</SelectItem>
                              <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Link href={`/track-case?caseId=${submission.caseId}`}>
                            <Button asChild variant="outline" size="sm">
                              <span>View</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No cases found with selected filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Cases by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.byCategory && Object.keys(stats.byCategory).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(stats.byCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{category.replace(/_/g, " ")}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${((count as number) / (stats.totalSubmissions || 1)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-8 text-right">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Cases by Jurisdiction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.byJurisdiction && Object.keys(stats.byJurisdiction).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(stats.byJurisdiction).map(([jurisdiction, count]) => (
                        <div key={jurisdiction} className="flex items-center justify-between">
                          <span className="text-sm">{jurisdiction}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-secondary"
                                style={{
                                  width: `${((count as number) / (stats.totalSubmissions || 1)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-8 text-right">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Statistics</CardTitle>
                <CardDescription>Comprehensive overview of case submissions and content updates</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminStatsDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Downloads Tab */}
          <TabsContent value="files" className="space-y-6">
            <AdminFileDownload />
          </TabsContent>
          <TabsContent value="settings" className="space-y-6">
            <SessionTimeoutSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
