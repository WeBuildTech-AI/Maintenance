import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
// import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Users,
  Link2,
  Plus,
  ExternalLink,
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { type Vendor } from "./vendors.types";
import { ContactFormDialog } from "./ContactFormDialog";

export function VendorDetails({
  vendor,
  onEdit, // 🔹 added callback
}: {
  vendor?: Vendor;
  onEdit: (vendor: Vendor) => void; // 🔹 new prop
  // setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
}) {
  if (!vendor) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a vendor to view details.
      </div>
    );
  }

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <section className="flex-1 overflow-auto">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-border">
          <div>
            <CardTitle>{vendor.name}</CardTitle>
            <CardDescription className="text-xs">
              ID: {vendor.id} · Category: {vendor.category}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="gap-2 border cursor-pointer border-orange-600 bg-white text-orange-600 hover:bg-orange-50"
            >
              <Link2 className="h-4 w-4" /> Link Asset
            </Button>
            <Button
              size="sm"
              className="gap-2 border cursor-pointer border-orange-600 bg-white text-orange-600 hover:bg-orange-50"
            >
              <Plus className="h-4 w-4" /> New Purchase Order
            </Button>
            <Button
              size="sm"
              onClick={() => vendor && onEdit(vendor)} // 🔹 Calls the parent's navigation handler
              className="gap-2 border cursor-pointer border-orange-600 bg-white text-orange-600 hover:bg-orange-50"
            >
              <ExternalLink className="h-4 w-4" /> Edit
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Contacts */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Contact List
            </h3>

            <div className="mt-3 space-y-3">
              {!vendor?.contacts ? (
                <p className="text-xs text-muted-foreground">
                  No contacts yet. Add a contact to keep details handy.
                </p>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-border px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: vendor.color ?? "#64748b" }}
                    >
                      {renderInitials(vendor.name || "C")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {vendor.name || "Contact"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vendor Contact
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {vendor.contacts.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {vendor.contacts.phone}
                      </span>
                    )}
                    {vendor.contacts.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {vendor.contacts.email}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
{/* <ContactFormDialog vendor={vendor} setVendors={setVendors} /> */}

          {/* Locations */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Locations ({vendor.locations.length})
            </h3>
            <div className="mt-3 space-y-2">
              {vendor.locations.map((loc) => (
                <div
                  key={`${vendor.id}-${loc.name}`}
                  className="flex items-start gap-3 rounded border border-border px-3 py-2"
                >
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{loc.name}</p>
                    {loc.parent && (
                      <p className="text-xs text-muted-foreground">
                        Parent: {loc.parent}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            <span>
              Created by <strong>{vendor.createdBy}</strong> on{" "}
              {new Date(vendor.createdAt).toLocaleString()}
            </span>
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" /> Use in New Work Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}