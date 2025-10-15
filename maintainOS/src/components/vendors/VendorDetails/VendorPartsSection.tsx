import { Cog } from "lucide-react";
import {type Vendor } from "../vendors.types";

interface VendorPartsSectionProps {
  vendor: Vendor;
}

export default function VendorPartsSection({ vendor }: VendorPartsSectionProps) {
  return (
    <div>
      <h3 className="text-sm pt-6 mt-6 border-t border-gray-200 font-semibold text-gray-900 mb-3">
        Parts ({vendor.parts?.length || 0})
      </h3>
      <div className="space-y-3">
        {vendor.parts && vendor.parts.length > 0 ? (
          vendor.parts.map((part: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-3 text-gray-900 text-sm"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Cog className="h-4 w-4" />
              </span>
              {part.name}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No parts listed.</p>
        )}
      </div>
    </div>
  );
}
