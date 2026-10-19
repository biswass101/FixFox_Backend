# FixFlow Frontend

FixFlow is an AI-assisted enterprise maintenance management and facility operations SaaS client. Built with Next.js 14 App Router, TypeScript (Strict Mode), Tailwind CSS, shadcn/ui, TanStack Query v5, Zustand, Axios, Recharts, and Sonner.

---

## 1. System Overview

FixFlow connects maintenance reporters, facility managers, technicians, and system administrators into a single unified workspace:

- **Incident Reporting**: Submit issues with natural-language descriptions, location targeting, optional asset tags, and photo evidence.
- **AI Triage Integration**: Surface automated category, priority, rationale, safety flags, and response recommendations generated via OpenRouter.
- **Manager Dispatching**: Inspect live technician workloads, assign tasks, review/override AI recommendations, and monitor response/resolution deadlines.
- **Technician Workbench**: Mobile-optimized field dashboard for technicians to start jobs, record internal work notes, submit itemized parts and labor costs, and log resolution summaries.
- **SLA & Incident Tracking**: Monitor active response and resolution deadlines with dynamic countdown badges, overdue notifications, and recurring fault detection.
- **Operational Analytics**: Visualize workload distribution, MTTR trends, spend by trade, and technician performance using Recharts.

---

## 2. Technology Stack

- **Framework**: Next.js 14.2 (App Router, Server & Client Components)
- **Language**: TypeScript 5.7 (Strict Mode enabled)
- **Styling**: Tailwind CSS, PostCSS, Class Variance Authority (`cva`), `tailwind-merge`
- **UI Component Library**: shadcn/ui primitives built on Radix UI
- **Server State**: TanStack Query v5 (`@tanstack/react-query`) with domain query keys and optimistic cache invalidation
- **Client State**: Zustand 4.5 for UI and sidebar preferences
- **HTTP Client**: Axios with credentials, automated token refresh interceptor, and request retry queuing
- **Forms & Validation**: React Hook Form with Zod schema resolvers
- **Data Visualization**: Recharts (responsive AreaChart, BarChart, and performance tables)
- **Icons**: Lucide React
- **Notifications**: Sonner toast system
- **Testing**: Vitest, React Testing Library, JSDOM

---

## 3. Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Running FixFlow API backend (`http://localhost:4000/api/v1`)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment configuration:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
   NEXT_PUBLIC_APP_NAME=FixFlow
   ```

### Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 4. Route Architecture

### Public & Authentication Routes
- `/login` - Organization credentials login with session cookie establishment
- `/register` - Organization workspace creation and first administrator onboarding
- `/forgot-password` - Password reset request form
- `/reset-password` - Token-verified password reset completion
- `/invite/accept` - Team member onboarding and workspace invitation acceptance
- `/unauthorized` - Role-access restriction fallback

### Protected Application Routes
- `/dashboard` - Role-aware operational metrics, charts, overdue queue, and quick actions
- `/work-orders` - Filterable, sortable, paginated work order data table
- `/work-orders/new` - Incident submission form with photo attachments and validation
- `/work-orders/[id]` - Comprehensive incident detail view:
  - Incident status lifecycle management
  - AI Triage review and override controls
  - Technician assignment dialog
  - Technician work notes (internal/public scoping)
  - Itemized cost tracking (parts & labor hours)
  - High-resolution photo gallery with lightbox preview
  - Audit and status change timeline
- `/my-work-orders` - Dedicated Technician Workbench view prioritized by deadline and urgency
- `/technicians` - Staff roster, trade skills, and active job workload monitors
- `/assets` - Equipment inventory, condition badges, and warranty tracking
- `/locations` - Facility structure management (buildings, floors, rooms)
- `/analytics` - Incident trends, category breakdowns, and technician MTTR metrics
- `/sla` - SLA benchmark targets and active countdown monitor
- `/notifications` - Notification center with unread markers and bulk read actions
- `/settings` - Profile info, organization parameters, team invitations, and security settings

---

## 5. Security & Session Handling

- **Cookie-Based Sessions**: Refresh tokens are stored in secure HTTP-only cookies. Access tokens are kept in memory and passed via Axios headers.
- **Silent Refresh Interceptor**: The Axios client automatically catches `401 Unauthorized` responses and triggers `/auth/refresh` through a queued interceptor before transparently retrying pending requests.
- **Role-Based Guards**: Protected pages and features verify user roles (`ADMIN`, `MANAGER`, `TECHNICIAN`, `REPORTER`) before rendering management controls.
- **XSS Prevention**: User-supplied input is sanitized and rendered strictly as text nodes without raw HTML injections.
- **Safe Currency Formatting**: Centralized formatting for BDT (৳) with robust validation against invalid values.

---

## 6. Verification and Testing

### Run TypeScript Compilation
```bash
npm run typecheck
```

### Run Vitest Unit & Component Tests
```bash
npm test
```

### Run ESLint
```bash
npm run lint
```

### Run Next.js Production Build
```bash
npm run build
```

---

## 7. Folder Structure

```
Frontend/
├── src/
│   ├── app/
│   │   ├── (app)/                  # Authenticated application shell
│   │   │   ├── analytics/
│   │   │   ├── assets/
│   │   │   ├── dashboard/
│   │   │   ├── locations/
│   │   │   ├── my-work-orders/
│   │   │   ├── notifications/
│   │   │   ├── settings/
│   │   │   ├── sla/
│   │   │   ├── technicians/
│   │   │   └── work-orders/
│   │   ├── (public)/                # Public authentication routes
│   │   │   ├── forgot-password/
│   │   │   ├── invite/accept/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── unauthorized/
│   ├── components/
│   │   ├── dashboard/              # Metric cards, chart components, recent queues
│   │   ├── layout/                 # Sidebar, Topbar, AuthGuard
│   │   ├── providers/              # React Query, Sonner, Theme providers
│   │   ├── shared/                 # Badges, ConfirmDialog, EmptyState, LoadingSpinner
│   │   ├── ui/                     # shadcn/ui primitives
│   │   └── work-orders/            # Timeline, filters, table, notes, costs, AI triage
│   ├── hooks/                      # TanStack Query custom hooks
│   ├── lib/
│   │   ├── api/                    # Typed Axios API clients by domain
│   │   ├── api-errors.ts           # Standardized API error extractors
│   │   ├── axios.ts                # Configured Axios instance with retry queue
│   │   ├── query-client.ts         # QueryClient configuration
│   │   └── utils.ts                # Currency, date, and styling helpers
│   ├── stores/                     # Zustand stores for auth and UI state
│   └── types/                      # TypeScript definitions (auth, work orders, entities)
└── tests/
    └── unit/                       # Component and API client unit test suites
```

