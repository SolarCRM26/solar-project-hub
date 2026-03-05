# SPD Nexus - Solar Project Management CRM

## Overview

SPD Nexus is a comprehensive enterprise-grade CRM platform designed specifically for solar installation businesses. It provides complete project lifecycle management from lead generation to closeout, with role-based access control for administrators, field engineers, and customers.

## Features

### 👨‍💼 Admin Features
- **Dashboard**: Real-time analytics and project overview
- **Project Management**: Full project lifecycle tracking with stage management
- **Task Management**: Assign and track tasks across projects
- **Document Management**: Version-controlled document storage and sharing
- **User Management**: Role-based access control with approval workflow
- **Client & Site Management**: CRM functionality for clients and solar sites
- **Checklist Templates**: Create and manage QA checklists
- **Reports**: Analytics and insights dashboard
- **Role Request Approval**: Secure role assignment workflow

### 🔧 Field Engineer Features
- **Project View**: Access assigned projects and details
- **Task Management**: View and update task status
- **Daily Logs**: Record daily work activities
- **Photo Upload**: Document installation progress
- **Comments**: Collaborate on tasks with team

### 👤 Customer Features
- **Project Dashboard**: View project progress and milestones
- **Document Access**: Download approved project documents
- **Progress Tracking**: Monitor installation stages
- **Closeout Package**: Generate and download completion reports

## Tech Stack

- **Frontend**: React 18.3 + TypeScript + Vite 5.4
- **UI Framework**: shadcn/ui + Tailwind CSS + Radix UI
- **State Management**: TanStack Query 5.83
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **PDF Generation**: jsPDF + jspdf-autotable
- **Routing**: React Router 6.30

## Database Schema

- 17 tables with Row Level Security (RLS)
- Role-based access policies
- Audit trails and versioning
- Storage buckets for documents and photos

## Getting Started

### Prerequisites

- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- Supabase account ([sign up](https://supabase.com))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd solar-project-hub-main

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

Get these values from your [Supabase dashboard](https://supabase.com/dashboard).

### Database Setup

1. Create a new Supabase project
2. Run the migrations in order:
   ```sh
   # In Supabase SQL Editor, run:
   # 1. supabase/migrations/20260305071502_*.sql
   # 2. supabase/migrations/20260305071521_*.sql
   # 3. supabase/migrations/20260305120000_*.sql
   ```

## User Roles

### Administrator
Full system access including:
- User and role management
- All project operations
- System configuration
- Reports and analytics

### Field Engineer
Field operations access:
- Assigned project/task view
- Daily log creation
- Photo uploads
- Task status updates

### Customer
Read-only project access:
- Project progress view
- Document downloads
- Milestone tracking

## Role Assignment Workflow

1. User signs up with email/password
2. User selects desired role (creates role request)
3. Administrator reviews and approves/rejects request
4. User receives notification of approval
5. User gains access to role-specific features

## Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Secure role assignment workflow
- JWT authentication via Supabase
- Encrypted storage for documents

## Development

```sh
# Run development server (tries ports 8080, 8081, 8082)
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── ui/            # shadcn/ui components (50+)
│   └── ...
├── contexts/          # React contexts (Auth)
├── hooks/             # Custom hooks
├── integrations/      # External service integrations
│   └── supabase/      # Supabase client and types
├── lib/               # Utility functions
├── pages/             # Page components
│   ├── admin/         # Admin pages (11 pages)
│   ├── engineer/      # Engineer pages (4 pages)
│   └── customer/      # Customer pages (1 page)
├── test/              # Test files
└── utils/             # Utility functions (PDF generation)
```

## License

Proprietary - All rights reserved
