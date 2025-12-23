# Runtime Errors Found

## Issues Discovered

### 1. Root Domain Access (localhost:3000) ❌
**Problem:** When accessing `http://localhost:3000` directly:
- Middleware extracts "localhost" as subdomain
- `isValidSlug("localhost")` returns `false` (contains invalid characters)
- Falls through to root `page.tsx`
- `page.tsx` redirects to `/login`
- `/login` doesn't exist without tenant → 404

**Expected Behavior:** 
- Should show a landing page or error message
- Should NOT redirect to `/login` when no tenant subdomain exists

**Fix Needed:**
Update `src/app/page.tsx` to handle root domain access without redirecting to login.

---

### 2. Tenant Subdomain Access (teef.localhost:3000) ❌
**Problem:** When accessing `http://teef.localhost:3000`:
- Middleware extracts "teef" as subdomain
- Validates subdomain (passes)
- Calls `getTenantConfig("teef")`
- If tenant config returns `null` → redirects to `/not-found`
- `/not-found` route doesn't exist → 404

**Possible Causes:**
1. Backend API not running or not accessible
2. Tenant "teef" doesn't exist in backend
3. `getTenantConfig` is failing (network error, timeout, etc.)
4. Backend endpoint `/v2/tenant/{domain}/ui` not returning expected response

**Fix Needed:**
1. Check if backend is running
2. Verify tenant exists in backend
3. Create `/not-found` page if needed
4. Handle tenant validation errors gracefully

---

### 3. Missing /not-found Route ❌
**Problem:** 
- Middleware redirects to `/not-found` when tenant is invalid
- But `/not-found` route doesn't exist in `src/app/`
- Results in 404 error

**Fix Needed:**
Create `src/app/not-found/page.tsx` to handle invalid tenants.

---

### 4. Root Page Redirect Logic ❌
**Problem:**
- `src/app/page.tsx` always redirects to `/login` if no auth_token
- Doesn't check if we're on a tenant subdomain
- Results in 404 when accessing root domain

**Fix Needed:**
Update root page to:
1. Check if we're on a tenant subdomain
2. Only redirect to login if on tenant subdomain
3. Show appropriate message for root domain access

---

## Current Behavior Analysis

### When accessing `localhost:3000`:
```
1. Middleware: host = "localhost:3000"
2. subdomain = "localhost"
3. isValidSlug("localhost") = false (contains uppercase or invalid)
4. host !== rootDomain → false (localhost:3000 === localhost:3000)
5. Skips redirect, returns NextResponse.next()
6. Serves root page.tsx
7. page.tsx: no auth_token → redirects to "/login"
8. "/login" doesn't exist → 404
```

### When accessing `teef.localhost:3000`:
```
1. Middleware: host = "teef.localhost:3000"
2. subdomain = "teef"
3. isValidSlug("teef") = true
4. Calls getTenantConfig("teef")
5. If returns null → redirects to "/not-found"
6. "/not-found" doesn't exist → 404
7. If returns config → rewrites to "/teef/login" or "/teef/{path}"
```

---

## Recommended Fixes

### Fix 1: Update Root Page
```typescript
// src/app/page.tsx
"use client";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Check if we're on a tenant subdomain
    const host = window.location.host;
    const subdomain = host.split(".")[0];
    const isRootDomain = subdomain === "localhost" || subdomain === "www" || !subdomain.includes(".");
    
    if (isRootDomain) {
      // Root domain access - show message or redirect to docs
      console.log("Root domain accessed - tenant subdomain required");
      // Option: Show landing page or redirect to documentation
      return;
    }
    
    // Tenant subdomain - check auth and redirect to login if needed
    if (!Cookies.get("auth_token")) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div>
      <h1>Welcome to Joee Solutions</h1>
      <p>Please access via tenant subdomain (e.g., tenant.localhost:3000)</p>
    </div>
  );
};

export default HomePage;
```

### Fix 2: Create Not Found Page
```typescript
// src/app/not-found/page.tsx
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-4">Tenant Not Found</p>
        <p className="text-gray-600">
          The tenant you're looking for doesn't exist or is invalid.
        </p>
      </div>
    </div>
  );
}
```

### Fix 3: Improve Tenant Validation Error Handling
```typescript
// src/lib/tenant.ts
export const getTenantConfig = async (domain: string, headers: Headers) => {
  const api = siteConfig.host;
  try {
    const res = await axios.get(`${api}/v2/tenant/${domain}/ui`, {
      headers: headers as any,
      timeout: 5000, // Add timeout
    });
    
    // Check if response is successful
    if (res.status === 200 && res.data) {
      return res.data;
    }
    return null;
  } catch (error: any) {
    console.log("Tenant validation error:", error.message);
    // Log more details for debugging
    if (error.response) {
      console.log("Response status:", error.response.status);
      console.log("Response data:", error.response.data);
    }
    return null;
  }
};
```

---

## Testing Checklist

- [ ] Backend API is running and accessible
- [ ] Tenant "teef" exists in backend database
- [ ] Endpoint `/v2/tenant/{domain}/ui` is working
- [ ] `/not-found` route exists
- [ ] Root page handles root domain access correctly
- [ ] Tenant subdomain access works correctly
- [ ] Login redirect works on tenant subdomains

---

## Next Steps

1. **Verify Backend:**
   - Check if backend is running
   - Verify tenant exists
   - Test `/v2/tenant/teef/ui` endpoint manually

2. **Create Missing Routes:**
   - Create `/not-found` page
   - Update root page logic

3. **Test Again:**
   - Access `localhost:3000` → should show landing/message
   - Access `teef.localhost:3000` → should work if tenant exists
   - Access `invalid.localhost:3000` → should show not-found page

