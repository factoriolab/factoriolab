export function normalizeObjectPath(
  pathStr: string | undefined | null,
): string | null {
  if (pathStr == null) return null;
  // Trim whitespace
  let s = pathStr.trim();
  // Remove trailing dot-number suffix (e.g., .0, .1)
  s = s.replace(/\.[0-9]+$/g, '');
  return s;
}
