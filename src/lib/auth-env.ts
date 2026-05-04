export function getSessionSecret(): string {
  const s = process.env.APP_SESSION_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV !== "production") return "dev-only-insecure-secret-change-me";
  return "";
}
