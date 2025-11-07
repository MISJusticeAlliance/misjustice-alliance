import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Shield,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileIcon,
} from "lucide-react";
import { Link } from "wouter";

interface FileWithCase {
  id: number;
  originalName: string;
  encryptedFilename: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  checksumSha256: string;
  category: string;
  status: string;
  virusScanResult?: any;
  virusScanStatus?: string;
  uploadedAt: Date;
  caseId: number;
  accessCount: number;
}

export default function AdminFileReview() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileWithCase | null>(null);
  const [sortBy, setSortBy] = useState("uploadedAt");

  // Check admin access
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page. Admin access required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data for demonstration
  const mockFiles: FileWithCase[] = [
    {
      id: 1,
      originalName: "case_evidence_001.pdf",
      encryptedFilename: "1702345600000_a1b2c3d4.enc",
      fileType: "pdf",
      mimeType: "application/pdf",
      fileSize: 2500000,
      checksumSha256: "abc123def456",
      category: "EVIDENCE",
      status: "CLEAN",
      virusScanStatus: "CLEAN",
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      caseId: 1,
      accessCount: 3,
    },
    {
      id: 2,
      originalName: "witness_statement.docx",
      encryptedFilename: "1702432000000_e5f6g7h8.enc",
      fileType: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 1200000,
      checksumSha256: "def456ghi789",
      category: "WITNESS_STATEMENTS",
      status: "PROCESSING",
      virusScanStatus: "PENDING",
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      caseId: 2,
      accessCount: 1,
    },
    {
      id: 3,
      originalName: "correspondence.zip",
      encryptedFilename: "1702518400000_i9j0k1l2.enc",
      fileType: "zip",
      mimeType: "application/zip",
      fileSize: 5000000,
      checksumSha256: "ghi789jkl012",
      category: "CORRESPONDENCE",
      status: "SUSPICIOUS",
      virusScanStatus: "SUSPICIOUS",
      uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      caseId: 3,
      accessCount: 0,
    },
    {
      id: 4,
      originalName: "legal_documents.pdf",
      encryptedFilename: "1702604800000_m3n4o5p6.enc",
      fileType: "pdf",
      mimeType: "application/pdf",
      fileSize: 3200000,
      checksumSha256: "jkl012mno345",
      category: "LEGAL_DOCUMENTS",
      status: "CLEAN",
      virusScanStatus: "CLEAN",
      uploadedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      caseId: 4,
      accessCount: 5,
    },
  ];

  // Filter and search
  const filteredFiles = useMemo(() => {
    return mockFiles.filter((file) => {
      const matchesSearch =
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.caseId.toString().includes(searchQuery);

      const matchesStatus = !filterStatus || file.status === filterStatus;
      const matchesCategory = !filterCategory || file.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, filterStatus, filterCategory]);

  // Sort files
  const sortedFiles = useMemo(() => {
    const sorted = [...filteredFiles];
    switch (sortBy) {
      case "uploadedAt":
        return sorted.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      case "fileSize":
        return sorted.sort((a, b) => b.fileSize - a.fileSize);
      case "status":
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return sorted;
    }
  }, [filteredFiles, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CLEAN":
        return <Badge className="bg-green-600">✓ Clean</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-600">⟳ Processing</Badge>;
      case "SUSPICIOUS":
        return <Badge className="bg-orange-600">⚠ Suspicious</Badge>;
      case "INFECTED":
        return <Badge className="bg-red-600">✕ Infected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CLEAN":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "PROCESSING":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "SUSPICIOUS":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "INFECTED":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileIcon className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: mockFiles.length,
    clean: mockFiles.filter((f) => f.status === "CLEAN").length,
    processing: mockFiles.filter((f) => f.status === "PROCESSING").length,
    suspicious: mockFiles.filter((f) => f.status === "SUSPICIOUS").length,
    infected: mockFiles.filter((f) => f.status === "INFECTED").length,
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">File Review Dashboard</h1>
          <p className="text-muted-foreground">
            Review and approve uploaded case files with comprehensive security scanning
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total Files</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.clean}</div>
                <p className="text-sm text-muted-foreground">Clean</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.processing}</div>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.suspicious}</div>
                <p className="text-sm text-muted-foreground">Suspicious</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.infected}</div>
                <p className="text-sm text-muted-foreground">Infected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Files List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Files</CardTitle>
                <CardDescription>
                  {sortedFiles.length} file{sortedFiles.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="space-y-4 mb-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by filename or case ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Status:</span>
                    </div>
                    <Button
                      variant={filterStatus === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(null)}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === "CLEAN" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("CLEAN")}
                    >
                      Clean
                    </Button>
                    <Button
                      variant={filterStatus === "PROCESSING" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("PROCESSING")}
                    >
                      Processing
                    </Button>
                    <Button
                      variant={filterStatus === "SUSPICIOUS" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus("SUSPICIOUS")}
                    >
                      Suspicious
                    </Button>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border rounded px-2 py-1 bg-background"
                    >
                      <option value="uploadedAt">Recently Uploaded</option>
                      <option value="fileSize">File Size</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>

                {/* Files List */}
                <div className="space-y-3">
                  {sortedFiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No files found matching your filters</p>
                    </div>
                  ) : (
                    sortedFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-accent ${
                          selectedFile?.id === file.id ? "bg-accent border-primary" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">{getStatusIcon(file.status)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {file.originalName}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>Case #{file.caseId}</span>
                                <span>•</span>
                                <span>{formatFileSize(file.fileSize)}</span>
                                <span>•</span>
                                <span>{formatDate(file.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {getStatusBadge(file.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Details Panel */}
          <div>
            {selectedFile ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Name */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Filename</p>
                    <p className="text-sm font-medium text-foreground break-all">
                      {selectedFile.originalName}
                    </p>
                  </div>

                  {/* Case ID */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Case ID</p>
                    <p className="text-sm font-medium text-foreground">#{selectedFile.caseId}</p>
                  </div>

                  {/* Category */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Category</p>
                    <Badge variant="outline">{selectedFile.category}</Badge>
                  </div>

                  {/* File Type */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">File Type</p>
                    <p className="text-sm font-medium text-foreground uppercase">{selectedFile.fileType}</p>
                  </div>

                  {/* File Size */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">File Size</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatFileSize(selectedFile.fileSize)}
                    </p>
                  </div>

                  {/* Upload Date */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Upload Date
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(selectedFile.uploadedAt)}
                    </p>
                  </div>

                  {/* Access Count */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Access Count</p>
                    <p className="text-sm font-medium text-foreground">{selectedFile.accessCount}</p>
                  </div>

                  {/* Virus Scan Status */}
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1 mb-2">
                      <Shield className="w-3 h-3" /> Virus Scan
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedFile.virusScanStatus || "PENDING")}
                      {getStatusBadge(selectedFile.virusScanStatus || "PENDING")}
                    </div>
                  </div>

                  {/* Checksum */}
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground uppercase">SHA-256</p>
                    <p className="text-xs font-mono text-foreground break-all bg-muted p-2 rounded">
                      {selectedFile.checksumSha256}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t space-y-2">
                    <Button variant="default" className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview File
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    {selectedFile.status === "SUSPICIOUS" && (
                      <>
                        <Button variant="destructive" className="w-full" size="sm">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Quarantine
                        </Button>
                        <Button variant="outline" className="w-full" size="sm">
                          Approve Anyway
                        </Button>
                      </>
                    )}
                    {selectedFile.status === "CLEAN" && (
                      <Button variant="default" className="w-full" size="sm" disabled>
                        ✓ Already Approved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select a file to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
