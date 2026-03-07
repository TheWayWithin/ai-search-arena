import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ModelRowActions } from "./model-row-actions";

export const metadata: Metadata = {
  title: "AI Models | Admin",
  robots: { index: false, follow: false },
};

export default async function ModelsPage() {
  const models = await prisma.aIModel.findMany({
    orderBy: [{ provider: "asc" }, { displayName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Models</h1>
        <p className="mt-1 text-muted-foreground">
          Manage model availability and request timeouts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Models</CardTitle>
          <CardDescription>
            {models.length} model{models.length !== 1 ? "s" : ""} registered.
            Timeout range: 5,000 - 120,000 ms.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Provider</TableHead>
                <TableHead className="px-4">Model Name</TableHead>
                <TableHead className="px-4">Identifier</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Timeout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="px-4 font-medium">
                    {model.provider}
                  </TableCell>
                  <TableCell className="px-4">{model.displayName}</TableCell>
                  <TableCell className="px-4">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {model.modelIdentifier}
                    </code>
                  </TableCell>
                  <ModelRowActions
                    model={{
                      id: model.id,
                      provider: model.provider,
                      displayName: model.displayName,
                      modelIdentifier: model.modelIdentifier,
                      timeoutMs: model.timeoutMs,
                      isActive: model.isActive,
                    }}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
