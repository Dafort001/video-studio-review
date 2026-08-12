import { cookies } from "next/headers";
import type { Session } from "next-auth";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { readConfiguredSecret } from "@/lib/secret-auth";

export const TEMP_ADMIN_COOKIE_NAME = "piximmo_beta_admin";

const TEMP_ADMIN_ISSUER = "piximmo-beta-admin";
const TEMP_ADMIN_AUDIENCE = "piximmo-web";
const TEMP_ADMIN_MAX_AGE_SECONDS = 60 * 60 * 12;

interface TempAdminPayload extends JWTPayload {
  email: string;
  name?: string;
  role: "admin";
  type: "temp-admin";
}

function getTempAdminSecret() {
  if (process.env.PIXIMMO_ENABLE_TEMP_ADMIN !== "1") return null;
  const secret = readConfiguredSecret("PIXIMMO_BETA_ADMIN_SECRET");
  return secret ? new TextEncoder().encode(secret) : null;
}

function buildTempAdminSession(payload: TempAdminPayload): Session {
  return {
    expires: payload.exp
      ? new Date(payload.exp * 1000).toISOString()
      : new Date(Date.now() + TEMP_ADMIN_MAX_AGE_SECONDS * 1000).toISOString(),
    user: {
      id: "temp-beta-admin",
      name: payload.name ?? "PIX.IMMO Admin",
      email: payload.email,
      role: "admin",
      isApproved: true,
      customerId: null,
      needsProfileUpdate: false,
    },
  } as Session;
}

export async function signTempAdminToken(input: {
  email: string;
  name?: string;
  expiresIn?: string;
}) {
  const secret = getTempAdminSecret();
  if (!secret) throw new Error("Temporary admin login is disabled");
  return new SignJWT({
    email: input.email,
    name: input.name,
    role: "admin",
    type: "temp-admin" as const,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(TEMP_ADMIN_ISSUER)
    .setAudience(TEMP_ADMIN_AUDIENCE)
    .setExpirationTime(input.expiresIn ?? "12h")
    .sign(secret);
}

export async function verifyTempAdminToken(
  token: string | undefined | null
): Promise<TempAdminPayload | null> {
  if (!token) {
    return null;
  }

  const secret = getTempAdminSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: TEMP_ADMIN_ISSUER,
      audience: TEMP_ADMIN_AUDIENCE,
    });

    if (payload.type !== "temp-admin" || payload.role !== "admin") {
      return null;
    }

    return payload as TempAdminPayload;
  } catch {
    return null;
  }
}

export async function getTempAdminSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEMP_ADMIN_COOKIE_NAME)?.value;
  const payload = await verifyTempAdminToken(token);

  if (!payload) {
    return null;
  }

  return buildTempAdminSession(payload);
}

export async function setTempAdminCookie(token: string) {
  const payload = await verifyTempAdminToken(token);
  if (!payload) {
    return false;
  }

  const cookieStore = await cookies();
  const expiresAt = payload.exp
    ? new Date(payload.exp * 1000)
    : new Date(Date.now() + TEMP_ADMIN_MAX_AGE_SECONDS * 1000);

  cookieStore.set(TEMP_ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: payload.exp
      ? Math.max(Math.floor(payload.exp - Date.now() / 1000), 1)
      : TEMP_ADMIN_MAX_AGE_SECONDS,
  });

  return true;
}

export async function clearTempAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TEMP_ADMIN_COOKIE_NAME);
}
