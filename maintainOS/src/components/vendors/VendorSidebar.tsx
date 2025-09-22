import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { type Vendor } from "./vendors.types";

export function VendorSidebar({
  vendors,
  selectedVendorId,
  setSelectedVendorId,
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
    <aside className="flex w-[340px] flex-col border-r border-border bg-card">
      <div className="flex-1 overflow-auto">
        {vendors.map((vendor) => {
          const isActive = selectedVendorId === vendor.id;
          return (
            <button
              key={vendor.id}
              className={`flex w-full items-center justify-between border-b border-border px-5 py-4 text-left transition ${
                isActive ? "border-l-2 border-l-primary bg-primary/5" : "hover:bg-muted/40"
              }`}
              onClick={() => setSelectedVendorId(vendor.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{renderInitials(vendor.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {vendor.contacts.length > 0
                      ? `${vendor.contacts.length} contact${vendor.contacts.length > 1 ? "s" : ""}`
                      : "No contacts"}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {vendor.category}
              </Badge>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
