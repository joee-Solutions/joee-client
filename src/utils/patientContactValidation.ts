import validator from "validator";

const E164 = /^\+\d{10,15}$/;

/** Aligns with typical Nest `class-validator` `@IsEmail()` behavior more closely than a loose regex. */
export function isContactEmailValid(val: unknown): boolean {
  if (val == null) return false;
  const s = typeof val === "string" ? val.trim() : String(val).trim();
  return s.length > 0 && validator.isEmail(s);
}

/**
 * True if the string is plausible E.164 and matches at least one `validator` mobile locale.
 * This avoids sending values that pass a naive `+digits` regex but fail backend phone validation.
 */
export function isContactMobileE164Valid(val: unknown): boolean {
  if (val == null) return false;
  const s = String(val).trim();
  if (!E164.test(s)) return false;
  try {
    // Backend phone validation appears to be Nigeria-focused.
    // Tighten to en-NG so we don't send values that pass generic E.164
    // but fail backend's stricter phone rules.
    return validator.isMobilePhone(s, "en-NG");
  } catch {
    return false;
  }
}
