import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface StatisticsData {
  submissions?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    lastSubmitted?: Date;
  };
  updates?: {
    total: number;
    pendingApprovals: number;
    publishedUpdates: number;
  };
  files?: {
    total: number;
    totalSize: number;
    virusQuarantined: number;
  };
  profiles?: {
    total: number;
    totalViews: number;
    avgViews: number;
  };
  activity?: {
    totalLogs: number;
    lastActivity?: Date;
  };
}

interface CaseReportData {
  caseId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  urgencyLevel: number;
  jurisdiction: string;
  submittedAt: Date;
  victimName?: string;
  organizationName?: string;
  incidentDate?: Date;
  incidentLocation?: string;
  legalIssues: string[];
  desiredOutcome?: string;
  attachmentCount?: number;
}

/**
 * Generate a PDF report from statistics data
 */
export function generateStatisticsReport(stats: StatisticsData, reportDate?: Date): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFontSize(20);
  doc.text('MISJustice Alliance', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(14);
  doc.text('Statistics Report', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${(reportDate || new Date()).toLocaleString()}`, margin, yPosition);
  yPosition += 10;

  // Reset text color
  doc.setTextColor(0);

  // Summary Section
  doc.setFontSize(12);
  doc.text('Summary', margin, yPosition);
  yPosition += 8;

  const summaryData = [
    ['Metric', 'Value'],
    ['Total Submissions', stats.submissions?.total?.toString() || '0'],
    ['Pending Approvals', stats.submissions?.pending?.toString() || '0'],
    ['Approved Cases', stats.submissions?.approved?.toString() || '0'],
    ['Total Files Uploaded', stats.files?.total?.toString() || '0'],
    ['Files Quarantined', stats.files?.virusQuarantined?.toString() || '0'],
    ['Public Cases Published', stats.profiles?.total?.toString() || '0'],
    ['Total Case Views', stats.profiles?.totalViews?.toString() || '0'],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [25, 60, 90],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Case Updates Section
  if (stats.updates) {
    doc.setFontSize(12);
    doc.text('Case Updates', margin, yPosition);
    yPosition += 8;

    const updatesData = [
      ['Status', 'Count'],
      ['Total Updates', stats.updates.total?.toString() || '0'],
      ['Pending Approval', stats.updates.pendingApprovals?.toString() || '0'],
      ['Published', stats.updates.publishedUpdates?.toString() || '0'],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [updatesData[0]],
      body: updatesData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [25, 60, 90],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Activity Section
  if (stats.activity) {
    doc.setFontSize(12);
    doc.text('Activity', margin, yPosition);
    yPosition += 8;

    const activityData = [
      ['Metric', 'Value'],
      ['Total Activity Logs', stats.activity.totalLogs?.toString() || '0'],
      ['Last Activity', stats.activity.lastActivity 
        ? new Date(stats.activity.lastActivity).toLocaleString()
        : 'N/A'],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [activityData[0]],
      body: activityData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [25, 60, 90],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Generate a PDF report from case data
 */
export function generateCaseReport(caseData: CaseReportData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFontSize(18);
  doc.text('Case Report', margin, yPosition);
  yPosition += 10;

  // Case ID and Status
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Case ID: ${caseData.caseId}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Status: ${caseData.status}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Submitted: ${new Date(caseData.submittedAt).toLocaleDateString()}`, margin, yPosition);
  yPosition += 10;

  // Reset text color
  doc.setTextColor(0);

  // Case Information Section
  doc.setFontSize(12);
  doc.text('Case Information', margin, yPosition);
  yPosition += 8;

  const caseInfoData = [
    ['Field', 'Value'],
    ['Title', caseData.title],
    ['Category', caseData.category],
    ['Jurisdiction', caseData.jurisdiction],
    ['Urgency Level', `${caseData.urgencyLevel}/10`],
    ['Organization', caseData.organizationName || 'Not specified'],
    ['Incident Date', caseData.incidentDate 
      ? new Date(caseData.incidentDate).toLocaleDateString()
      : 'Not specified'],
    ['Incident Location', caseData.incidentLocation || 'Not specified'],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [caseInfoData[0]],
    body: caseInfoData.slice(1),
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [25, 60, 90],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: pageWidth - 2 * margin - 40 },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Description Section
  doc.setFontSize(12);
  doc.text('Case Description', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const descriptionLines = doc.splitTextToSize(caseData.description, pageWidth - 2 * margin);
  doc.text(descriptionLines, margin, yPosition);
  yPosition += descriptionLines.length * 6 + 10;

  // Legal Issues Section
  if (caseData.legalIssues && caseData.legalIssues.length > 0) {
    doc.setFontSize(12);
    doc.text('Legal Issues', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    caseData.legalIssues.forEach((issue) => {
      doc.text(`• ${issue}`, margin + 5, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
  }

  // Desired Outcome Section
  if (caseData.desiredOutcome) {
    doc.setFontSize(12);
    doc.text('Desired Outcome', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    const outcomeLines = doc.splitTextToSize(caseData.desiredOutcome, pageWidth - 2 * margin);
    doc.text(outcomeLines, margin, yPosition);
  }

  // Footer with disclaimer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'This report is confidential and for authorized use only.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Generate a PDF for case profile (public case)
 */
export function generateCaseProfilePDF(profileData: {
  title: string;
  description: string;
  organizationName: string;
  category: string;
  status: string;
  publishedAt: Date;
  viewCount: number;
  legalIssues?: string[];
}): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFontSize(18);
  doc.text('Public Case Profile', margin, yPosition);
  yPosition += 10;

  // Case Title
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(profileData.title, pageWidth - 2 * margin);
  doc.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 7 + 8;

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Organization: ${profileData.organizationName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Category: ${profileData.category}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Status: ${profileData.status}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Published: ${new Date(profileData.publishedAt).toLocaleDateString()}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Views: ${profileData.viewCount}`, margin, yPosition);
  yPosition += 10;

  // Reset text color
  doc.setTextColor(0);

  // Description
  doc.setFontSize(12);
  doc.text('Case Summary', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(profileData.description, pageWidth - 2 * margin);
  doc.text(descLines, margin, yPosition);
  yPosition += descLines.length * 6 + 10;

  // Legal Issues
  if (profileData.legalIssues && profileData.legalIssues.length > 0) {
    doc.setFontSize(12);
    doc.text('Legal Issues', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    profileData.legalIssues.forEach((issue) => {
      doc.text(`• ${issue}`, margin + 5, yPosition);
      yPosition += 6;
    });
  }

  // Disclaimer
  yPosition += 10;
  doc.setFontSize(9);
  doc.setTextColor(150);
  const disclaimerText = 'This case profile is provided for informational purposes only. It does not constitute legal advice. Always consult with a licensed attorney before taking any action.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 4);
  doc.text(disclaimerLines, margin + 2, yPosition);

  return Buffer.from(doc.output('arraybuffer'));
}
