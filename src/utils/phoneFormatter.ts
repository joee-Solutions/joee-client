/**
 * Helper function to format phone numbers for backend validation
 * Backend expects E.164 format (e.g., +1234567890 or +2349023893815)
 */
export function formatPhoneNumber(phone: string | undefined): string | undefined {
  if (!phone || !phone.trim()) return undefined;
  
  // Remove all spaces, dashes, parentheses, and other formatting
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');
  
  // If already starts with +, validate and return
  if (cleaned.startsWith('+')) {
    // Ensure it's a valid international format (at least + and digits)
    if (/^\+\d{10,15}$/.test(cleaned)) {
      return cleaned;
    }
    // If invalid format, try to fix it
    cleaned = cleaned.replace(/[^\d+]/g, '');
    if (/^\+\d{10,15}$/.test(cleaned)) {
      return cleaned;
    }
  }
  
  // If starts with 0 (Nigerian local format), convert to +234
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    return '+234' + cleaned.substring(1);
  }
  
  // If starts with 234 (Nigerian country code without +), add +
  if (cleaned.startsWith('234') && cleaned.length >= 13) {
    return '+' + cleaned;
  }
  
  // If it's all digits (10-15 digits), assume it needs country code
  // For Nigerian numbers, add +234 if it's 10-11 digits
  if (/^\d{10,11}$/.test(cleaned)) {
    // Assume Nigerian number if it starts with 0 or is 10-11 digits
    if (cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    }
    // If 10 digits and starts with 0-9, assume Nigerian
    return '+234' + cleaned;
  }
  
  // If it's already in a valid format (10-15 digits with country code), add + if missing
  if (/^\d{10,15}$/.test(cleaned)) {
    return '+' + cleaned;
  }
  
  // If contains non-digit characters (except +), clean and try again
  cleaned = cleaned.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+') && /^\+\d{10,15}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Last resort: if we can't format it properly, return undefined
  // This ensures invalid phone numbers are not sent to the backend
  return undefined;
}

