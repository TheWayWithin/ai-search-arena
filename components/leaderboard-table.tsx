"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/tier-badge";
import { TrendIndicator } from "@/components/trend-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BadgeData = {
  tier: "Gold" | "Silver" | "Bronze";
  label: string;
};

type TrendData = {
  previousRank: number | null;
  rankDelta: number | null;
  isNew: boolean;
};

type CompositeScoreRow = {
  id: string;
  rank: number;
  value: string;
  confidenceTag: string;
  trend: TrendData | null;
  tool: {
    slug: string;
    name: string;
    vendor: { companyName: string; slug: string } | null;
    badges: BadgeData[];
  };
};

type Props = {
  compositeScores: CompositeScoreRow[];
  emptyMessage: string;
};

function confidenceColor(tag: string) {
  switch (tag) {
    case "High":
      return "bg-confidence-green/10 text-confidence-green border-confidence-green/20";
    case "Medium":
      return "bg-caution-amber/10 text-caution-amber border-caution-amber/20";
    case "Low":
      return "bg-insufficient-red/10 text-insufficient-red border-insufficient-red/20";
    case "InsufficientData":
      return "bg-neutral-grey/10 text-neutral-grey border-neutral-grey/20";
    default:
      return "";
  }
}

function confidenceLabel(tag: string) {
  return tag === "InsufficientData" ? "Insufficient" : tag;
}

export function LeaderboardTable({ compositeScores, emptyMessage }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleTool(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (next.size < 4) {
        next.add(slug);
      }
      return next;
    });
  }

  function goToCompare() {
    const slugs = [...selected].join(",");
    router.push(`/compare?tools=${slugs}`);
  }

  return (
    <>
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-pale-grey">
              <TableHead className="hidden w-12 text-center sm:table-cell">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead className="w-10 text-center sm:w-16">Rank</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead className="hidden md:table-cell">Vendor</TableHead>
              <TableHead className="hidden w-16 text-center sm:table-cell">Trend</TableHead>
              <TableHead className="w-20 text-center sm:w-28">Score</TableHead>
              <TableHead className="hidden w-28 text-center sm:table-cell">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compositeScores.map((cs) => (
              <TableRow
                key={cs.id}
                className={selected.has(cs.tool.slug) ? "bg-mastery-blue/5" : ""}
              >
                <TableCell className="hidden text-center sm:table-cell">
                  <input
                    type="checkbox"
                    checked={selected.has(cs.tool.slug)}
                    disabled={!selected.has(cs.tool.slug) && selected.size >= 4}
                    onChange={() => toggleTool(cs.tool.slug)}
                    className="border-border text-mastery-blue accent-mastery-blue h-4 w-4 rounded"
                  />
                </TableCell>
                <TableCell className="text-arena-slate text-center font-semibold">
                  {cs.rank}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/tools/${cs.tool.slug}`}
                      className="text-arena-slate hover:text-mastery-blue font-medium hover:underline"
                    >
                      {cs.tool.name}
                    </Link>
                    {cs.tool.badges.map((b) => (
                      <TierBadge key={b.label} tier={b.tier} label={b.label} />
                    ))}
                  </div>
                  {cs.tool.vendor && (
                    <div className="text-arena-slate-light mt-0.5 text-xs md:hidden">
                      {cs.tool.vendor.companyName}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-arena-slate-light hidden md:table-cell">
                  {cs.tool.vendor ? (
                    <Link
                      href={`/vendors/${cs.tool.vendor.slug}`}
                      className="hover:text-mastery-blue hover:underline"
                    >
                      {cs.tool.vendor.companyName}
                    </Link>
                  ) : null}
                </TableCell>
                <TableCell className="hidden text-center sm:table-cell">
                  <TrendIndicator trend={cs.trend} />
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-arena-slate text-lg font-bold">
                    {Number(cs.value).toFixed(1)}
                  </span>
                  <span className="text-arena-slate-light text-sm">/10</span>
                </TableCell>
                <TableCell className="hidden text-center sm:table-cell">
                  <Badge variant="outline" className={confidenceColor(cs.confidenceTag)}>
                    {confidenceLabel(cs.confidenceTag)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {compositeScores.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-arena-slate-light py-8 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating compare bar */}
      {selected.size >= 2 && (
        <div className="border-border fixed right-0 bottom-0 left-0 z-50 border-t bg-white shadow-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <span className="text-arena-slate text-sm">{selected.size} tools selected</span>
            <button
              onClick={goToCompare}
              className="bg-arena-slate hover:bg-arena-slate/90 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              Compare {selected.size} tools &rarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
