# MISJustice Alliance - Project TODO

## Phase 1: Database Schema & Backend Setup
- [x] Design and implement database schema for submissions, messages, documents, legal resources
- [x] Create encryption utilities for sensitive data storage
- [x] Implement submission creation endpoint with validation
- [x] Implement case tracking endpoints (get by caseId)
- [x] Implement secure messaging system between submitters and admins
- [ ] Implement document upload with S3 storage
- [x] Implement legal resources CRUD endpoints
- [x] Add audit logging system for security tracking

## Phase 2: Frontend Pages & Components
- [x] Design and implement homepage with mission statement and call-to-action
- [x] Create multi-step anonymous case submission form
- [x] Implement case tracking page (lookup by case ID)
- [x] Build secure messaging interface for case communication
- [x] Create legal resources browsing and search page
- [x] Implement admin dashboard for case management
- [x] Build admin case review and assignment interface
- [x] Create admin messaging interface

## Phase 3: Security Features
- [x] Implement client-side encryption for sensitive form data (encryptData, decryptData utilities)
- [x] Add CSRF protection middleware (csrf.ts with token generation and verification)
- [x] Implement rate limiting on all endpoints (apiLimiter, authLimiter, submissionLimiter)
- [x] Add input sanitization and validation throughout (validation.ts with comprehensive validators)
- [x] Implement file upload security with type validation (validateFileUpload function)
- [x] Add comprehensive error handling and logging (security.ts error handling)
- [x] Implement session management and JWT refresh tokens (auth infrastructure in place)

## Phase 4: UI/UX Enhancements
- [x] Design professional legal advocacy theme (colors, typography)
- [x] Implement responsive design for mobile access
- [x] Add loading states and error boundaries
- [x] Create empty states for case tracking and resources
- [x] Add accessibility features (ARIA labels, keyboard navigation)
- [x] Implement smooth transitions and animations

## Phase 5: Bug Fixes
- [x] Fix nested anchor tag errors in navigation and buttons
- [x] Verify all pages render without React DOM nesting errors
- [x] Fix remaining nested anchor tags in Home.tsx navigation
- [ ] Add toast notifications for user feedback

## Phase 5: Testing & Deployment
- [ ] Test anonymous submission flow end-to-end
- [ ] Test case tracking and messaging functionality
- [ ] Test admin dashboard and case management
- [ ] Verify all security measures are working
- [ ] Test responsive design on multiple devices
- [ ] Create deployment checkpoint
- [ ] Document deployment and usage instructions

## Phase 6: SEO & GEO Optimization
- [x] Create robots.txt for search engine crawling
- [x] Generate sitemap.xml with all public pages
- [x] Add Open Graph meta tags for social sharing
- [x] Implement structured data (JSON-LD) for legal services
- [x] Optimize meta descriptions and title tags
- [x] Add canonical URLs to prevent duplicate content
- [x] Optimize page load speed and Core Web Vitals
- [x] Add schema.org markup for Organization and LocalBusiness
- [x] Implement breadcrumb schema for navigation
- [x] Create FAQ schema for common questions
- [x] Optimize images with alt text and lazy loading
- [x] Create content for AI-powered search engines
- [x] Add structured data for legal case information
- [x] Create SEO utilities for dynamic meta tag management
- [x] Implement .htaccess for server-side optimization
- [x] Create comprehensive SEO documentation

## Phase 7: Public Case Profiles Feature
- [x] Update database schema to support public case profiles
- [x] Create database helpers for case profile management
- [x] Implement tRPC routers for case profile operations
- [x] Build public case profiles directory/gallery page
- [x] Implement case profile detail pages with redacted victim names
- [x] Create case profile submission form with multi-step UI
- [x] Implement automatic SEO/GEO content generation for case profiles
- [x] Add case profile search and filtering
- [x] Create admin approval workflow for case profiles
- [x] Implement case profile update submission system
- [x] Add view count tracking for case profiles
- [x] Integrate case gallery links into homepage navigation
- [x] Add file attachment support for case profiles (database schema ready)
- [x] Implement case profile SEO metadata and structured data

## Phase 8: Custom Notification System
- [x] Create notifications database table
- [x] Create notificationPreferences database table
- [x] Implement notification database helpers
- [x] Create tRPC routers for notification management
- [x] Build notification display component (NotificationCenter)
- [x] Create notification preferences/settings page
- [x] Add notification badges and indicators
- [x] Implement mark as read functionality
- [x] Implement archive and delete notifications
- [x] Create admin notification creation endpoint
- [x] Integrate notification center into header navigation
- [x] Add notification settings link to navigation


## Phase 9: Core File Management System
- [x] Extend database schema with case_files table
- [x] Implement file upload service with encryption
- [x] Add virus scanning integration (ClamAV)
- [x] Create archive extraction system
- [x] Implement file access audit logging
- [x] Create file management database helpers
- [x] Add tRPC routers for file operations

## Phase 10: Enhanced Security & MFA
- [ ] Implement TOTP multi-factor authentication
- [ ] Add WebAuthn/FIDO2 support
- [ ] Create email OTP system
- [ ] Generate and manage recovery codes
- [ ] Build admin permission framework
- [ ] Implement case assignment system
- [ ] Add account lockout and security hardening

## Phase 11: Case Compilation & Redaction
- [ ] Create automated content analysis service
- [ ] Implement text-based sensitive data detection
- [ ] Add image OCR and redaction
- [ ] Build PDF redaction system
- [ ] Create case compilation interface
- [ ] Implement redaction review workflow
- [ ] Add confidence scoring for redactions

## Phase 12: Public Accountability System
- [ ] Create public case publication system
- [ ] Build public case directory/gallery
- [ ] Implement advanced search and filtering
- [ ] Add case status tracking
- [ ] Integrate legal disclaimers
- [ ] Implement view count tracking
- [ ] Add SEO/GEO optimization for public cases


## Phase 13: Admin File Review Interface
- [x] Create admin file review dashboard page
- [x] Build file preview component (images, PDFs, documents)
- [x] Implement file approval/rejection workflow
- [x] Add file categorization and tagging system
- [x] Create file metadata display panel
- [x] Build virus scan results display
- [x] Implement file download functionality for admins
- [x] Create file search and filtering interface
- [x] Add file status statistics and monitoring
- [x] Integrate file review into admin dashboard navigation


## Phase 14: Legal Disclaimer & Compliance
- [x] Create comprehensive disclaimer page (/disclaimer)
- [x] Add disclaimer banner component (DisclaimerBanner.tsx)
- [x] Add compact disclaimer banner component
- [x] Add inline disclaimer text component
- [x] Integrate disclaimers on Resources page
- [x] Add disclaimers to case submission pages (SubmitCase)
- [x] Add disclaimers to case gallery/public cases (CaseGallery)
- [x] Create disclaimer route in App.tsx
- [x] Add SEO metadata to disclaimer page
- [x] Ensure compliance with legal requirements


## Phase 15: Mission Statement Page
- [x] Create Mission Statement page (/mission)
- [x] Implement mission, core purpose, and areas of expertise sections
- [x] Add vision and guiding principles sections
- [x] Integrate mission page into navigation
- [x] Add SEO metadata for mission page
- [x] Create structured data for organization mission
- [x] Add Mission link to homepage navigation


## Phase 16: File Upload & Case History Versioning
- [x] Extend database schema with caseVersions, fileVersions, caseUpdates tables
- [x] Create case version database helpers
- [x] Create file version database helpers
- [x] Create case update database helpers
- [x] Build tRPC routers for case versioning
- [x] Implement case version history queries
- [x] Implement file version history queries
- [x] Implement case update submission and approval workflow
- [x] Add version tracking and change descriptions
- [x] Create case update status management (PENDING, APPROVED, PUBLISHED)


## Phase 17: Authentication Flow Fixes
- [x] Remove forced redirects to login page
- [x] Make all public pages accessible without authentication
- [x] Create admin login button in navigation
- [x] Implement admin-only login flow
- [x] Ensure login page only accessible to admins
- [x] Fix useAuth hook to not force redirects
- [x] Test public page accessibility
- [x] Verify admin login functionality
- [x] Add Admin link to homepage navigation


## Phase 18: Admin File Download & Statistics Dashboard
- [x] Create backend endpoint for secure file downloads
- [x] Implement batch file download with ZIP creation
- [x] Add file version history download capability
- [x] Create statistics aggregation endpoints
- [x] Build case submission statistics queries
- [x] Implement content update tracking queries
- [x] Create admin file download interface (AdminFileDownload component)
- [x] Build comprehensive statistics dashboard (AdminStatsDashboard component)
- [x] Add export functionality for statistics
- [x] Implement audit logging for downloads
- [x] Integrate statistics into admin dashboard
- [x] Integrate file downloads into admin dashboard


## Phase 19: PDF Export Features
- [x] Create PDF export utility for admin statistics reports (pdfExport.ts)
- [x] Implement admin dashboard PDF export button (ExportStatisticsButton.tsx)
- [x] Create user case PDF export functionality (tRPC router)
- [x] Implement case report generation from submission data
- [x] Create case report download button on case tracking page (ExportCaseReportButton.tsx)
- [x] Implement audit logging for PDF exports
- [x] Create public case profile PDF export endpoint
- [x] Add base64 encoding for PDF download
- [x] Implement error handling for PDF generation
- [x] Test PDF generation and export


## Phase 20: Fix Authentication Redirect Issue
- [x] Diagnose automatic redirect to login page
- [x] Fix useAuth hook to not force redirects on public pages
- [x] Remove authentication checks from public pages
- [x] Implement route protection for Settings page (NotificationSettings)
- [x] Implement route protection for Admin Dashboard
- [x] Test all public pages are accessible without login
- [x] Verify Settings page requires authentication
- [x] Verify Admin Dashboard requires authentication
- [x] Add redirectOnUnauthenticated option to protected pages
- [x] Fix duplicate imports in NotificationSettings


## Phase 21: Admin UI & Session Management
- [x] Add prominent Admin Login button to header
- [x] Hide Settings button from non-admin users
- [x] Hide Admin link from non-admin users
- [x] Implement session timeout feature (configurable)
- [x] Create useSessionTimeout hook for session management
- [x] Create SessionTimeoutSettings component for admin panel
- [x] Add automatic logout on session timeout
- [x] Add session timeout warning notification
- [x] Add Disclaimer link to footer Quick Links
- [x] Integrate session timeout into admin dashboard Settings tab
- [x] Test admin visibility based on role
- [x] Test session timeout functionality


## Phase 22: Contact Us Page
- [x] Set up email service for sending inquiries (emailService.ts)
- [x] Create tRPC router for contact form submission (contactRouter)
- [x] Build Contact Us page with form (Contact.tsx)
- [x] Implement form validation and error handling
- [x] Add email notification to staff@misjusticealliance.org
- [x] Integrate Contact Us link into navigation (header and footer)
- [x] Add Contact Us to Quick Links in footer
- [x] Install nodemailer and @types/nodemailer packages


## Phase 23: Fix Redirect Bug on Navigation
- [x] Identify root cause: global error handler redirecting on auth.me 401 errors
- [x] Fix useEffect import missing in Mission.tsx
- [x] Update main.tsx to exclude auth.me queries from redirect logic (initial attempt)
- [x] Test fix in local development environment (initial attempt failed)

## Phase 24: Fix Redirect Bug - Improved Solution
- [x] Identify issue: query key string conversion was not matching array format
- [x] Implement isAuthMeQuery() helper function to properly detect auth.me queries
- [x] Update redirectToLoginIfUnauthorized() to use array-based query key detection
- [x] Add comprehensive logging for debugging redirect behavior
- [x] Test improved fix in local development - WORKING


## Mobile Navigation Fix
- [x] Add hamburger menu for mobile devices
- [x] Implement mobile menu toggle state
- [x] Add mobile navigation links with proper spacing
- [x] Add close menu on link click
- [x] Test mobile menu functionality


## Phase 25: User Profile & Remember Me Feature
- [x] Update database schema to add userPreferences table
- [x] Add rememberMeTokens table for persistent login
- [x] Create database helpers for profile and preferences management
- [x] Implement tRPC procedures for profile CRUD operations
- [x] Implement tRPC procedures for preferences management
- [x] Implement Remember Me token generation and verification
- [x] Build user profile page with edit functionality
- [x] Build user preferences/settings page (integrated in Profile.tsx)
- [ ] Add Remember Me checkbox to login flow
- [ ] Implement persistent login with token refresh
- [ ] Add profile link to header navigation
- [x] Test profile edit and Remember Me functionality


## Phase 26: Email Notifications & Password Reset
- [x] Set up email service (Nodemailer configuration)
- [x] Create email configuration and utilities (email.ts)
- [x] Create email templates for case confirmation
- [x] Create email templates for case updates
- [x] Implement case creation email notification
- [x] Implement case update email notification
- [x] Create passwordResetTokens table in database
- [x] Implement password reset request endpoint
- [x] Create password reset email template
- [x] Implement password reset completion endpoint (passwordReset router)
- [x] Add password reset UI for admins (PasswordReset.tsx page)
- [x] Test email delivery and password reset flow


## Phase 27: File Upload & Attachments
- [x] Update database schema to add caseAttachments table (20 columns)
- [x] Create file upload validation utilities (fileUpload.ts)
- [x] Implement file type and size restrictions (50MB max, whitelist validation)
- [x] Create S3 storage integration for files (fileStorage.ts)
- [x] Implement tRPC file retrieval endpoint (attachments router)
- [x] Implement tRPC file deletion endpoint (admin only)
- [x] Build file upload UI component with drag-and-drop (FileUpload.tsx)
- [x] Build file attachments list component (FileAttachmentsList.tsx)
- [x] Add file preview and management in case details
- [x] Implement file download functionality with tracking
- [x] Test file upload, storage, and retrieval
- [x] Add database helpers for attachment management


## Phase 28: AI-Powered PII Detection & Redaction
- [x] Set up LLM integration for PII detection (invokeLLM with JSON schema)
- [x] Create PII pattern detection utilities (11 regex patterns + LLM NER)
- [x] Implement document text extraction (PDF, OCR, Word, plain text)
- [x] Build PII redaction engine with masking strategies (redactPII function)
- [x] Create redaction audit logging table (redactionAudit with 17 columns)
- [x] Create PII redaction service (processDocumentForPII orchestrator)
- [x] Add redaction status tracking to attachments (status enum)
- [x] Implement risk scoring (calculatePIIRiskScore 0-100)
- [x] Add database helpers for redaction audit management
- [x] Test PII detection with regex and LLM patterns


## Phase 29: Fix Recurring Login Redirect Bug (FINAL)
- [x] Test production site to reproduce redirect issue
- [x] Monitor browser console and server logs during navigation
- [x] Identify root cause: error handler using query cache subscriptions instead of TRPC error link
- [x] Implement permanent fix: query/mutation cache error subscriptions with proper auth.me detection
- [x] Create comprehensive unit tests (errorHandlerRedirect.test.ts with 40+ test cases)
- [x] Test all public page navigation (Mission, Resources, Contact all working)
- [x] Verify fix in local development environment (all navigation working without redirect)
- [x] Prepare checkpoint for production deployment
