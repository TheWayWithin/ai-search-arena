"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: AuthState = { ok: false, message: "" };

export function LoginForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      {from && <input type="hidden" name="from" value={from} />}

      <div>
        <label
          htmlFor="username"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          disabled={pending}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={pending}
        />
      </div>

      {state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
