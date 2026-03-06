"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyCredentials,
  signSessionToken,
  checkLockout,
  recordFailedAttempt,
  clearFailedAttempts,
  SESSION_COOKIE,
  getSessionCookieOptions,
} from "@/lib/auth";

export type AuthState = {
  ok: boolean;
  message: string;
};

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = formData.get("username");
  const password = formData.get("password");
  const from = formData.get("from");

  if (
    !username ||
    typeof username !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return { ok: false, message: "Username and password are required." };
  }

  // Check lockout before attempting authentication
  const lockout = await checkLockout();
  if (lockout.locked) {
    const minutes = Math.ceil(lockout.remainingMs / 60_000);
    return {
      ok: false,
      message: `Too many failed attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
    };
  }

  const valid = await verifyCredentials(username, password);

  if (!valid) {
    await recordFailedAttempt();
    return { ok: false, message: "Invalid username or password." };
  }

  await clearFailedAttempts();

  const token = await signSessionToken({ sub: username, role: "admin" });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions());

  const redirectTo =
    typeof from === "string" && from.startsWith("/admin") ? from : "/admin";
  redirect(redirectTo);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: SESSION_COOKIE,
    path: "/admin",
  });
  redirect("/admin/login");
}
