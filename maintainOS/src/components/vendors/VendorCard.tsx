import { Building2 } from "lucide-react";
import { type Vendor } from "../../store/vendors/vendors.types";

export function VendorCard({
  vendor,
  selected,
  onSelect,
}: {
  vendor: Vendor;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer border rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400"
          : "border-gray-200 bg-white hover:border-yellow-200"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon Wrapper */}
        <div
          className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border ${
            selected
              ? "bg-white border-yellow-200 text-yellow-600"
              : "bg-gray-50 border-gray-100 text-gray-500"
          }`}
        >
          <Building2 size={20} />
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Badge (e.g. Type) */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {vendor.name || "Unnamed Vendor"}
            </h3>
            {/* Vendor Type Badge */}
            <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap capitalize">
              {vendor.vendorType || "Standard"}
            </span>
          </div>

          {/* Row 2: Description or Location */}
          <p className="text-xs text-gray-500 mt-1 truncate">
            {vendor.description || "No description provided"}
          </p>

          {/* Row 3: Contact Count (Footer equivalent) */}
          <p className="text-xs text-gray-400 mt-2">
            {vendor.contacts?.length || 0} Contacts
          </p>
        </div>
      </div>
    </div>
  );
}