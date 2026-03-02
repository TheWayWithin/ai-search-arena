"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Variant = "hero" | "footer";
type Status = "idle" | "submitting" | "success" | "error";

const BUTTONDOWN_USERNAME = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME ?? "watters";

export function NewsletterSignup({ variant = "hero" }: { variant?: Variant }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(
        `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email }).toString(),
        }
      );

      if (res.ok || res.status === 201) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (variant === "footer") {
    return (
      <div className="w-full">
        {status === "success" ? (
          <p className="text-sm font-medium text-confidence-green">
            Check your inbox to confirm your subscription.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 max-w-xs bg-white"
              disabled={status === "submitting"}
            />
            <Button
              type="submit"
              size="sm"
              disabled={status === "submitting"}
              className="bg-arena-slate text-white hover:bg-arena-slate/90"
            >
              {status === "submitting" ? "..." : "Subscribe"}
            </Button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-1 text-xs text-insufficient-red">{errorMsg}</p>
        )}
      </div>
    );
  }

  // Hero variant
  return (
    <div className="mx-auto mt-8 max-w-md">
      {status === "success" ? (
        <div className="rounded-lg border border-confidence-green/20 bg-confidence-green/5 px-4 py-3">
          <p className="font-medium text-confidence-green">
            Check your inbox to confirm your subscription.
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
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 bg-white"
              disabled={status === "submitting"}
            />
            <Button
              type="submit"
              disabled={status === "submitting"}
              className="bg-arena-slate text-white hover:bg-arena-slate/90"
            >
              {status === "submitting" ? "Subscribing..." : "Get Benchmark Alerts"}
            </Button>
          </form>
        </>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-insufficient-red">{errorMsg}</p>
      )}
    </div>
  );
}
