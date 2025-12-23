# Bug Fixes Summary - https.ts

## Bugs Fixed

### 1. ✅ **Typeof Window Check Bug** (Critical)
**Location:** Lines 37, 59, and in `get-token.ts`

**Problem:**
```typescript
// WRONG - typeof returns a string, comparing to undefined (value) is always true
if (typeof window !== undefined)
```

**Fix:**
```typescript
// CORRECT - Compare to string "undefined"
if (typeof window !== "undefined")
```

**Impact:** Axios instances were not being created properly in browser environment, causing API calls to fail.

---

### 2. ✅ **Cookie Name Inconsistency** (Medium)
**Location:** Line 214

**Problem:**
```typescript
Cookies.set("customer", JSON.stringify(tResponse.user), { expires: 1 / 48 });
```

**Fix:**
```typescript
Cookies.set("user", JSON.stringify(tResponse.user), { expires: 1 / 48 });
```

**Impact:** Cookie name mismatch could cause user data to not be retrieved correctly elsewhere in the application.

---

### 3. ✅ **Base URL Construction for Root Domain** (Medium)
**Location:** Lines 19-32 (`getBaseURL` function)

**Problem:**
When accessing root domain (`localhost:3000`), subdomain extraction returns "localhost", creating invalid URL:
```
http://localhost.localhost:3600/api  // ❌ Invalid
```

**Fix:**
Added root domain detection and fallback to `API_URL` environment variable:
```typescript
// Handle root domain case (localhost:3000 or joee.com.ng)
if (subdomain === "localhost" || subdomain === "www" || !subdomain) {
  const apiUrl = process.env.API_URL || "http://localhost:3700";
  return `${apiUrl}/api`;
}
```

**Impact:** Root domain access now correctly routes to backend API.

---

### 4. ✅ **Missing PATCH Method Support** (Low)
**Location:** `processRequestAuth` and `processRequestNoAuth` functions

**Problem:**
PATCH requests were not supported, causing errors when trying to use PATCH method.

**Fix:**
- Added `"patch"` to method type union
- Added PATCH handling in both functions:
```typescript
else if (method === "patch") {
  rt = await httpAuth.patch(`${path}`, data);
}
```

**Impact:** PATCH requests now work correctly.

---

### 5. ✅ **Removed Unused Import** (Low)
**Location:** Line 3

**Problem:**
```typescript
import { siteConfig } from "@/framework/site-config";  // Never used
```

**Fix:**
Removed unused import.

**Impact:** Cleaner code, no unused import warnings.

---

## Additional Fixes in get-token.ts

Fixed the same `typeof window` bug in:
- `getToken()` function
- `getRefreshToken()` function  
- `getMfaToken()` function

---

## Testing Recommendations

1. **Test API calls from root domain** (`localhost:3000`)
   - Should use `API_URL` environment variable
   - Should not create invalid URLs

2. **Test authenticated requests**
   - Verify Bearer token is attached
   - Verify token refresh works on 401

3. **Test cookie storage**
   - Verify `user` cookie is set after login/refresh
   - Verify cookies are cleared on logout

4. **Test PATCH requests**
   - Verify PATCH method works in both `processRequestAuth` and `processRequestNoAuth`

5. **Test file uploads**
   - Verify FormData conversion works correctly
   - Verify multipart requests succeed

---

## Remaining TypeScript Warnings

The following warnings remain (non-critical, code quality improvements):
- Multiple `any` types used throughout (acceptable for now, can be improved later)
- These are style/type safety warnings, not functional bugs

---

## Files Modified

1. ✅ `src/framework/https.ts` - Fixed all bugs
2. ✅ `src/framework/get-token.ts` - Fixed typeof bug

---

**Status:** All critical and medium priority bugs fixed ✅

