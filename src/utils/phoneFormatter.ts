/**
 * Helper function to format phone numbers for backend validation
 * Backend expects E.164 format (e.g., +1234567890 or +2349023893815)
 */
import validator from "validator";

const E164 = /^\+\d{10,15}$/;

function pickValidE164(candidates: string[]): string | undefined {
  const valid = candidates.filter((c) => E164.test(c) && validator.isMobilePhone(c, "any"));
  if (valid.length === 1) return valid[0];
  if (valid.length > 1) {
    // Prefer Nigerian when both match (product default); otherwise first match
    const ng = valid.find((c) => c.startsWith("+234"));
    return ng ?? valid[0];
  }
  return undefined;
}

export function formatPhoneNumber(phone: string | undefined): string | undefined {
  if (!phone || !phone.trim()) return undefined;

  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.replace(/[^\d+]/g, "");
    if (E164.test(cleaned) && validator.isMobilePhone(cleaned, "any")) {
      return cleaned;
    }
    if (E164.test(cleaned)) {
      return undefined;
    }
  }

  cleaned = cleaned.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("0") && cleaned.length >= 10) {
    const ng = "+234" + cleaned.substring(1);
    if (E164.test(ng) && validator.isMobilePhone(ng, "any")) return ng;
  }

  if (cleaned.startsWith("234") && cleaned.length >= 13) {
    const withPlus = "+" + cleaned;
    if (E164.test(withPlus) && validator.isMobilePhone(withPlus, "any")) return withPlus;
  }

  if (/^1\d{10}$/.test(cleaned)) {
    const us = "+" + cleaned;
    if (E164.test(us) && validator.isMobilePhone(us, "any")) return us;
  }

  if (/^\d{10}$/.test(cleaned)) {
    return pickValidE164(["+234" + cleaned, "+1" + cleaned]);
  }

  if (/^\d{11}$/.test(cleaned) && cleaned.startsWith("0")) {
    const ng = "+234" + cleaned.substring(1);
    if (E164.test(ng) && validator.isMobilePhone(ng, "any")) return ng;
  }

  if (/^\d{10,15}$/.test(cleaned) && !cleaned.startsWith("0")) {
    const withPlus = "+" + cleaned;
    if (E164.test(withPlus) && validator.isMobilePhone(withPlus, "any")) return withPlus;
  }

  return undefined;
}
