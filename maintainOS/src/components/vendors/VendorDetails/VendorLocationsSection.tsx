import { MapPin } from "lucide-react";
import {type Vendor } from "../vendors.types";

interface VendorLocationsSectionProps {
  vendor: Vendor;
}

export default function VendorLocationsSection({
  vendor,
}: VendorLocationsSectionProps) {
  return (
    <div className="pt-6 mt-6 border-t border-gray-200">
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        Locations ({vendor.locations?.length || 0})
      </h3>

      {vendor.locations && vendor.locations.length > 0 ? (
        <div className="space-y-3">
          {vendor.locations.map((loc: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full border border-blue-100 bg-blue-50">
                <MapPin className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-blue-600 text-sm font-medium cursor-pointer hover:underline">
                {typeof loc === "string" ? loc : loc.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No locations found.</p>
      )}
    </div>
  );
}
