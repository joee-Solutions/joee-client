# Subdomain Extraction Flow

## ✅ Current Architecture (Already Implemented)

The subdomain extraction is correctly handled through a **server-side approach** using the API proxy pattern.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend (https.ts)                                      │
│    - baseURL = "/api"                                       │
│    - Makes request: /api/tenant/auth/login                  │
│    - Browser automatically includes Host header             │
│      (e.g., Host: teef.localhost:3000)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Next.js API Route (route.ts)                            │
│    - Receives request with Host header                     │
│    - getTenantId(req) extracts subdomain:                  │
│      const host = req.headers.get("host")                  │
│      const subdomain = host.split(".")[0]                  │
│      // Returns "teef" for teef.localhost:3000             │
│    - Adds x-tenant-id header to backend request            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend API (siteConfig.host)                           │
│    - Receives request with x-tenant-id: "teef" header      │
│    - Can identify which tenant the request belongs to      │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Client-Side (`https.ts`)

```typescript
// ✅ Correctly does NOT extract subdomain
// Just uses relative path - browser handles host header automatically
const getBaseURL = () => {
  if (typeof window === "undefined") return "";
  return "/api";  // Relative URL - uses current host
};
```

**Why this works:**
- Browser automatically includes the `Host` header in requests
- When accessing `teef.localhost:3000`, the Host header is `teef.localhost:3000`
- The subdomain is preserved in the request

---

### 2. Server-Side Proxy (`route.ts`)

```typescript
// ✅ Extracts subdomain from request headers
const getTenantId = (req: NextRequest): string | undefined => {
  const host = req.headers.get("host") || "";
  const subdomain = host.split(".")[0];
  // Only return subdomain if it's a valid tenant
  return subdomain && subdomain !== "localhost" && subdomain !== "www" 
    ? subdomain 
    : undefined;
};

// Used in all handlers (GET, POST, PUT, DELETE, PATCH)
export async function POST(req: NextRequest) {
  const tenantId = getTenantId(req);  // Extract subdomain
  
  const res = await axios.post(path, body, {
    headers: {
      ...otherHeaders,
      ...(tenantId ? { "x-tenant-id": tenantId } : {}),  // Send to backend
    },
  });
}
```

**Why this works:**
- Server-side has access to the request `Host` header
- Can extract subdomain reliably
- Sends it as `x-tenant-id` header to backend
- Backend can identify the tenant for the request

---

## Benefits of This Approach

1. **Security**: Subdomain extraction happens server-side (can't be manipulated by client)
2. **Reliability**: Browser automatically includes Host header (always accurate)
3. **Simplicity**: Client code doesn't need subdomain logic
4. **Flexibility**: Works in all environments (dev, staging, production)

---

## Comparison with Client-Side Approach (NOT Used)

❌ **If we did client-side extraction:**
```typescript
// This would be WRONG and unnecessary
const getBaseURL = () => {
  const { hostname } = window.location;
  const subdomain = hostname.split(".")[0];
  return `https://${subdomain}.joee.com.ng/api`;  // ❌ Not needed
};
```

**Why we DON'T do this:**
- Hardcodes domains (doesn't work across environments)
- Client can manipulate window.location (security risk)
- Requires different logic for dev/prod
- Unnecessary complexity

---

## Key Points

✅ **Client-side (`https.ts`)**: 
- Just uses `/api` (relative URL)
- No subdomain extraction needed
- Browser handles Host header automatically

✅ **Server-side (`route.ts`)**:
- Extracts subdomain from `req.headers.get("host")`
- Sends as `x-tenant-id` header to backend
- Handles all API methods (GET, POST, PUT, DELETE, PATCH)

✅ **Backend**:
- Receives `x-tenant-id` header
- Can identify tenant for request processing

---

## Verification

To verify this is working:

1. **Check Network Tab:**
   - Request to: `http://teef.localhost:3000/api/tenant/auth/login`
   - Host header: `teef.localhost:3000`

2. **Check Backend Logs:**
   - Should receive `x-tenant-id: teef` header
   - Backend can process tenant-specific logic

3. **Check route.ts logs:**
   - Console log shows `clientInfo` with host information
   - `tenantId` is extracted and included in headers

---

## Conclusion

The subdomain extraction is **already correctly implemented** using the server-side proxy pattern. No changes needed to `https.ts` or `route.ts` for subdomain handling.


