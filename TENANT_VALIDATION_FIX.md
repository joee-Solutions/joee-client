# Tenant Validation Error Fix

## Error Analysis

### Error Details:
```
Tenant validation error: AxiosError: Network Error
    at async getTenantConfig (src/lib/tenant.ts:7:16)
    at async middleware (src/middleware.ts:37:25)
```

### Root Cause:
1. **Network Error**: Axios is getting `ERR_NETWORK` when making server-side request from middleware
2. **Backend URL**: `https://joee-internal-backend-ljoov.ondigitalocean.app/v2/tenant/teef/ui`
3. **Status**: Backend is accessible (curl returns 404, meaning tenant doesn't exist)
4. **Issue**: Header conversion and request configuration problems

---

## Fixes Applied

### 1. Improved Header Handling
- Filter out browser-specific headers (sec-*, accept-encoding, etc.)
- Only include relevant headers (x-tenant-id, authorization, etc.)
- Safely convert Headers object to plain object

### 2. Better Error Handling
- Added timeout (5 seconds)
- Proper error logging for different error types
- Handle 404 gracefully (tenant doesn't exist)

### 3. Request Configuration
- Added `validateStatus` to not throw on 4xx errors
- Proper Content-Type and Accept headers
- Always include x-tenant-id header

---

## Updated Code

```typescript
export const getTenantConfig = async (domain: string, headers: Headers) => {
  const api = siteConfig.host;
  try {
    // Convert Headers object to plain object for axios
    const headersObj: Record<string, string> = {};
    
    // Safely iterate over headers
    try {
      headers.forEach((value, key) => {
        // Only include relevant headers for backend API
        const lowerKey = key.toLowerCase();
        if (
          lowerKey === "x-tenant-id" ||
          lowerKey === "authorization" ||
          lowerKey === "x-forwarded-for" ||
          lowerKey === "x-real-ip"
        ) {
          headersObj[key] = value;
        }
      });
    } catch (err) {
      // Fallback if headers.forEach fails
      if (headers.get) {
        const tenantId = headers.get("x-tenant-id");
        if (tenantId) headersObj["x-tenant-id"] = tenantId;
      }
    }
    
    // Always include x-tenant-id with the domain
    if (domain) {
      headersObj["x-tenant-id"] = domain;
    }

    const res = await axios.get(`${api}/v2/tenant/${domain}/ui`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...headersObj,
      },
      timeout: 5000, // 5 second timeout
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });
    
    // Check if response is successful
    if (res.status === 200 && res.data) {
      return res.data;
    }
    
    // 404 means tenant doesn't exist, which is expected
    return null;
  } catch (error: any) {
    // Detailed error logging
    if (error.code === "ECONNREFUSED") {
      console.error(`Tenant validation: Cannot connect to backend at ${api}`);
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      console.error(`Tenant validation: Request timeout connecting to ${api}`);
    } else if (error.response) {
      // 404 is expected for non-existent tenants
      if (error.response.status !== 404) {
        console.error(`Tenant validation failed: ${error.response.status}`);
      }
    } else if (error.code === "ERR_NETWORK") {
      console.error(`Tenant validation: Network error - ${error.message}`);
    }
    return null;
  }
};
```

---

## Testing

### Backend Accessibility:
```bash
curl -I "https://joee-internal-backend-ljoov.ondigitalocean.app/v2/tenant/teef/ui"
# Returns: HTTP/2 404 (backend is accessible, tenant doesn't exist)
```

### Expected Behavior:
1. **Valid Tenant**: Returns tenant config, middleware allows request
2. **Invalid Tenant**: Returns 404/null, middleware redirects to /not-found
3. **Network Error**: Logs error, returns null, middleware redirects to /not-found
4. **Timeout**: Logs timeout error, returns null, middleware redirects to /not-found

---

## Next Steps

1. **Test with valid tenant**: Verify tenant validation works with a real tenant
2. **Monitor logs**: Check if network errors persist
3. **Backend check**: Ensure backend API endpoint is correct and accessible
4. **SSL/HTTPS**: If errors persist, check SSL certificate validation

---

## Notes

- The error shows `ERR_NETWORK` which typically means:
  - Connection refused
  - DNS resolution failure
  - SSL/TLS handshake failure
  - Network timeout

- Since curl works, the issue is likely:
  - Header format/conversion
  - Axios configuration in Node.js middleware context
  - The improved code should handle this better


