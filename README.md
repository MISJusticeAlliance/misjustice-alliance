# MISJustice Alliance - Legal Advocacy Platform

A secure, enterprise-grade legal advocacy website for anonymous case submissions related to civil rights violations, police misconduct, legal malpractice, and institutional corruption cases in Montana and Washington.

## Overview

The MISJustice Alliance platform provides a secure, anonymous way for victims to report their experiences and connect with legal professionals. The system prioritizes privacy and security through end-to-end encryption and anonymous case tracking.

## Features

### Public Features
- **Anonymous Case Submission**: Multi-step form with client-side data validation
- **Case Tracking**: Track case status using unique case ID (no account required)
- **Secure Messaging**: Encrypted communication between submitters and legal team
- **Legal Resources**: Educational content about civil rights and legal advocacy
- **Responsive Design**: Mobile-friendly interface for all devices

### Admin Features
- **Dashboard**: Overview of all cases with statistics and analytics
- **Case Management**: Review, assign, and update case statuses
- **Secure Messaging**: Respond to case submitters through encrypted channels
- **Analytics**: Track cases by category, jurisdiction, and status
- **Audit Logging**: Complete audit trail of all system actions

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **tRPC 11** for type-safe API calls
- **Wouter** for routing
- **Shadcn/ui** for UI components
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **tRPC** for API layer
- **Drizzle ORM** with MySQL/TiDB
- **AES-256-GCM** encryption for sensitive data
- **JWT** for admin authentication

## Project Structure

```
misjustice-alliance/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx      # Landing page
│   │   │   ├── SubmitCase.tsx # Case submission form
│   │   │   ├── TrackCase.tsx  # Case tracking
│   │   │   ├── Resources.tsx  # Legal resources
│   │   │   └── AdminDashboard.tsx # Admin interface
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and tRPC client
│   │   └── index.css         # Global styles
├── server/                    # Backend Node.js application
│   ├── routers.ts            # tRPC API routes
│   ├── db.ts                 # Database queries
│   ├── encryption.ts         # Encryption utilities
│   └── validation.ts         # Input validation schemas
├── drizzle/                   # Database schema
│   └── schema.ts             # Table definitions
└── shared/                    # Shared types and constants
```

## Database Schema

### Core Tables
- **users**: Admin user accounts with role-based access
- **submissions**: Anonymous case submissions with encrypted contact info
- **messages**: Encrypted messages between submitters and admins
- **documents**: File attachments with S3 storage references
- **legalResources**: Legal content and educational materials
- **systemLogs**: Audit trail for security monitoring

## Security Features

### Data Protection
- **AES-256-GCM Encryption**: All sensitive data encrypted at rest
- **Unique Case IDs**: Anonymous tracking without user accounts
- **IP Anonymization**: IP addresses automatically anonymized after 30 days
- **Secure File Storage**: Documents stored in S3 with encryption keys

### Access Control
- **Role-Based Access**: Admin/User role separation
- **JWT Authentication**: Secure admin session management
- **Protected Procedures**: tRPC middleware for authorization
- **Audit Logging**: Complete trail of all system actions

### Input Validation
- **Zod Schemas**: Type-safe validation for all inputs
- **XSS Prevention**: Input sanitization throughout
- **Rate Limiting**: Protection against abuse
- **File Type Validation**: Restricted upload types

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL or TiDB database
- AWS S3 bucket (for file storage)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables (see `.env.example`)

4. Push database schema:
   ```bash
   pnpm db:push
   ```

5. Start development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## Environment Variables

Required environment variables are automatically injected by the Manus platform:
- `DATABASE_URL`: MySQL/TiDB connection string
- `JWT_SECRET`: Session cookie signing secret
- `VITE_APP_TITLE`: Application title
- `VITE_APP_LOGO`: Logo URL
- Additional OAuth and API configuration

## Usage

### For Victims/Submitters

1. **Submit a Case**:
   - Visit the homepage and click "Submit Your Case"
   - Fill out the multi-step form with case details
   - Optionally provide encrypted contact information
   - Receive a unique case ID for tracking

2. **Track Your Case**:
   - Use your case ID to view case status
   - Send and receive encrypted messages
   - No account or login required

### For Administrators

1. **Access Admin Dashboard**:
   - Log in with admin credentials at `/admin`
   - View dashboard with case statistics

2. **Manage Cases**:
   - Review new submissions
   - Update case statuses
   - Assign cases to team members
   - Respond to submitters via encrypted messaging

3. **View Analytics**:
   - Track cases by category and jurisdiction
   - Monitor case resolution rates
   - Review system audit logs

## Case Categories

The platform supports the following case types:
- **Civil Rights Violations**: 1st, 4th, 8th, 14th Amendment deprivations
- **Police Misconduct**: Excessive force, false arrest, constitutional violations
- **Legal Malpractice**: Attorney negligence and ethical violations
- **Prosecutorial Misconduct**: Malicious prosecution, Brady violations
- **Constitutional Violations**: Due process, equal protection violations
- **Institutional Corruption**: Systemic accountability failures

## Jurisdictions

- **Montana**: State-level cases
- **Washington**: State-level cases
- **Federal**: Federal jurisdiction cases
- **Multi-State**: Cross-jurisdictional coordination

## Development

### Database Migrations

When updating the schema:
```bash
pnpm db:push
```

### Type Safety

The project uses TypeScript in strict mode with tRPC for end-to-end type safety from database to frontend.

### Code Style

- ESLint for code quality
- Prettier for formatting
- TypeScript strict mode enabled

## Deployment

The application is designed to be deployed on:
- **Frontend**: Vercel or similar
- **Backend**: Railway, Render, or similar Node.js hosting
- **Database**: MySQL or TiDB
- **Storage**: AWS S3 or compatible

## Security Considerations

### For Developers
- Never log sensitive data
- Always encrypt before storing personal information
- Use parameterized queries (handled by Drizzle ORM)
- Validate all user inputs
- Follow principle of least privilege

### For Administrators
- Regularly review audit logs
- Monitor for suspicious activity
- Keep admin credentials secure
- Use strong passwords
- Enable two-factor authentication when available

## Support

For technical support or questions about the platform:
- Submit an issue on GitHub
- Contact the development team
- Review the documentation

## License

Copyright © 2024 MISJustice Alliance. All rights reserved.

## Acknowledgments

Built with security and privacy as top priorities to serve victims of civil rights violations and institutional corruption.
