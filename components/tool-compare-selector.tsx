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
        className="border-border text-arena-slate-light hover:border-mastery-blue hover:text-mastery-blue flex h-full min-h-[80px] w-full items-center justify-center rounded-lg border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors"
      >
        + Add Tool
      </button>
      {open && (
        <div className="border-border absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border bg-white shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border focus:border-mastery-blue w-full rounded-md border px-3 py-1.5 text-sm outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="text-arena-slate-light px-3 py-2 text-sm">No tools found</div>
            )}
            {filtered.map((tool) => (
              <button
                key={tool.slug}
                onClick={() => selectTool(tool.slug)}
                className="hover:bg-pale-grey flex w-full flex-col px-3 py-2 text-left"
              >
                <span className="text-arena-slate text-sm font-medium">{tool.name}</span>
                <span className="text-arena-slate-light text-xs">{tool.vendorName}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
