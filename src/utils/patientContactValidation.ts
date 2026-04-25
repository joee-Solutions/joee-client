import validator from "validator";

const E164 = /^\+\d{10,15}$/;

/** Aligns with typical Nest `class-validator` `@IsEmail()` behavior more closely than a loose regex. */
export function isContactEmailValid(val: unknown): boolean {
  if (val == null) return false;
  const s = typeof val === "string" ? val.trim() : String(val).trim();
  return s.length > 0 && validator.isEmail(s);
}

/**
 * True if the string is plausible E.164 and passes `validator.isMobilePhone` with a global locale list.
 * (Previously en-NG-only, which rejected valid numbers from `formatPhoneNumber` and caused PATCH 400s.)
 */
export function isContactMobileE164Valid(val: unknown): boolean {
  if (val == null) return false;
  const s = String(val).trim();
  if (!E164.test(s)) return false;
  try {
    return validator.isMobilePhone(s, "any");
  } catch {
    return false;
  }
}
