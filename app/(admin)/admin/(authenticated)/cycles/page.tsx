import type { Metadata } from "next";
import Link from "next/link";
import { listCycles } from "@/lib/db/cycles";
import { getCurrentMethodology } from "@/lib/db/methodology";
import { StateBadge } from "@/components/admin/state-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateCycleForm } from "./create-cycle-form";

export const metadata: Metadata = {
  title: "Cycles | Admin",
  robots: { index: false, follow: false },
};

export default async function CyclesPage() {
  const [cycles, methodology] = await Promise.all([listCycles(), getCurrentMethodology()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Evaluation Cycles</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track AI search tool evaluation cycles.
        </p>
      </div>

      <CreateCycleForm
        methodologyVersionId={methodology?.id ?? ""}
        methodologyLabel={
          methodology ? `v${methodology.versionNumber}` : "No methodology available"
        }
      />

      {cycles.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No cycles yet. Create your first evaluation cycle above.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identifier</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="text-right">Enrolled Tools</TableHead>
                <TableHead>Methodology</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-mono font-medium">
                    <Link href={`/admin/cycles/${cycle.id}`} className="hover:underline">
                      {cycle.cycleIdentifier}
                    </Link>
                  </TableCell>
                  <TableCell>{cycle.displayName}</TableCell>
                  <TableCell>
                    <StateBadge state={cycle.state} />
                  </TableCell>
                  <TableCell>
                    {new Date(cycle.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">{cycle._count.enrollments}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    v{cycle.methodologyVersion.versionNumber}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
