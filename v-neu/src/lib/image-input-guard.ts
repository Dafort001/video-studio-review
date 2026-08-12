import path from "node:path";

const MAX_REMOTE_IMAGE_BYTES = 20 * 1024 * 1024;

export function resolveSafePublicImagePath(imagePath: string) {
  if (!imagePath.startsWith("/") || imagePath.includes("\\") || /[\0-\x1f\x7f]/.test(imagePath)) {
    throw new Error("Invalid public image path");
  }
  const publicRoot = path.resolve(process.cwd(), "public");
  const resolved = path.resolve(publicRoot, imagePath.replace(/^\/+/, ""));
  if (resolved === publicRoot || !resolved.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error("Image path escapes public directory");
  }
  return resolved;
}

function configuredHosts() {
  const hosts = new Set(
    (process.env.VIDEO_STUDIO_IMAGE_HOST_ALLOWLIST ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
  for (const name of ["R2_ENDPOINT_URL", "NEXT_PUBLIC_APP_URL", "NEXTAUTH_URL"]) {
    const value = process.env[name];
    if (!value) continue;
    try {
      hosts.add(new URL(value).hostname.toLowerCase());
    } catch {
      // Invalid operational URLs are not silently allowlisted.
    }
  }
  return hosts;
}

export function assertAllowedRemoteImageUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid remote image URL");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    throw new Error("Remote images require an HTTPS URL without credentials or a custom port");
  }
  if (!configuredHosts().has(url.hostname.toLowerCase())) {
    throw new Error("Remote image host is not allowlisted");
  }
  return url;
}

export async function fetchAllowedRemoteImage(value: string) {
  const url = assertAllowedRemoteImageUrl(value);
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
  if (response.status >= 300 && response.status < 400) {
    throw new Error("Remote image redirects are not allowed");
  }
  if (!response.ok) throw new Error(`Remote image returned HTTP ${response.status}`);
  const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (!contentType?.startsWith("image/")) throw new Error("Remote resource is not an image");
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REMOTE_IMAGE_BYTES) throw new Error("Remote image is too large");

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Remote image body is unavailable");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    total += chunk.byteLength;
    if (total > MAX_REMOTE_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error("Remote image is too large");
    }
    chunks.push(chunk);
  }
  return {
    bytes: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
    contentType,
  };
}
