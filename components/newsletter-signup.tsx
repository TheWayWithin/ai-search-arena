"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/actions/subscribe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Variant = "hero" | "footer";

const initial = { ok: false, message: "" };

export function NewsletterSignup({ variant = "hero" }: { variant?: Variant }) {
  const [state, action, pending] = useActionState(subscribe, initial);

  if (variant === "footer") {
    return (
      <div className="w-full">
        {state.ok ? (
          <p className="text-sm font-medium text-confidence-green">
            {state.message}
          </p>
        ) : (
          <form action={action} className="flex gap-2">
            <Input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="h-9 max-w-xs bg-white"
              disabled={pending}
            />
            <Button
              type="submit"
              size="sm"
              disabled={pending}
              className="bg-arena-slate text-white hover:bg-arena-slate/90"
            >
              {pending ? "..." : "Subscribe"}
            </Button>
          </form>
        )}
        {!state.ok && state.message && (
          <p className="mt-1 text-xs text-insufficient-red">{state.message}</p>
        )}
      </div>
    );
  }

  // Hero variant
  return (
    <div className="mx-auto mt-8 max-w-md">
      {state.ok ? (
        <div className="rounded-lg border border-confidence-green/20 bg-confidence-green/5 px-4 py-3">
          <p className="font-medium text-confidence-green">
            {state.message}
          </p>
          <p className="mt-1 text-sm text-arena-slate-light">
            We&apos;ll email you when the first benchmark drops.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm font-medium text-arena-slate">
            Be the first to know when we publish new rankings.
          </p>
          <form action={action} className="flex gap-2">
            <Input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="h-10 bg-white"
              disabled={pending}
            />
            <Button
              type="submit"
              disabled={pending}
              className="bg-arena-slate text-white hover:bg-arena-slate/90"
            >
              {pending ? "Subscribing..." : "Get Benchmark Alerts"}
            </Button>
          </form>
        </>
      )}
      {!state.ok && state.message && (
        <p className="mt-2 text-sm text-insufficient-red">{state.message}</p>
      )}
    </div>
  );
}
