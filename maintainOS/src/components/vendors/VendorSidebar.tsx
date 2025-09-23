import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { type Vendor } from "./vendors.types";

export function VendorSidebar({
  vendors,
  selectedVendorId,
  setSelectedVendorId,
  setIsCreatingVendor,
}: {
  vendors: Vendor[];
  selectedVendorId: string;
  setSelectedVendorId: (id: string) => void;
}) {
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <aside className="flex ml-3 mr-2 flex-col border border-border bg-card">
      <div className="flex-1 overflow-auto">
        {vendors.map((vendor) => {
          const isActive = selectedVendorId === vendor.id;
          return (
            <>
              <Card
                key={vendor.id}
                className={`flex w-full cursor-pointer items-start justify-between border-b border-border px-5 py-3 text-left transition ${
                  isActive
                    ? "border-l-2 border-l-primary bg-primary/5"
                    : "hover:bg-muted/40"
                }`}
                onClick={() => {
                  setSelectedVendorId(vendor.id);
                  setIsCreatingVendor(false);
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between w-96">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {renderInitials(vendor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {vendor.contacts.length > 0
                            ? `${vendor.contacts.length} contact${
                                vendor.contacts.length > 1 ? "s" : ""
                              }`
                            : "No contacts"}
                        </p>
                      </div>
                    </div>
                    <div className="float-right">
                      <Badge variant="outline" className="text-xs">
                        {vendor.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          );
        })}
      </div>
    </aside>
  );
}
