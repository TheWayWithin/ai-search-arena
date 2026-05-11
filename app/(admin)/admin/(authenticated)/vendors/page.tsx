import type { Metadata } from "next";
import { getVendors } from "@/lib/db/vendors";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AddVendorForm } from "./add-vendor-form";

export const metadata: Metadata = {
  title: "Vendors | Admin",
  robots: { index: false, follow: false },
};

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
        <p className="text-muted-foreground">
          {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} registered.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Company</TableHead>
                <TableHead className="px-4">Contact</TableHead>
                <TableHead className="px-4">Email</TableHead>
                <TableHead className="px-4">Tools</TableHead>
                <TableHead className="px-4">Website</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                    No vendors yet.
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="px-4 font-medium">{vendor.companyName}</TableCell>
                    <TableCell className="px-4">
                      {vendor.contactName ?? <span className="text-muted-foreground">&mdash;</span>}
                    </TableCell>
                    <TableCell className="px-4">
                      {vendor.contactEmail ? (
                        <a
                          href={`mailto:${vendor.contactEmail}`}
                          className="text-primary hover:underline"
                        >
                          {vendor.contactEmail}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4">{vendor.tools.length}</TableCell>
                    <TableCell className="px-4">
                      {vendor.websiteUrl ? (
                        <a
                          href={vendor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit
                        </a>
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddVendorForm />
    </div>
  );
}
