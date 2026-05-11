import type { Metadata } from "next";
import { getCurrentMethodology } from "@/lib/db/methodology";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LockButton } from "./lock-button";

export const metadata: Metadata = {
  title: "Methodology | Admin",
  robots: { index: false, follow: false },
};

export default async function MethodologyPage() {
  const methodology = await getCurrentMethodology();

  if (!methodology) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Methodology</h1>
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            No methodology version found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const dimensions = methodology.scoringDimensions ?? [];

  const byCategory = dimensions.reduce<Record<string, typeof dimensions>>((acc, dim) => {
    const cat = dim.category ?? "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(dim);
    return acc;
  }, {});

  const categories = Object.keys(byCategory).sort();

  const totalWeight = dimensions.reduce((sum, d) => sum + Number(d.weight ?? 0), 0);
  const weightsValid = Math.abs(totalWeight - 1) < 0.001;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Methodology</h1>
        <p className="text-muted-foreground mt-1">
          Scoring dimensions and weights for the current methodology version.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Version {methodology.versionNumber}</CardTitle>
              <CardDescription>
                Effective:{" "}
                {new Date(methodology.effectiveDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {methodology.isLocked ? (
                <Badge className="border-green-300 bg-green-100 text-green-800">Locked</Badge>
              ) : (
                <Badge className="border-amber-300 bg-amber-100 text-amber-800">Unlocked</Badge>
              )}
              {methodology.isLocked && methodology.lockedAt && (
                <span className="text-muted-foreground text-xs">
                  Locked{" "}
                  {new Date(methodology.lockedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-muted/40 rounded-md border p-4">
            <p className="mb-1 text-sm font-medium">Weight validation</p>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                Total: {(totalWeight * 100).toFixed(1)}%
              </span>
              <Badge
                variant="outline"
                className={
                  weightsValid
                    ? "border-green-300 bg-green-100 text-green-800"
                    : "border-red-300 bg-red-100 text-red-800"
                }
              >
                {weightsValid ? "Valid" : "Invalid"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.map((category) => {
        const dims = byCategory[category].sort(
          (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        );
        const subtotal = dims.reduce((sum, d) => sum + Number(d.weight ?? 0), 0);

        return (
          <Card key={category}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{category}</CardTitle>
                <span className="text-muted-foreground text-sm">
                  Subtotal: {(subtotal * 100).toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 px-4">#</TableHead>
                    <TableHead className="px-4">Dimension</TableHead>
                    <TableHead className="w-24 px-4">Weight</TableHead>
                    <TableHead className="px-4">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dims.map((dim) => (
                    <TableRow key={dim.id}>
                      <TableCell className="text-muted-foreground px-4 tabular-nums">
                        {dim.displayOrder ?? "\u2014"}
                      </TableCell>
                      <TableCell className="px-4 font-medium">{dim.name}</TableCell>
                      <TableCell className="px-4 tabular-nums">
                        {(Number(dim.weight ?? 0) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-sm px-4 text-sm">
                        <span className="block truncate" title={dim.description ?? ""}>
                          {dim.description ?? "\u2014"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {!methodology.isLocked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lock Version</CardTitle>
            <CardDescription>
              Locking prevents further changes. All weights must sum to 100%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LockButton versionId={methodology.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
