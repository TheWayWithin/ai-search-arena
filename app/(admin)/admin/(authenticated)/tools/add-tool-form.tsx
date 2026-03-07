"use client";

import { useActionState, useState } from "react";
import { createToolAction } from "@/app/actions/admin/tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { ok: true, message: "" };

export function AddToolForm({
  vendors,
  tracks,
  segments,
}: {
  vendors: { id: string; companyName: string }[];
  tracks: { id: string; name: string }[];
  segments: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createToolAction,
    initialState
  );

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline">
        Add Tool
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">New Tool</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>

      {state.message && (
        <div
          className={`rounded px-4 py-2 text-sm ${
            state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Tool Name <span className="text-red-500">*</span>
            </label>
            <Input id="name" name="name" required placeholder="My AI Tool" />
          </div>
          <div>
            <label htmlFor="vendorId" className="mb-1 block text-sm font-medium">
              Vendor <span className="text-red-500">*</span>
            </label>
            <select
              id="vendorId"
              name="vendorId"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select vendor...</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="websiteUrl" className="mb-1 block text-sm font-medium">
            Website URL
          </label>
          <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://example.com" />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            placeholder="What does this tool do?"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {tracks.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Benchmark Tracks</p>
            <div className="flex flex-wrap gap-4">
              {tracks.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="trackIds"
                    value={t.id}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {segments.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Market Segments</p>
            <div className="flex flex-wrap gap-4">
              {segments.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="segmentIds"
                    value={s.id}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Tool"}
        </Button>
      </form>
    </div>
  );
}
