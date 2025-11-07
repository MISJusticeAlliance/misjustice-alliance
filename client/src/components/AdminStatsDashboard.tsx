import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp, 
  Download, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { ExportStatisticsButton } from "./ExportStatisticsButton";

export function AdminStatsDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = trpc.adminStats.getDashboardStats.useQuery();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Statistics refreshed");
    } catch (error) {
      toast.error("Failed to refresh statistics");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
        <ExportStatisticsButton />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Case Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.submissions?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.submissions?.lastSubmitted 
                ? `Last: ${new Date(stats.submissions.lastSubmitted).toLocaleDateString()}`
                : "No submissions yet"}
            </p>
          </CardContent>
        </Card>

        {/* Case Updates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Updates</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats?.updates?.pendingApprovals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.updates?.total || 0} total updates
            </p>
          </CardContent>
        </Card>

        {/* Files Uploaded */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.files?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.files?.virusQuarantined || 0} quarantined
            </p>
          </CardContent>
        </Card>

        {/* Public Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.profiles?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.profiles?.totalViews || 0} total views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Case Updates Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Updates Status</CardTitle>
            <CardDescription>Overview of case update submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Pending Review</span>
              </div>
              <Badge variant="outline">{stats?.updates?.pendingApprovals || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Published</span>
              </div>
              <Badge variant="outline" className="bg-green-50">
                {stats?.updates?.publishedUpdates || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* File Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">File Security Status</CardTitle>
            <CardDescription>Virus scanning and security overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Total Files</span>
              </div>
              <Badge variant="outline">{stats?.files?.total || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Quarantined</span>
              </div>
              <Badge variant="outline" className="bg-red-50">
                {stats?.files?.virusQuarantined || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Total Size</span>
              </div>
              <Badge variant="outline">
                {stats?.files?.totalSize 
                  ? `${(stats.files.totalSize / 1024 / 1024).toFixed(2)} MB`
                  : "0 MB"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Summary</CardTitle>
          <CardDescription>System-wide activity metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Activity Logs</p>
              <p className="text-2xl font-bold">{stats?.activity?.totalLogs || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Activity</p>
              <p className="text-sm font-medium">
                {stats?.activity?.lastActivity
                  ? new Date(stats.activity.lastActivity).toLocaleString()
                  : "No activity"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg. Views/Case</p>
              <p className="text-2xl font-bold">{stats?.profiles?.avgViews || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
