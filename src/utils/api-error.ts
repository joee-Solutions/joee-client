/**
 * Collects all error messages from an API error for display.
 * Handles: message, error, errors (array or record), and status-specific text.
 */
export function getApiErrorMessages(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string[] {
  const messages: string[] = [];
  const data = (error as any)?.response?.data;
  const status = (error as any)?.response?.status;

  if (data) {
    // Single message
    if (typeof data.message === "string" && data.message.trim()) {
      messages.push(data.message.trim());
    }
    // Alternate single error field
    if (typeof data.error === "string" && data.error.trim()) {
      const s = data.error.trim();
      if (!messages.includes(s)) messages.push(s);
    }
    // Array of messages (e.g. validation errors)
    if (Array.isArray(data.errors)) {
      for (const item of data.errors) {
        if (typeof item === "string" && item.trim()) {
          if (!messages.includes(item.trim())) messages.push(item.trim());
        } else if (item?.message && typeof item.message === "string") {
          const s = item.message.trim();
          if (!messages.includes(s)) messages.push(s);
        }
      }
    }
    // Record of field -> message (e.g. { name: "Name is required", code: "Code already exists" })
    if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
      for (const key of Object.keys(data.errors)) {
        const val = (data.errors as Record<string, unknown>)[key];
        if (typeof val === "string" && val.trim()) {
          const s = val.trim();
          if (!messages.includes(s)) messages.push(s);
        } else if (Array.isArray(val)) {
          val.forEach((v) => {
            if (typeof v === "string" && v.trim() && !messages.includes(v.trim())) {
              messages.push(v.trim());
            }
          });
        }
      }
    }
  }

  // Status-based defaults only if we have no messages from body
  if (messages.length === 0 && status) {
    if (status === 403) messages.push("Access denied. You don't have permission for this action.");
    else if (status === 401) messages.push("Authentication failed. Please log in again.");
    else if (status === 400) messages.push("Invalid data. Please check your input.");
    else if (status >= 500) messages.push("Server error. Please try again later.");
  }

  // Generic error message
  if (messages.length === 0 && (error as Error)?.message) {
    const s = String((error as Error).message).trim();
    if (s) messages.push(s);
  }

  if (messages.length === 0) messages.push(fallback);
  return messages;
}

/**
 * Returns a single string with all error messages (one per line).
 */
export function getApiErrorMessagesString(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  return getApiErrorMessages(error, fallback).join("\n");
}
