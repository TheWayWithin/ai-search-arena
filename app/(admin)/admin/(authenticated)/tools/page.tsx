import type { Metadata } from "next";
import { getTools, getVendors, getMarketSegments } from "@/lib/db/vendors";
import { prisma } from "@/lib/db";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToolForm } from "./add-tool-form";
import { ArchiveToolButton } from "./archive-tool-button";

export const metadata: Metadata = {
  title: "Tools | Admin",
  robots: { index: false, follow: false },
};

export default async function ToolsPage() {
  const [tools, vendors, segments, tracks] = await Promise.all([
    getTools({ includeArchived: true }),
    getVendors(),
    getMarketSegments(),
    prisma.benchmarkTrackDefinition.findMany({ orderBy: { name: "asc" } }),
  ]);

  const activeCount = tools.filter((t) => !t.isArchived).length;
  const archivedCount = tools.filter((t) => t.isArchived).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tools</h1>
        <p className="text-muted-foreground">
          {activeCount} active
          {archivedCount > 0 ? `, ${archivedCount} archived` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tools</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Name</TableHead>
                <TableHead className="px-4">Vendor</TableHead>
                <TableHead className="px-4">Tracks</TableHead>
                <TableHead className="px-4">Segments</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="w-24 px-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow
                  key={tool.id}
                  className={tool.isArchived ? "opacity-50" : ""}
                >
                  <TableCell
                    className={`px-4 font-medium ${
                      tool.isArchived ? "italic text-muted-foreground" : ""
                    }`}
                  >
                    {tool.name}
                  </TableCell>
                  <TableCell className="px-4">
                    {tool.vendor.companyName}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-wrap gap-1">
                      {tool.trackMappings.map((tm) => (
                        <Badge key={tm.track.id} variant="secondary">
                          {tm.track.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-wrap gap-1">
                      {tool.segmentMappings.map((sm) => (
                        <Badge key={sm.segment.id} variant="outline">
                          {sm.segment.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    {tool.isArchived ? (
                      <Badge variant="destructive">Archived</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4">
                    {!tool.isArchived && (
                      <ArchiveToolButton
                        toolId={tool.id}
                        toolName={tool.name}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddToolForm
        vendors={vendors.map((v) => ({ id: v.id, companyName: v.companyName }))}
        tracks={tracks.map((t) => ({ id: t.id, name: t.name }))}
        segments={segments.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
