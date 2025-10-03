import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Upload,
  Edit,
  MoreHorizontal,
  Mail,
  Phone,
  Paperclip,
  MapPin,
  QrCode,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

import { money } from "./utils";
import { mockLocations, mockVendors, type Item, type ItemVendor } from "./inventory.types";

export function PartDetails({
  item,
}: {
  item: Item;
  stockStatus: { ok: boolean; delta: number } | null;
}) {
  // const vendorBadge = (v: ItemVendor) => {
  //   const ven = mockVendors.find((mv) => mv.id === v.vendorId);
  //   if (!ven) return null;
  //   return (
  //     <div className="flex items-center gap-3">
  //       <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
  //         {ven.name.slice(0, 1)}
  //       </div>
  //       <div className="leading-tight">
  //         <div className="font-medium">{ven.name}</div>
  //         <div className="text-xs text-muted-foreground flex items-center gap-2">
  //           {ven.email && (
  //             <span className="inline-flex items-center gap-1">
  //               <Mail className="h-3 w-3" />
  //               {ven.email}
  //             </span>
  //           )}
  //           {ven.phone && (
  //             <span className="inline-flex items-center gap-1">
  //               <Phone className="h-3 w-3" />
  //               {ven.phone}
  //             </span>
  //           )}
  //         </div>
  //       </div>
  //       {v.orderingPartNumber && (
  //         <span className="ml-auto text-sm text-muted-foreground">
  //           Ordering Part Number <span className="font-medium">{v.orderingPartNumber}</span>
  //         </span>
  //       )}
  //     </div>
  //   );
  // };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-medium">{item.name}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50">
            <Upload className="h-4 w-4" />
            Restock
          </Button>
          <Button variant="outline" className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs (static visuals) */}
      <div className="border-b">
        <div className="flex gap-6 px-6">
          <div className="py-3 border-b-2 border-primary text-primary cursor-default">Details</div>
          <div className="py-3 text-muted-foreground cursor-default">History</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8">
        {/* <div className="text-muted-foreground">{item.unitsInStock} units in stock</div> */}

        {/* Top stats */}
        {/* <div className="grid grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Minimum in Stock</div>
            <div className="mt-1">{item.minInStock} units</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Unit Cost</div>
            <div className="mt-1">{money(item.unitCost)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Part Type</div>
            <div className="mt-1">
              {item.partTypes?.length ? (
                item.partTypes.map((p) => (
                  <Badge key={p} variant="outline" className="mr-1">
                    {p}
                  </Badge>
                ))
              ) : (
                "-"
              )}
            </div>
          </Card>
        </div> */}

        {/* Location table */}
        {/* <div>
          <h3 className="font-medium mb-3">Location</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Location</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Units in Stock</th>
                  <th className="p-3">Minimum in Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3">
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      {mockLocations.find((l) => l.id === item.locationId)?.name ?? "-"}
                    </div>
                  </td>
                  <td className="p-3">{item.area ?? "-"}</td>
                  <td className="p-3">{item.unitsInStock}</td>
                  <td className="p-3">{item.minInStock}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Description + QR */}
        {/* <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-2">Description</div>
            <div>{item.description || "-"}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-2">QR Code/Barcode</div>
            {item.qrCode ? (
              <div className="text-sm">{item.qrCode}</div>
            ) : (
              <div className="text-sm text-muted-foreground">Barcode will be generated</div>
            )}
            <div className="mt-3 w-40 h-40 border rounded-md flex items-center justify-center bg-muted/30">
              <QrCode className="h-20 w-20 text-muted-foreground" />
            </div>
          </Card>
        </div> */}

        {/* Assets */}
        {/* {item.assetNames?.length ? (
          <div>
            <h3 className="font-medium mb-2">Assets ({item.assetNames.length})</h3>
            <div className="flex flex-wrap gap-2">
              {item.assetNames.map((a) => (
                <Badge key={a} variant="outline">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        ) : null} */}

        {/* Vendors */}
        {/* <div>
          <h3 className="font-medium mb-3">Vendors</h3>
          <div className="space-y-4">
            {item.vendors.map((v, i) => (
              <Card key={i} className="p-4">
                {vendorBadge(v)}
              </Card>
            ))}
          </div>
        </div> */}

        {/* Files */}
        {/* <div>
          <h3 className="font-medium mb-3">Attached Files</h3>
          {item.files?.length ? (
            <div className="space-y-2">
              {item.files.map((f, i) => (
                <div key={i} className="inline-flex items-center gap-2 border rounded px-3 py-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No files attached</div>
          )}
        </div> */}

        {/* Created/Updated + CTA */}
        {/* <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="text-sm">
              Created By <span className="font-medium">{item.createdBy}</span>{" "}
              on {new Date(item.createdAt).toLocaleString()}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm">
              Last updated By <span className="font-medium">{item.updatedBy ?? "-"}</span>{" "}
              {item.updatedAt ? `on ${new Date(item.updatedAt).toLocaleString()}` : ""}
            </div>
          </Card>
        </div> */}

        <div className="flex justify-end">
          <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
            <Upload className="h-4 w-4" />
            Use in New Work Order
          </Button>
        </div>
      </div>
    </div>
  );
}
