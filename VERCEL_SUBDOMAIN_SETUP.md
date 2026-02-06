# Vercel Subdomain Configuration Guide

## Important: Vercel Auto-Supports Subdomains

**Good News**: Vercel automatically supports wildcard subdomains for `*.vercel.app` domains. You don't need to manually add `*.joee-client-blond.vercel.app` in the Domains settings.

Any subdomain like `doe.joee-client-blond.vercel.app` should work automatically.

## Problem
When accessing `https://doe.joee-client-blond.vercel.app/login`, you get a "connection unexpectedly closed" error.

## Possible Causes & Solutions

### 1. Deployment Issue
The subdomain might not be routing correctly. Try:
- **Redeploy the project** - Sometimes Vercel needs a fresh deployment to recognize subdomain routing
- Check the deployment logs for any errors

### 2. Middleware Configuration
The middleware should automatically extract the tenant from the subdomain. Verify:
- The middleware is running (check Vercel function logs)
- The subdomain format matches: `{tenant}.joee-client-blond.vercel.app`

### Step 3: Test the Configuration

After adding the wildcard domain:
- `https://doe.joee-client-blond.vercel.app/login` should work
- `https://any-tenant.joee-client-blond.vercel.app/login` should work
- `https://joee-client-blond.vercel.app/login` will redirect to root page (expected behavior)

## Alternative: Custom Domain with Wildcard

If you're using a custom domain (e.g., `joee.com`):

1. Add the wildcard domain: `*.joee.com` in Vercel
2. Configure DNS records:
   - Add a CNAME record: `*.joee.com` → `cname.vercel-dns.com`
   - Or use Vercel's automatic DNS configuration

## Important Notes

- **Root Domain Access**: The root domain (`joee-client-blond.vercel.app`) will show a "Tenant Missing" message. This is expected behavior for multi-tenant applications.
- **Subdomain Format**: Subdomains must match the pattern: `{tenant}.joee-client-blond.vercel.app`
- **Tenant Validation**: The middleware validates that the tenant exists in your backend before allowing access.

## Troubleshooting

### Issue: Subdomain still not working after adding wildcard
- **Solution**: Wait a few minutes for DNS propagation, then try again
- Check Vercel deployment logs for any errors
- Verify the subdomain format matches: `tenant.project.vercel.app`

### Issue: "This site can't be reached" or "Connection unexpectedly closed"
- **Solution 1**: Redeploy your project - Vercel may need a fresh deployment to recognize subdomain routing
- **Solution 2**: Check Vercel Function Logs - Go to your deployment → Functions tab → Check middleware logs
- **Solution 3**: Verify the subdomain format - Must be: `{tenant}.joee-client-blond.vercel.app` where tenant is lowercase alphanumeric with hyphens
- **Solution 4**: Check if the middleware is running - Look for console logs starting with "🔍 Middleware triggered" in Vercel logs
- **Solution 5**: Try accessing the subdomain directly: `https://doe.joee-client-blond.vercel.app` (without /login first)

### Issue: "Tenant Missing" on subdomain
- **Solution**: This means the tenant doesn't exist in your backend
- Verify the tenant is registered in your backend system
- Check backend API endpoint: `/v2/tenant/{domain}/ui`

