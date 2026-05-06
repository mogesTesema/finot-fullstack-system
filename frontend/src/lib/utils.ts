// src/lib/utils.ts

/**
 * Sanitizes UUID parameters to prevent API errors from null/undefined/empty values
 * Returns null for invalid values, which should skip the API call
 */
export const sanitizeUuid = (uuid: string | null | undefined): string | null => {
  if (!uuid || uuid === "null" || uuid === "undefined" || uuid === "") {
    return null;
  }
  // Basic UUID format check (optional but recommended)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    console.warn(`Invalid UUID format: ${uuid}`);
    return null;
  }
  return uuid;
};