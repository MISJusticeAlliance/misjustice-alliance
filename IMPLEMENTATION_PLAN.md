# MISJustice Alliance - Public Accountability & Case Management Implementation Plan

## Executive Summary

This document outlines the design and implementation strategy for extending the MISJustice Alliance platform with advanced case management, file handling, and public accountability features. The implementation prioritizes security, victim privacy, and institutional accountability.

---

## Phase 1: Core File Management System (Priority: CRITICAL)

### 1.1 Database Schema Extensions

**New Tables Required:**
- `case_files` - Store uploaded files with encryption metadata
- `archive_extractions` - Track archive processing operations
- `file_access_log` - Audit trail for file access
- `file_virus_scans` - Store virus scan results and history
- `file_categories` - File categorization system

**Key Fields:**
- Encrypted filename storage (original name encrypted)
- File checksum (SHA-256) for integrity verification
- Virus scan results (JSONB for flexible storage)
- Access count and last accessed timestamp
- Parent archive reference for extracted files

### 1.2 File Upload Service

**Implementation Components:**
1. **Upload Handler**
   - Multipart form data processing
   - File type validation (MIME type + extension check)
   - File size validation (100MB limit)
   - Rate limiting (10 uploads/hour per user)

2. **Encryption Service**
   - AES-256 encryption for file storage
   - Secure key management
   - Encrypted filename generation

3. **Virus Scanning Integration**
   - ClamAV integration for malware detection
   - Real-time scanning on upload
   - Quarantine system for suspicious files
   - Scan result logging

4. **Archive Processing**
   - ZIP, TAR, TAR.GZ, TAR.BZ2 support
   - Secure extraction to isolated directory
   - Individual file scanning post-extraction
   - Metadata preservation

### 1.3 File Management Dashboard

**User Features:**
- View all uploaded files with metadata
- Organize files by category (Evidence, Correspondence, Legal Documents, Witness Statements, Media)
- Download/preview files
- Delete files (with confirmation)
- Upload history timeline
- Storage usage tracking

**Admin Features:**
- View all case files across platform
- File access audit logs
- Quarantine management
- Bulk file operations

---

## Phase 2: Enhanced Security & Authentication

### 2.1 Multi-Factor Authentication (MFA)

**Supported Methods:**
1. **TOTP (Time-based One-Time Password)**
   - Google Authenticator, Authy support
   - QR code generation
   - Backup codes (10 codes generated)

2. **WebAuthn/FIDO2**
   - Hardware security keys
   - Biometric authentication
   - Platform authenticators

3. **Email OTP**
   - One-time passcodes via email
   - 10-minute expiration

4. **Recovery Codes**
   - 10 backup codes per user
   - One-time use only
   - Stored hashed in database

### 2.2 Admin Permission System

**Permission Levels:**
1. **Super Admin** - Full platform access
2. **Case Manager** - Can view/edit assigned cases
3. **Reviewer** - Can review and approve publications
4. **Analyst** - Can analyze and compile cases
5. **Auditor** - Read-only access for compliance

**Granular Permissions:**
- Case viewing/editing/deletion
- File access levels
- Publication rights
- User management
- System administration
- Audit log access

### 2.3 Security Hardening

**Implementation:**
- Account lockout after 10 failed attempts (30-minute lockout)
- Progressive delays between failed attempts
- Session timeout (2 hours of inactivity)
- IP-based anomaly detection
- Password complexity requirements (12+ chars, mixed case, numbers, special chars)
- Password rotation (90 days)
- Last 12 passwords prevented from reuse

---

## Phase 3: Case Compilation & Redaction System

### 3.1 Automated Content Analysis

**Text Analysis:**
- Named entity recognition (NER) for person names
- Regular expressions for:
  - Phone numbers
  - Email addresses
  - Social Security numbers
  - Street addresses
  - Date of birth patterns
- Confidence scoring for matches

**Image Analysis:**
- OCR extraction from images
- Text detection and redaction
- Sensitive pattern identification

**PDF Processing:**
- Text layer extraction
- Image layer analysis
- Visual redaction overlay

### 3.2 Redaction Planning

**Redaction Types:**
1. **Automatic** - High-confidence sensitive data matches
2. **Manual Review** - Medium-confidence matches requiring human verification
3. **Contextual** - Redactions based on document structure understanding

**Redaction Workflow:**
1. System analyzes content
2. Generates redaction plan with confidence scores
3. Admin reviews and adjusts redactions
4. Redaction applied to copy (original preserved)
5. Redacted version ready for publication

### 3.3 Case Compilation Interface

**Admin Compilation Features:**
- Evidence summary (document count, image count, etc.)
- Timeline construction (chronological organization)
- Legal analysis tools
- Public interest assessment
- Redaction planning and review
- Multi-stage approval workflow

---

## Phase 4: Public Accountability System

### 4.1 Public Case Publication

**Publication Workflow:**
1. Admin compiles case with evidence summary
2. Automated redaction analysis
3. Manual redaction review
4. Preview generation
5. Admin approval
6. Publication to public directory

**Public Case Display:**
- Case title and summary
- Alleged violations (categorized)
- Alleged institutions (with contact info)
- Case status and timeline
- Evidence preview (redacted)
- Legal context and disclaimers
- View count tracking

### 4.2 Public Accountability Directory

**Features:**
- Browse all published cases
- Search by:
  - Institution name
  - Violation type
  - Jurisdiction
  - Date range
- Filter by status (Ongoing, Resolved, etc.)
- Sort by relevance, date, views
- Case detail pages with full content

### 4.3 Legal Disclaimers & Compliance

**Required Disclaimers:**
- Not legal advice notice
- Seek professional representation
- Alleged information notice
- Victim protection statement
- Public interest mission statement

---

## Technical Implementation Details

### Database Schema (MySQL/TiDB)

```sql
-- File Management
CREATE TABLE case_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  encrypted_filename VARCHAR(255) UNIQUE NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  category ENUM('evidence', 'correspondence', 'legal_documents', 'witness_statements', 'media', 'other'),
  status ENUM('processing', 'scanned', 'clean', 'suspicious', 'infected', 'archived'),
  virus_scan_result JSON,
  parent_archive_id INT,
  extraction_path TEXT,
  access_count INT DEFAULT 0,
  last_accessed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES submissions(id),
  FOREIGN KEY (parent_archive_id) REFERENCES case_files(id)
);

-- Archive Processing
CREATE TABLE archive_extractions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  archive_file_id INT NOT NULL,
  extraction_status ENUM('pending', 'processing', 'completed', 'failed'),
  extracted_files_count INT DEFAULT 0,
  extraction_log JSON,
  extraction_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (archive_file_id) REFERENCES case_files(id)
);

-- File Access Audit
CREATE TABLE file_access_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL,
  user_id INT NOT NULL,
  access_type ENUM('view', 'download', 'delete', 'share'),
  ip_address VARCHAR(45),
  user_agent TEXT,
  access_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES case_files(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- MFA Methods
CREATE TABLE user_mfa_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  method_type ENUM('totp', 'webauthn', 'email_otp', 'recovery_codes'),
  method_data JSON NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  setup_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP,
  use_count INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Recovery Codes
CREATE TABLE user_recovery_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Admin Permissions
CREATE TABLE admin_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  permission_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INT,
  granted_by INT NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (granted_by) REFERENCES users(id)
);

-- Case Assignments
CREATE TABLE case_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  admin_id INT NOT NULL,
  assignment_type ENUM('primary', 'reviewer', 'analyst'),
  access_level ENUM('view', 'edit', 'publish'),
  assigned_by INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES submissions(id),
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Public Cases
CREATE TABLE public_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  publication_date TIMESTAMP,
  title VARCHAR(500) NOT NULL,
  summary TEXT NOT NULL,
  redacted_content LONGTEXT,
  alleged_institutions JSON NOT NULL,
  violation_types JSON NOT NULL,
  legal_context TEXT,
  publication_status ENUM('draft', 'pending_approval', 'published', 'archived'),
  compiled_by INT NOT NULL,
  approved_by INT,
  approval_timestamp TIMESTAMP,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES submissions(id),
  FOREIGN KEY (compiled_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Redaction Plans
CREATE TABLE redaction_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  file_id INT,
  redaction_type ENUM('text', 'image', 'pdf'),
  sensitive_data_matches JSON NOT NULL,
  redaction_coordinates JSON,
  automated_confidence DECIMAL(5,4),
  manual_review_status ENUM('pending', 'approved', 'rejected'),
  reviewed_by INT,
  review_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES submissions(id),
  FOREIGN KEY (file_id) REFERENCES case_files(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

### Backend Implementation (tRPC Routers)

**Key Routers:**
1. `files` - File upload, download, delete, listing
2. `archives` - Archive extraction and processing
3. `cases` - Case compilation and management
4. `redaction` - Redaction planning and execution
5. `publicCases` - Public case publication
6. `mfa` - Multi-factor authentication setup/verification
7. `adminPermissions` - Permission management

### Frontend Pages

**User Pages:**
- `/case-files/{caseId}` - File management dashboard
- `/case-files/upload` - File upload interface
- `/case-files/{fileId}` - File detail/preview

**Admin Pages:**
- `/admin/case-compilation` - Case compilation interface
- `/admin/redaction-review` - Redaction review and approval
- `/admin/public-cases` - Manage public case publications
- `/admin/permissions` - User permission management
- `/admin/file-audit` - File access audit logs

**Public Pages:**
- `/public-cases` - Public case directory
- `/public-cases/{caseId}` - Public case detail
- `/accountability` - Accountability dashboard

---

## Implementation Priority & Phases

### Phase 1 (Weeks 1-3): Core File Management
- [ ] Database schema for file management
- [ ] File upload with virus scanning
- [ ] Archive extraction system
- [ ] File management dashboard

### Phase 2 (Weeks 4-6): Security & Authentication
- [ ] MFA system (TOTP, WebAuthn, Email OTP)
- [ ] Admin permission framework
- [ ] Security hardening
- [ ] Audit logging

### Phase 3 (Weeks 7-9): Case Compilation & Redaction
- [ ] Automated content analysis
- [ ] Redaction planning system
- [ ] Case compilation interface
- [ ] Redaction review workflow

### Phase 4 (Weeks 10-12): Public Accountability
- [ ] Public case publication
- [ ] Public case directory
- [ ] Legal disclaimers
- [ ] Performance optimization

---

## Security Considerations

1. **Data Encryption**
   - AES-256 for files at rest
   - TLS 1.3 for data in transit
   - Encrypted filenames

2. **Access Control**
   - Role-based access control (RBAC)
   - Case-level permissions
   - Audit logging for all access

3. **File Security**
   - Virus scanning on upload
   - File type validation
   - Checksum verification
   - Quarantine system

4. **Authentication**
   - Multi-factor authentication required for admins
   - Account lockout after failed attempts
   - Session timeout
   - IP-based anomaly detection

---

## Performance Targets

- File upload: 100MB processed within 30 seconds
- Virus scanning: Complete within 10 seconds
- Archive extraction: Process within 60 seconds
- Page load times: Sub-2-second initial loads
- Database queries: Sub-100ms response times
- Concurrent users: Support 500+ simultaneous

---

## Testing Strategy

1. **Unit Tests** - Individual function testing
2. **Integration Tests** - Component interaction testing
3. **Security Tests** - Penetration testing, vulnerability scanning
4. **Performance Tests** - Load testing, stress testing
5. **User Acceptance Tests** - Real-world usage scenarios

---

## Success Metrics

- All file uploads complete without errors
- Virus scanning catches 100% of test malware
- Archive extraction preserves file integrity
- Redaction system achieves 95%+ accuracy
- Public case publication maintains victim privacy
- Admin workflow reduces case compilation time by 50%
