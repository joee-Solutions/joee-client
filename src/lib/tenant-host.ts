const RESERVED_SUBDOMAIN_LABELS = new Set(["www", "api"]);

export type ParsedTenantHost = {
  /** Hostname without port (lowercase). */
  hostname: string;
  port: string;
  /** True when host is apex (e.g. locicare.com), not a tenant subdomain. */
  isApex: boolean;
  /** Tenant slug from subdomain (e.g. jidez from jidez.locicare.com), or null. */
  tenantSubdomain: string | null;
  /** Hostname after stripping a leading www (e.g. jidez.locicare.com). */
  canonicalHostname: string;
  /** Whether the request host started with www and should redirect to canonicalHostname. */
  shouldRedirectFromWww: boolean;
};

function splitHostHeader(hostHeader: string): { hostname: string; port: string } {
  const raw = (hostHeader || "").trim().toLowerCase();
  if (!raw) return { hostname: "", port: "" };
  const colon = raw.indexOf(":");
  if (colon === -1) return { hostname: raw, port: "" };
  return { hostname: raw.slice(0, colon), port: raw.slice(colon + 1) };
}

function stripLeadingWww(parts: string[]): {
  parts: string[];
  strippedWww: boolean;
} {
  if (parts[0] === "www") {
    return { parts: parts.slice(1), strippedWww: true };
  }
  return { parts, strippedWww: false };
}

function isReservedTenantLabel(label: string | undefined): boolean {
  return !label || RESERVED_SUBDOMAIN_LABELS.has(label);
}

/**
 * Parse Host header into apex vs tenant subdomain.
 * Strips a leading `www` before resolving tenant (www.jidez.locicare.com → jidez).
 */
export function parseTenantHost(hostHeader: string | null | undefined): ParsedTenantHost {
  const { hostname, port } = splitHostHeader(hostHeader ?? "");
  const { parts: hostParts, strippedWww } = stripLeadingWww(hostname.split(".").filter(Boolean));
  const canonicalHostname = hostParts.join(".");

  const base: ParsedTenantHost = {
    hostname,
    port,
    isApex: true,
    tenantSubdomain: null,
    canonicalHostname,
    shouldRedirectFromWww: strippedWww && hostParts.length > 0,
  };

  if (hostParts.length === 0) return base;

  // Vercel: tenant.project.vercel.app (4 labels) vs project.vercel.app (3 labels)
  if (
    hostParts.length >= 3 &&
    hostParts[hostParts.length - 2] === "vercel" &&
    hostParts[hostParts.length - 1] === "app"
  ) {
    if (hostParts.length >= 4 && !isReservedTenantLabel(hostParts[0])) {
      return { ...base, isApex: false, tenantSubdomain: hostParts[0] };
    }
    return base;
  }

  // localhost: tenant.localhost
  if (hostParts[hostParts.length - 1] === "localhost") {
    if (hostParts.length >= 2 && !isReservedTenantLabel(hostParts[0]) && hostParts[0] !== "localhost") {
      return { ...base, isApex: false, tenantSubdomain: hostParts[0] };
    }
    return base;
  }

  // Apex: domain.tld (exactly two labels after www strip)
  if (hostParts.length <= 2) return base;

  const candidate = hostParts[0];
  if (isReservedTenantLabel(candidate)) return base;

  return { ...base, isApex: false, tenantSubdomain: candidate };
}

export function getTenantSubdomainFromHost(hostHeader: string | null | undefined): string | null {
  return parseTenantHost(hostHeader).tenantSubdomain;
}

export function buildWwwStripRedirectUrl(requestUrl: string, hostHeader: string): URL | null {
  const parsed = parseTenantHost(hostHeader);
  if (!parsed.shouldRedirectFromWww) return null;

  const url = new URL(requestUrl);
  url.hostname = parsed.canonicalHostname;
  if (parsed.port) url.port = parsed.port;
  else url.port = "";
  return url;
}
