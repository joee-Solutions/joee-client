# Integration Guide: Syncing with Super Admin Codebase

## Quick Reference for Super Admin Integration

This guide helps you sync this **Tenant UI** client with the **Super Admin** codebase.

---

## 🔗 Critical Integration Points

### 1. Authentication Endpoints

**Both codebases MUST use the same authentication endpoints:**

```typescript
// Shared endpoints (both super admin and tenant UI)
/auth/super/login
/auth/super/signup
/auth/super/logout
/auth/super/refresh-token
/auth/super/forgot-password
/auth/super/reset-password
/auth/super/verify-otp
/auth/super/verify-login-otp
/auth/super/resend-otp
```

**Action Items:**
- ✅ Verify super admin uses same endpoint paths
- ✅ Ensure same request/response format
- ✅ Same token structure (`auth_token`, `refresh_token`)

---

### 2. Backend API Base URL

**Both MUST point to the same backend:**

```env
# .env.local (both codebases)
API_URL=http://localhost:3700  # Same backend for both
```

**Action Items:**
- ✅ Super admin: Set `API_URL` to backend server
- ✅ Tenant UI: Set `API_URL` to same backend server
- ✅ Verify backend is running on port 3700 (or update both)

---

### 3. Tenant Management Flow

**Super Admin Creates → Tenant UI Accesses**

```
Super Admin Flow:
1. Create tenant via super admin UI
2. Backend stores tenant config
3. Tenant accessible via subdomain

Tenant UI Flow:
1. User accesses {tenant}.localhost:3000
2. Middleware validates tenant
3. Calls GET /v2/tenant/{domain}/ui
4. Backend returns tenant config
5. User can login/access tenant dashboard
```

**Required Backend Endpoint:**
```
GET /v2/tenant/{domain}/ui
Headers: x-tenant-id: {subdomain}
Response: { message: "success", ...tenantConfig }
```

**Action Items:**
- ✅ Super admin must create tenants via backend API
- ✅ Backend must expose `/v2/tenant/{domain}/ui` endpoint
- ✅ Tenant UI middleware calls this endpoint
- ✅ Ensure tenant config includes necessary data

---

### 4. Token & Session Management

**Shared Cookie Names:**
```typescript
auth_token      // JWT access token
refresh_token   // Refresh token
user            // User data (JSON string)
mfa_token       // Temporary MFA token (login flow)
```

**Token Expiration:**
- `auth_token`: 30 minutes (1/48 day)
- `refresh_token`: 30 minutes (1/48 day)
- `mfa_token`: Temporary (during login)

**Action Items:**
- ✅ Both use same cookie names
- ✅ Same expiration logic
- ✅ Same refresh token flow
- ✅ Same logout behavior (remove all cookies)

---

### 5. User Data Structure

**Expected User Object (after login):**
```typescript
{
  token: string,           // auth_token
  refresh_token: string,   // refresh_token
  user: {
    id: number,
    email: string,
    name: string,
    role: string,
    // ... other user fields
  }
}
```

**Action Items:**
- ✅ Verify super admin returns same user structure
- ✅ Tenant UI expects same structure
- ✅ Update types if structure differs

---

### 6. Environment Variables Checklist

**Super Admin `.env.local`:**
```env
API_URL=http://localhost:3700
NEXT_PUBLIC_SITE_URL=localhost:4000  # Super admin port
SITE_URL=http://localhost:3600
SITE_NAME=Joee Super Admin
```

**Tenant UI `.env.local`:**
```env
API_URL=http://localhost:3700        # SAME as super admin
NEXT_PUBLIC_SITE_URL=localhost:3000  # Tenant UI port
SITE_URL=http://localhost:3600
SITE_NAME=LociCare
```

**Action Items:**
- ✅ Create `.env.local` in both projects
- ✅ Set `API_URL` to same backend
- ✅ Different `NEXT_PUBLIC_SITE_URL` (different ports)
- ✅ Update ports if needed

---

## 🔄 Sync Checklist

### Phase 1: Backend Verification

- [ ] Backend server running on port 3700
- [ ] All `/auth/super/*` endpoints implemented
- [ ] `/v2/tenant/{domain}/ui` endpoint exists
- [ ] CORS configured to allow both frontends
- [ ] Database has tenant management tables

### Phase 2: Super Admin Setup

- [ ] Super admin can create tenants
- [ ] Super admin can view tenant list
- [ ] Super admin can edit tenant config
- [ ] Super admin uses same auth endpoints
- [ ] Super admin uses same API base URL

### Phase 3: Tenant UI Setup

- [ ] Tenant UI `.env.local` configured
- [ ] Tenant UI can access backend API
- [ ] Middleware validates tenants correctly
- [ ] Login flow works end-to-end
- [ ] Token refresh works

### Phase 4: Integration Testing

- [ ] Create tenant in super admin
- [ ] Access tenant via subdomain in tenant UI
- [ ] Login works in tenant UI
- [ ] API calls work from tenant UI
- [ ] Token refresh works
- [ ] Logout works

---

## 🐛 Common Integration Issues

### Issue 1: CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Backend must allow both origins:
  - `http://localhost:3000` (Tenant UI)
  - `http://localhost:4000` (Super Admin - adjust port)
- Add to backend CORS config:
  ```javascript
  origin: ['http://localhost:3000', 'http://localhost:4000']
  ```

### Issue 2: Tenant Not Found

**Symptoms:**
- Redirects to `/not-found`
- Middleware can't find tenant

**Solution:**
- Verify tenant exists in backend database
- Check `/v2/tenant/{domain}/ui` endpoint returns data
- Verify subdomain matches tenant slug
- Check `API_URL` is correct

### Issue 3: Authentication Fails

**Symptoms:**
- Login returns 401
- Token refresh fails

**Solution:**
- Verify backend `/auth/super/login` endpoint exists
- Check request/response format matches
- Verify password hashing matches
- Check token signing algorithm matches

### Issue 4: API Calls Fail

**Symptoms:**
- 404 Not Found on API calls
- Network errors

**Solution:**
- Verify `API_URL` environment variable
- Check Next.js API proxy route (`/api/[...slug]`)
- Verify backend endpoints exist
- Check authorization header format

---

## 📋 API Contract Verification

### Login Request (Both Codebases)

```typescript
POST /auth/super/login
Body: {
  email: string,
  password: string
}
```

### Login Response (Both Codebases)

```typescript
{
  data: {
    token: string,        // MFA token for login flow
  }
}
```

### Verify Login OTP Request

```typescript
POST /auth/super/verify-login-otp
Body: {
  mfa_token: string,
  otp: string
}
```

### Verify Login OTP Response

```typescript
{
  token: string,          // auth_token
  refresh_token: string,
  user: { ... }
}
```

**Action Items:**
- ✅ Verify super admin uses same request/response format
- ✅ Update if formats differ
- ✅ Document any differences

---

## 🚀 Quick Start Commands

### Super Admin
```bash
cd super-admin-codebase
npm install
# Create .env.local with API_URL=http://localhost:3700
npm run dev
# Runs on http://localhost:4000 (or configured port)
```

### Tenant UI (This Codebase)
```bash
cd joee-client
npm install
# Create .env.local with API_URL=http://localhost:3700
npm run dev
# Runs on http://localhost:3000
```

### Backend
```bash
cd backend-codebase
# Start backend server on port 3700
# Ensure CORS allows both frontends
```

---

## 📝 Recommended Shared Code

Consider creating a shared package for:

1. **API Client**
   ```typescript
   // shared-package/src/api-client.ts
   export class ApiClient {
     login(email, password) { ... }
     refreshToken() { ... }
     // ... shared methods
   }
   ```

2. **Types/Interfaces**
   ```typescript
   // shared-package/src/types.ts
   export interface User { ... }
   export interface Tenant { ... }
   export interface AuthResponse { ... }
   ```

3. **Constants**
   ```typescript
   // shared-package/src/constants.ts
   export const API_ENDPOINTS = { ... }
   export const COOKIE_NAMES = { ... }
   ```

**Benefits:**
- Single source of truth
- Consistent API calls
- Easier maintenance
- Type safety across codebases

---

## ✅ Final Verification Steps

1. **Create Test Tenant**
   - Use super admin to create tenant "test-org"
   - Verify tenant appears in backend database

2. **Access Tenant UI**
   - Navigate to `http://test-org.localhost:3000`
   - Should not redirect to `/not-found`
   - Should show login page

3. **Test Login**
   - Login with valid credentials
   - Should receive MFA token
   - Enter OTP
   - Should receive auth tokens
   - Should redirect to dashboard

4. **Test API Calls**
   - Make API call from tenant UI
   - Should succeed with auth token
   - Should refresh token if expired

5. **Test Logout**
   - Logout from tenant UI
   - Should clear all cookies
   - Should redirect to login

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check network tab for failed requests
3. Verify backend logs
4. Check environment variables
5. Verify CORS configuration
6. Test API endpoints directly (Postman/curl)

---

**Last Updated:** Based on current codebase analysis  
**Next Steps:** Follow checklist above to sync both codebases

