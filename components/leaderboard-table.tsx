"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CompositeScoreRow = {
  id: string;
  rank: number;
  value: string;
  confidenceTag: string;
  tool: {
    slug: string;
    name: string;
    vendor: { companyName: string } | null;
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
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-pale-grey">
              <TableHead className="w-12 text-center">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="w-28 text-center">Score</TableHead>
              <TableHead className="w-28 text-center">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compositeScores.map((cs) => (
              <TableRow
                key={cs.id}
                className={selected.has(cs.tool.slug) ? "bg-mastery-blue/5" : ""}
              >
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={selected.has(cs.tool.slug)}
                    disabled={!selected.has(cs.tool.slug) && selected.size >= 4}
                    onChange={() => toggleTool(cs.tool.slug)}
                    className="h-4 w-4 rounded border-border text-mastery-blue accent-mastery-blue"
                  />
                </TableCell>
                <TableCell className="text-center font-semibold text-arena-slate">
                  {cs.rank}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/tools/${cs.tool.slug}`}
                    className="font-medium text-arena-slate hover:text-mastery-blue hover:underline"
                  >
                    {cs.tool.name}
                  </Link>
                </TableCell>
                <TableCell className="text-arena-slate-light">
                  {cs.tool.vendor?.companyName}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-lg font-bold text-arena-slate">
                    {Number(cs.value).toFixed(1)}
                  </span>
                  <span className="text-sm text-arena-slate-light">/10</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={confidenceColor(cs.confidenceTag)}
                  >
                    {confidenceLabel(cs.confidenceTag)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {compositeScores.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-arena-slate-light"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating compare bar */}
      {selected.size >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white shadow-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <span className="text-sm text-arena-slate">
              {selected.size} tools selected
            </span>
            <button
              onClick={goToCompare}
              className="rounded-lg bg-arena-slate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-arena-slate/90"
            >
              Compare {selected.size} tools &rarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
