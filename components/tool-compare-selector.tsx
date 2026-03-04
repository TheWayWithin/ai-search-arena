"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type ToolOption = {
  slug: string;
  name: string;
  vendorName: string;
};

type Props = {
  availableTools: ToolOption[];
  currentSlugs: string[];
};

export function ToolCompareSelector({ availableTools, currentSlugs }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = availableTools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectTool(slug: string) {
    const newSlugs = [...currentSlugs, slug];
    router.push(`/compare?tools=${newSlugs.join(",")}`);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-full min-h-[80px] w-full items-center justify-center rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-arena-slate-light transition-colors hover:border-mastery-blue hover:text-mastery-blue"
      >
        + Add Tool
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-white shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-1.5 text-sm outline-none focus:border-mastery-blue"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-arena-slate-light">
                No tools found
              </div>
            )}
            {filtered.map((tool) => (
              <button
                key={tool.slug}
                onClick={() => selectTool(tool.slug)}
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-pale-grey"
              >
                <span className="text-sm font-medium text-arena-slate">
                  {tool.name}
                </span>
                <span className="text-xs text-arena-slate-light">
                  {tool.vendorName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
