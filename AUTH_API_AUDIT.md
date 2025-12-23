# Authentication API Connection Audit

## Current Status: ⚠️ **Issues Found - Needs Fixes**

---

## API Endpoints Configuration

### Current Endpoints (`api-endpoints.ts`)
```typescript
{
  REFRESH_TOKEN: "/auth/super/refresh-token",        // ⚠️ Super admin endpoint
  LOGIN: "/tenant/auth/login",                        // ✅ Tenant endpoint
  AUTH_LOGIN: "/tenant/auth",                         // ✅ Tenant endpoint
  VERIFY_OTP: "/tenant/auth/verify-login-otp",       // ✅ Tenant endpoint
  VERIFY_LOGIN: "/tenant/auth/verify-otp",            // ✅ Tenant endpoint
  FORGOT_PASSWORD: "/tenant/auth/forgot-password",    // ✅ Tenant endpoint
  RESET_PASSWORD: "/tenant/auth/reset-password",      // ✅ Tenant endpoint
  LOGOUT: "/auth/super/logout",                       // ⚠️ Super admin endpoint
  VERIFY_EMAIL: "/auth/super/verify-email",           // ⚠️ Super admin endpoint
  RESEND_OTP: "/auth/super/resend-otp",               // ⚠️ Super admin endpoint
}
```

**Issue:** Mixed endpoints - some use `/auth/super/*` (super admin) and some use `/tenant/auth/*` (tenant).

---

## Authentication Flow Analysis

### 1. **Login Flow** ✅ Mostly Correct

**Endpoint:** `POST /tenant/auth/login`
**File:** `src/app/(auth)/[tenant]/login/page.tsx`

**Current Flow:**
```typescript
1. User submits email/password
2. POST /api/tenant/auth/login
3. Response: { data: { token: "mfa_token" } }
4. Save: Cookies.set("mfa_token", rt.data.token)
5. Redirect: /verify-otp
```

**Issues:**
- ✅ Endpoint correct
- ✅ Uses `processRequestNoAuth` (correct for login)
- ✅ Saves MFA token correctly
- ⚠️ Response structure: Expects `rt.data.token` - need to verify backend returns this

---

### 2. **Verify OTP Flow** ⚠️ Issues Found

**Endpoint:** `POST /tenant/auth/verify-otp`
**File:** `src/app/(auth)/[tenant]/verify-otp/VerifyLoginOtp.tsx`

**Current Flow:**
```typescript
1. User enters OTP
2. POST /api/tenant/auth/verify-otp
3. Body: { otp: string, token: mfa_token }
4. Response: { status: true, data: { token: "auth_token", user: {...} } }
5. Save: auth_token, user
6. Redirect: /dashboard
```

**Issues Found:**

#### Issue 1: Refresh Token Not Saved ❌
```typescript
// Line 58 - COMMENTED OUT
// Cookies.set("refresh_token", rt.data.refresh_token, { expires: 1 });
```

**Problem:** Refresh token is never saved, so token refresh will fail.

**Fix Needed:** Uncomment and save refresh_token.

#### Issue 2: Response Structure Assumption ⚠️
```typescript
if (rt.status === true && rt?.data?.token) {
```

**Problem:** Assumes response has `status` and `data.token`. Need to verify backend response format.

#### Issue 3: Cookie Expiration ⚠️
```typescript
expires: 1 / 48  // = 0.0208 days = 30 minutes
```

**Problem:** Very short expiration. Should verify if this is intentional.

---

### 3. **Token Refresh Flow** ❌ **CRITICAL ISSUES**

**Endpoint:** `POST /auth/super/refresh-token`
**File:** `src/framework/https.ts` - `refreshUser()`

**Issues Found:**

#### Issue 1: Wrong Endpoint ❌
```typescript
API_ENDPOINTS.REFRESH_TOKEN = "/auth/super/refresh-token"
```

**Problem:** 
- Uses super admin endpoint instead of tenant endpoint
- Should probably be: `/tenant/auth/refresh-token` (if exists)
- OR might need to use `/auth/super/refresh-token` if it's shared

**Action:** Verify with backend which endpoint to use.

#### Issue 2: Cookie Name Inconsistency ❌
```typescript
// Line 205
Cookies.set("customer", JSON.stringify(tResponse.user), {
```

**Problem:** 
- Sets `customer` cookie
- But everywhere else uses `user` cookie
- Should be `user` for consistency

#### Issue 3: Refresh Token Not Used ❌
**Problem:** Refresh token cookie might not exist because it's not saved after OTP verification.

#### Issue 4: Response Structure Assumption ⚠️
```typescript
Cookies.set("auth_token", tResponse.token, { expires: 1 / 48 });
Cookies.set("customer", JSON.stringify(tResponse.user), {
```

**Problem:** Assumes `tResponse.token` and `tResponse.user`. Need to verify backend response format.

---

## API Connection Flow

### Request Path
```
Frontend → /api/tenant/auth/login → route.ts → Backend API
```

**Current Setup:**
1. ✅ `baseURL = "/api"` (uses route.ts proxy)
2. ✅ route.ts extracts tenant subdomain
3. ✅ route.ts adds `x-tenant-id` header
4. ✅ route.ts proxies to `siteConfig.host`

### Headers Sent to Backend
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",  // For authenticated requests
  "x-client-info": "{...}",           // Client info JSON
  "x-client-host": "teef.localhost:3000",
  "x-client-protocol": "http",
  "x-tenant-id": "teef"               // Tenant subdomain
}
```

---

## Issues Summary

### Critical Issues ❌

1. **Refresh Token Not Saved After OTP Verification**
   - Location: `VerifyLoginOtp.tsx` line 58
   - Impact: Token refresh will always fail

2. **Cookie Name Inconsistency**
   - Location: `https.ts` line 205
   - Impact: User data stored as `customer` but read as `user`

3. **Wrong Refresh Token Endpoint**
   - Location: `api-endpoints.ts` line 2
   - Impact: May use wrong endpoint (super admin vs tenant)

### Medium Priority Issues ⚠️

4. **Response Structure Assumptions**
   - Multiple places assume specific response format
   - Need to verify backend response matches expectations

5. **Missing Error Handling**
   - Some API calls don't handle all error cases properly

---

## ✅ FIXES APPLIED

### Fix 1: Save Refresh Token After OTP Verification ✅
**Status:** Fixed
**File:** `src/app/(auth)/[tenant]/verify-otp/VerifyLoginOtp.tsx`
```typescript
// Now saves refresh_token if provided in response
if (rt.data.refresh_token) {
  Cookies.set("refresh_token", rt.data.refresh_token, { expires: 1 / 48 });
}
```

### Fix 2: Fix Cookie Name in refreshUser ✅
**Status:** Fixed
**File:** `src/framework/https.ts`
```typescript
// Changed from "customer" to "user" for consistency
Cookies.set("user", JSON.stringify(tResponse.user), {
  expires: 1 / 48,
});
// Also now saves refresh_token if provided in response
Cookies.set("refresh_token", tResponse.refresh_token || getRefreshToken(), { expires: 1 / 48 });
```

### Fix 3: Fixed typeof window bug ✅
**Status:** Fixed
**File:** `src/framework/https.ts`
```typescript
// Fixed: typeof window !== undefined → typeof window !== "undefined"
if (typeof window !== "undefined") {
  // ...
}
```

### Fix 4: Verify Refresh Token Endpoint ⚠️
**Status:** Needs Verification
**Action Required:**
- Check if `/tenant/auth/refresh-token` exists
- If yes, update `API_ENDPOINTS.REFRESH_TOKEN`
- If no, confirm `/auth/super/refresh-token` is correct for tenant users

---

## Verification Checklist

- [ ] Backend endpoint `/tenant/auth/login` exists and returns `{ data: { token: "mfa_token" } }`
- [ ] Backend endpoint `/tenant/auth/verify-otp` exists and returns `{ status: true, data: { token, refresh_token, user } }`
- [ ] Backend endpoint for refresh token (verify which one: `/auth/super/refresh-token` or `/tenant/auth/refresh-token`)
- [ ] Response structures match what code expects
- [ ] All cookies are saved correctly
- [ ] Token refresh flow works end-to-end

---

## Testing Recommendations

1. **Test Login Flow:**
   - Submit login form
   - Verify MFA token is saved
   - Verify redirect to verify-otp

2. **Test OTP Verification:**
   - Enter OTP
   - Verify auth_token is saved
   - ✅ **Verify refresh_token is saved** (currently missing)
   - Verify user cookie is saved
   - Verify redirect to dashboard

3. **Test Token Refresh:**
   - Wait for token to expire (or manually expire)
   - Make an API call
   - Verify refresh token is used
   - Verify new tokens are saved
   - ✅ **Verify user cookie is updated** (currently saves as "customer")

