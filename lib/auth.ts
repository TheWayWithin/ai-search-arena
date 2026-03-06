import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { timingSafeEqual } from "crypto";

// ── Constants ──────────────────────────────────────────────────

export const SESSION_COOKIE = "admin_session";
const JWT_ISSUER = "aisearcharena";
const JWT_AUDIENCE = "admin";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

// ── JWT ────────────────────────────────────────────────────────

export interface SessionPayload {
  sub: string;
  role: "admin";
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Credentials ────────────────────────────────────────────────

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const passwordHashB64 = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !passwordHashB64) {
    return false;
  }

  // Hash is stored as base64 to avoid $ escaping issues in .env files
  const passwordHash = Buffer.from(passwordHashB64, "base64").toString("utf-8");

  // Constant-time username comparison to prevent timing attacks
  const usernameBuffer = Buffer.from(username);
  const expectedBuffer = Buffer.from(expectedUsername);
  const usernameMatch =
    usernameBuffer.length === expectedBuffer.length &&
    timingSafeEqual(usernameBuffer, expectedBuffer);

  // Always check password to prevent timing leaks on username
  const passwordMatch = await bcrypt.compare(password, passwordHash);

  return usernameMatch && passwordMatch;
}

// ── Lockout ────────────────────────────────────────────────────

export async function checkLockout(): Promise<{
  locked: boolean;
  remainingMs: number;
}> {
  const attempt = await prisma.adminLoginAttempt.findUnique({
    where: { identifier: "admin" },
  });

  if (!attempt || !attempt.lockedUntil) {
    return { locked: false, remainingMs: 0 };
  }

  const now = Date.now();
  const lockedUntilMs = attempt.lockedUntil.getTime();

  if (now < lockedUntilMs) {
    return { locked: true, remainingMs: lockedUntilMs - now };
  }

  return { locked: false, remainingMs: 0 };
}

export async function recordFailedAttempt(): Promise<void> {
  const attempt = await prisma.adminLoginAttempt.upsert({
    where: { identifier: "admin" },
    create: {
      identifier: "admin",
      failedCount: 1,
      lastAttempt: new Date(),
    },
    update: {
      failedCount: { increment: 1 },
      lastAttempt: new Date(),
    },
  });

  if (attempt.failedCount >= MAX_FAILED_ATTEMPTS) {
    await prisma.adminLoginAttempt.update({
      where: { identifier: "admin" },
      data: {
        lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
      },
    });
  }
}

export async function clearFailedAttempts(): Promise<void> {
  await prisma.adminLoginAttempt.upsert({
    where: { identifier: "admin" },
    create: { identifier: "admin", failedCount: 0 },
    update: { failedCount: 0, lockedUntil: null },
  });
}

// ── Session ────────────────────────────────────────────────────

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/admin",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
