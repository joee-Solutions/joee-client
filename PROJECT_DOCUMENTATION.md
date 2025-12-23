# JOEE Client - Tenant UI Project Documentation

## Project Overview

**Project Name:** `joee-tenant-ui`  
**Version:** 0.1.34  
**Framework:** Next.js 15.1.3 with React 19.0.0  
**Type:** Multi-tenant Healthcare Management System (Super Admin Dashboard)

This is a **super admin dashboard** for managing multiple healthcare organizations (tenants) in a multi-tenant architecture. The application allows administrators to manage organizations, employees, patients, appointments, departments, schedules, and more.

---

## Architecture

### Multi-Tenant Architecture

The application uses a **subdomain-based multi-tenant architecture**:

- **Root Domain:** `localhost:3000` (development) or `joee.com.ng` (production)
- **Tenant Access:** Each tenant is accessed via subdomain (e.g., `tenant1.localhost:3000` or `tenant1.joee.com.ng`)
- **Middleware:** Routes requests based on subdomain and validates tenant configuration
- **URL Rewriting:** Middleware rewrites URLs to tenant-specific routes (`/[tenant]/...`)

### Key Architecture Components

1. **Middleware (`src/middleware.ts`)**
   - Extracts subdomain from hostname
   - Validates tenant slug format (alphanumeric with hyphens)
   - Fetches tenant configuration from backend
   - Rewrites URLs to tenant-specific routes
   - Redirects invalid tenants to `/not-found`

2. **API Proxy (`src/app/api/[...slug]/route.ts`)**
   - Proxies all API requests to backend server
   - Handles GET, POST, PUT, DELETE methods
   - Forwards authorization headers
   - Uses `siteConfig.host` (default: `http://localhost:3700`)

3. **HTTP Client (`src/framework/https.ts`)**
   - Two axios instances: `httpNoAuth` and `httpAuth`
   - Dynamic base URL based on subdomain
   - Automatic token refresh on 401 errors
   - FormData conversion for file uploads

---

## Environment Variables

### Required Environment Variables

Create a `.env.local` file with the following:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=localhost:3000          # Root domain for the application
SITE_URL=http://localhost:3600              # Site URL (used in site-config)
SITE_NAME=LociCare                          # Application name

# API Configuration
API_URL=http://localhost:3700                # Backend API base URL

# Node Environment
NODE_ENV=development                        # development | production
```

### Default Values (if not set)

- `NEXT_PUBLIC_SITE_URL`: `localhost:3000`
- `SITE_URL`: `http://localhost:3600`
- `SITE_NAME`: `LociCare`
- `API_URL`: `http://localhost:3700`

---

## API Integration

### Backend API Base URL

**Development:**
- Local: `http://{subdomain}.localhost:3600/api`
- Direct: `http://localhost:3700` (via Next.js API proxy)

**Production:**
- `https://{subdomain}.joee.com.ng/api`

### API Endpoints

All authentication endpoints use `/auth/super/` prefix:

```typescript
{
  REFRESH_TOKEN: "/auth/super/refresh-token",
  LOGIN: "/auth/super/login",
  SIGNUP: "/auth/super/signup",
  LOGOUT: "/auth/super/logout",
  FORGOT_PASSWORD: "/auth/super/forgot-password",
  RESET_PASSWORD: "/auth/super/reset-password",
  VERIFY_EMAIL: "/auth/super/verify-email",
  VERIFY_OTP: "/auth/super/verify-otp",
  VERIFY_LOGIN: "/auth/super/verify-login-otp",
  RESEND_OTP: "/auth/super/resend-otp",
}
```

### API Proxy Pattern

All API calls go through Next.js API routes:
- Frontend calls: `/api/v2/...`
- Next.js proxies to: `{API_URL}/v2/...`
- Authorization header is forwarded automatically

### Tenant Configuration Endpoint

- **Endpoint:** `GET /v2/tenant/{domain}/ui`
- **Headers:** `x-tenant-id: {subdomain}`
- **Purpose:** Validates tenant and returns tenant configuration
- **Location:** `src/lib/tenant.ts`

---

## Authentication Flow

### Login Process

1. User submits email/password at `/{tenant}/login`
2. POST to `/auth/super/login`
3. Response includes `mfa_token` (MFA token)
4. User redirected to `/{tenant}/verify-otp`
5. User enters OTP
6. POST to `/auth/super/verify-login-otp` with `mfa_token` and OTP
7. Response includes `auth_token` and `refresh_token`
8. Tokens stored in cookies:
   - `auth_token` (expires: 1/48 day = 30 minutes)
   - `refresh_token` (expires: 1/48 day = 30 minutes)
   - `user` (user data JSON)

### Token Management

- **Storage:** Cookies (using `js-cookie`)
- **Auth Token:** `auth_token` cookie
- **Refresh Token:** `refresh_token` cookie
- **MFA Token:** `mfa_token` cookie (temporary, during login)

### Token Refresh

- Automatic refresh on 401 Unauthorized responses
- Uses `refresh_token` to get new `auth_token`
- Retries original request after refresh
- Logs out user if refresh fails

### Authentication Guards

- **AuthProvider** (`src/contexts/AuthProvider.tsx`): Client-side route protection
- **Middleware**: Server-side tenant validation
- **Page-level checks**: `src/app/page.tsx` checks for `auth_token` cookie

---

## Routing Structure

### Route Groups (Next.js App Router)

1. **`(auth)`** - Authentication pages
   - `/[tenant]/login`
   - `/[tenant]/forgot-password`
   - `/[tenant]/reset-password`
   - `/[tenant]/otp`
   - `/[tenant]/verify-otp`
   - `/[tenant]/reset-successful`
   - `/[tenant]/auth-sucessful`

2. **`(dashboard)`** - Dashboard pages (protected)
   - `/[tenant]/dashboard` - Main dashboard
   - `/[tenant]/dashboard/organization` - Organization management
   - `/[tenant]/dashboard/employees` - Employee management
   - `/[tenant]/dashboard/patients` - Patient management
   - `/[tenant]/dashboard/appointments` - Appointments
   - `/[tenant]/dashboard/departments` - Departments
   - `/[tenant]/dashboard/schedules` - Schedules
   - `/[tenant]/dashboard/admin` - Admin management
   - `/[tenant]/dashboard/profile` - User profile
   - `/[tenant]/dashboard/settings` - Settings
   - `/[tenant]/dashboard/notifications` - Notifications

### Dynamic Routes

- `/[tenant]` - Tenant identifier (from subdomain)
- `/[tenant]/dashboard/organization/[org]` - Specific organization
- `/[tenant]/dashboard/employees/[employeeDetail]` - Employee details
- `/[tenant]/dashboard/patients/[patientDetail]` - Patient details
- `/[tenant]/dashboard/departments/[departmentName]` - Department details

---

## Key Features & Modules

### 1. Organization Management
- **Location:** `src/app/(dashboard)/[tenant]/dashboard/organization/`
- **Features:**
  - List all organizations
  - Create new organization
  - Edit organization details
  - View organization details
  - Organization status management (Active/Inactive/Deactivated)
  - Organization backup/restore
  - Organization statistics

### 2. Employee Management
- **Location:** `src/app/(dashboard)/[tenant]/dashboard/employees/`
- **Features:**
  - List employees
  - Create employee
  - Employee details (Personal Info, Patients, Appointments, Schedules, Roles)
  - Assign roles
  - Change password

### 3. Patient Management
- **Location:** `src/app/(dashboard)/[tenant]/dashboard/patients/`
- **Features:**
  - List patients
  - Create patient (multi-step form)
  - Personal information
  - Medical information
  - Medical records
  - Uploads
  - Appointments history

### 4. Appointment Management
- **Location:** `src/app/(dashboard)/[tenant]/dashboard/appointments/`
- **Features:**
  - View appointments
  - Add appointments
  - Appointment charts/analytics

### 5. Department Management
- **Location:** `src/app/(dashboard)/[tenant]/dashboard/departments/`
- **Features:**
  - List departments
  - Add department
  - Department overview
  - Department employees
  - Department carousel

### 6. Schedule Management
- **Location:** `src/app/(dashboard)/[tenant]/dashboard/schedules/`
- **Features:**
  - View schedules
  - Add schedules
  - Schedule cards/carousel

### 7. Admin Management
- **Location:** `src/app/(dashboard)/[tenant]/dashboard/admin/`
- **Features:**
  - List admins
  - Create admin
  - Admin profile
  - Change password

### 8. Dashboard Analytics
- **Location:** `src/app/(dashboard)/[tenant]/dashboard/page.tsx`
- **Features:**
  - Organization statistics (All, Active, Inactive, Deactivated)
  - Appointments chart
  - Patients donut chart
  - Employee section
  - Organization list
  - Organization status chart

---

## State Management

### Tenant Store (Zustand)

**Location:** `src/contexts/stores/tenant-store.ts`

**State:**
```typescript
{
  user: null | any,
  isLoading?: boolean,
  error?: string
}
```

**Actions:**
- `request()` - Make authenticated/unauthenticated API requests
- `signIn()` - Login user
- `logOut()` - Logout user
- `setStateItem()` - Update state items

**Persistence:** Uses Zustand persist middleware (localStorage)

### Tenant Provider

**Location:** `src/contexts/providers/tenant-provider.tsx`

Provides tenant store context to the application.

---

## UI Components

### Component Structure

```
src/components/
├── admin/              # Admin-specific components
├── dashboard/          # Dashboard components
├── icons/              # Icon components
├── Org/                # Organization-related components
│   ├── Appointments/
│   ├── Departments/
│   ├── Employees/
│   ├── Patients/
│   └── Schedule/
├── shared/             # Shared components
│   ├── form/          # Form components
│   └── table/         # Table components
└── ui/                 # UI primitives (shadcn/ui)
```

### UI Library

- **shadcn/ui** - Component library (Radix UI + Tailwind)
- **Ant Design** - Additional UI components
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **Zod** - Schema validation

---

## Data Models

### TypeScript Interfaces (`src/lib/types.ts`)

```typescript
interface Organization {
  id: number;
  name: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Deactivated';
  image: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  organization: string;
  description?: string;
  image: string;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: string;
  organization: string;
}
```

---

## Offline Support

### Service Worker

**Location:** `public/sw.js`

- Caches static assets
- Handles API requests offline
- Shows offline page when disconnected

### Offline Database

**Location:** `src/lib/offline-db.ts`

- Uses IndexedDB (via `idb` library)
- Stores data for offline access
- Syncs when online

### Offline Hook

**Location:** `src/hooks/useOffline.ts`

- Detects online/offline status
- Manages offline state

---

## Development Setup

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**Default URL:** `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## Backend Integration Points

### Required Backend Services

1. **Authentication Service**
   - Endpoints: `/auth/super/*`
   - Handles: Login, Signup, Password reset, OTP verification

2. **Tenant Service**
   - Endpoint: `GET /v2/tenant/{domain}/ui`
   - Returns tenant configuration
   - Validates tenant existence

3. **API Service**
   - Base URL: `http://localhost:3700` (dev)
   - All other endpoints proxied through `/api/*`

### Expected Backend Response Format

**Success Response:**
```json
{
  "status": 200,
  "data": { ... },
  "message": "success"
}
```

**Error Response:**
```json
{
  "status": 400,
  "error": "Error message",
  "data": null
}
```

---

## Multi-Tenant URL Structure

### Development

- **Root:** `http://localhost:3000`
- **Tenant:** `http://tenant1.localhost:3000`
- **API:** `http://tenant1.localhost:3600/api`

### Production

- **Root:** `https://joee.com.ng`
- **Tenant:** `https://tenant1.joee.com.ng`
- **API:** `https://tenant1.joee.com.ng/api`

### Subdomain Validation

- **Regex:** `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
- **Examples:** `tenant1`, `org-123`, `healthcare-clinic`
- **Invalid:** `localhost`, `www`, `tenant_1`, `TENANT1`

---

## Security Considerations

1. **Token Storage:** Cookies (httpOnly recommended for production)
2. **CORS:** Backend must allow frontend origin
3. **XSS Protection:** React escapes by default
4. **CSRF:** Consider CSRF tokens for state-changing operations
5. **Subdomain Validation:** Middleware validates tenant slugs
6. **Authorization:** All API calls include Bearer token

---

## File Upload

### FormData Conversion

**Location:** `src/framework/https.ts` - `convertToFormData()`

- Converts objects to FormData
- Handles single files, file arrays, and file objects
- Automatically sets `Content-Type: multipart/form-data`

### Usage

```typescript
await processRequestAuth("post", "/upload", data, callback, files);
```

---

## Key Dependencies

### Core
- `next`: 15.1.3
- `react`: 19.0.0
- `react-dom`: 19.0.0
- `typescript`: ^5

### UI/UX
- `tailwindcss`: ^3.4.1
- `antd`: ^5.24.1
- `framer-motion`: ^12.12.1
- `lucide-react`: ^0.475.0
- `react-icons`: ^5.4.0

### Forms & Validation
- `react-hook-form`: ^7.54.2
- `zod`: ^3.24.2
- `@hookform/resolvers`: ^4.1.3

### HTTP & State
- `axios`: ^1.7.9
- `zustand`: (via vanilla store)
- `js-cookie`: ^3.0.5

### Charts & Data Visualization
- `chart.js`: ^4.4.8
- `react-chartjs-2`: ^5.3.0
- `recharts`: ^2.15.1

### Offline Support
- `idb`: ^8.0.3

---

## Integration with Super Admin Codebase

### Key Integration Points

1. **Shared Authentication**
   - Both use `/auth/super/*` endpoints
   - Same token format (`auth_token`, `refresh_token`)
   - Same user data structure

2. **Tenant Management**
   - Super admin creates/manages tenants
   - This client accesses tenant-specific data
   - Tenant validation via `/v2/tenant/{domain}/ui`

3. **API Consistency**
   - Both should use same API base URL
   - Same response format
   - Same error handling

4. **Environment Variables**
   - `API_URL` should point to same backend
   - `NEXT_PUBLIC_SITE_URL` differs per client
   - `SITE_NAME` can differ

### Recommended Sync Strategy

1. **Shared Types/Interfaces**
   - Create shared TypeScript types package
   - Or maintain consistent interfaces in both codebases

2. **API Client Library**
   - Extract HTTP client to shared package
   - Both clients use same API methods

3. **Authentication Flow**
   - Ensure both use same login/refresh flow
   - Same cookie names and expiration

4. **Tenant Configuration**
   - Super admin creates tenant config
   - This client reads tenant config
   - Ensure `/v2/tenant/{domain}/ui` endpoint exists

---

## Troubleshooting

### Common Issues

1. **Redirect to `/not-found`**
   - Check tenant subdomain is valid format
   - Verify `API_URL` is correct
   - Check tenant exists in backend

2. **401 Unauthorized**
   - Check `auth_token` cookie exists
   - Verify token hasn't expired
   - Check refresh token flow

3. **CORS Errors**
   - Backend must allow frontend origin
   - Check `Access-Control-Allow-Origin` header

4. **API Not Found**
   - Verify `API_URL` environment variable
   - Check backend server is running
   - Verify API proxy route (`/api/[...slug]`)

---

## Project Structure Summary

```
joee-client/
├── public/                 # Static assets
├── src/
│   ├── app/              # Next.js app router
│   │   ├── (auth)/       # Auth route group
│   │   ├── (dashboard)/  # Dashboard route group
│   │   └── api/          # API proxy routes
│   ├── components/       # React components
│   ├── contexts/         # React contexts & stores
│   ├── framework/        # Core framework code
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & types
│   ├── models/           # Data models
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   ├── middleware.ts    # Next.js middleware
│   └── globals.css       # Global styles
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

## Next Steps for Super Admin Integration

1. **Verify Backend Endpoints**
   - Ensure all `/auth/super/*` endpoints exist
   - Verify `/v2/tenant/{domain}/ui` endpoint
   - Test API proxy functionality

2. **Environment Setup**
   - Create `.env.local` with correct values
   - Set `API_URL` to backend URL
   - Configure `NEXT_PUBLIC_SITE_URL`

3. **Test Multi-Tenant Flow**
   - Create test tenant in super admin
   - Access via subdomain
   - Verify tenant configuration loads

4. **Sync Authentication**
   - Ensure same login flow
   - Same token format
   - Same user data structure

5. **Test Features**
   - Organization management
   - Employee management
   - Patient management
   - All CRUD operations

---

## Contact & Support

For questions about this codebase, refer to:
- Next.js Documentation: https://nextjs.org/docs
- React Documentation: https://react.dev
- Project README: `README.md`

---

**Last Updated:** Based on codebase analysis  
**Version:** 0.1.34

