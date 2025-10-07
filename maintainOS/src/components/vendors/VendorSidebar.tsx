import Loader from "../Loader/Loader";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { type Vendor } from "./vendors.types";

export function VendorSidebar({
  vendors,
  selectedVendorId,
  setSelectedVendorId,
  loading,
}: {
  vendors: Vendor[];
  selectedVendorId: string;
  setSelectedVendorId: (id: string) => void;
  loading: boolean;
}) {
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <aside className="flex ml-3 mr-2 w-96 flex-col border border-border bg-card">
      <div className="flex-1 overflow-auto">
        {loading ? (
          <Loader />
        ) : (
          vendors?.map((vendor) => {
            const isActive = selectedVendorId === vendor.id;
            const picture = vendor?.pictureUrl?.[0];
            console.log(vendor, "pic");

            return (
              <Card
                key={vendor.id}
                className={`flex w-full cursor-pointer items-start justify-between border-b border-border px-5 py-3 text-left transition ${
                  isActive
                    ? "border-l-2 border-l-primary bg-primary/5"
                    : "hover:bg-muted/40"
                }`}
                onClick={() => setSelectedVendorId(vendor.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        {picture ? (
                          <AvatarImage
                            className="w-6"
                            src={`data:${picture.mimetype};base64,${picture.base64}`}
                            alt={vendor.name || "Vendor Image"}
                          />
                        ) : (
                          <AvatarFallback>
                            {renderInitials(vendor.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div>
                        <p className="text-sm font-medium">{vendor.name}</p>
                        {/* Uncomment if you want contact count */}
                        <p className="text-xs text-muted-foreground">
                          {vendor.contacts && vendor.contacts.length > 0
                            ? `${vendor.contacts.length} contact${
                                vendor.contacts.length > 1 ? "s" : ""
                              }`
                            : "No contacts"}
                        </p>
                      </div>
                    </div>

                    {/* <div className="float-right">
                      <Badge variant="outline" className="text-xs">
                        {vendor.category}
                      </Badge>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </aside>
  );
}
