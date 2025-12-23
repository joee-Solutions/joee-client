export const siteConfig = {
  siteUrl: process.env.SITE_URL || "http://localhost:3600",
  siteName: process.env.SITE_NAME || "LociCare",
  host:process.env.API_URL || "https://joee-internal-backend-ljoov.ondigitalocean.app",
  orgId:process.env.ORG_ID || "1",
  domainAsOrg:process.env.DOMAIN_AS_ORG || false,
};
