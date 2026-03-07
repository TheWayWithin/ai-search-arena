"use client";

import { useActionState, useState } from "react";
import { createVendorAction } from "@/app/actions/admin/vendors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = { ok: true, message: "" };

export function AddVendorForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createVendorAction,
    initialState
  );

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline">
        Add Vendor
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">New Vendor</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>

      {state.message && (
        <div
          className={`rounded px-4 py-2 text-sm ${
            state.ok
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="companyName" className="mb-1 block text-sm font-medium">
            Company Name <span className="text-red-500">*</span>
          </label>
          <Input id="companyName" name="companyName" required placeholder="Acme Corp" />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="mb-1 block text-sm font-medium">
            Website URL
          </label>
          <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://example.com" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactName" className="mb-1 block text-sm font-medium">
              Contact Name
            </label>
            <Input id="contactName" name="contactName" placeholder="Jane Smith" />
          </div>
          <div>
            <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium">
              Contact Email
            </label>
            <Input id="contactEmail" name="contactEmail" type="email" placeholder="jane@example.com" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Brief description..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Vendor"}
        </Button>
      </form>
    </div>
  );
}
