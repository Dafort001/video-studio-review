export function hasAuthenticatedUser(value: unknown): value is {
  user: { id: string };
} {
  if (!value || typeof value !== "object" || !("user" in value)) return false;

  const user = value.user;
  if (!user || typeof user !== "object" || !("id" in user)) return false;

  return typeof user.id === "string" && user.id.trim().length > 0;
}

export function normalizeAuthEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const email = value.trim().normalize("NFKC").toLowerCase();
  const separator = email.indexOf("@");

  if (
    separator <= 0 ||
    separator !== email.lastIndexOf("@") ||
    separator === email.length - 1
  ) {
    return null;
  }

  return email;
}
