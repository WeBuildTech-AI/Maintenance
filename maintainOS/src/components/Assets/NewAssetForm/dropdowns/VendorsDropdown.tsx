import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function VendorsDropdown() {
  const [vendorOpen, setVendorOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [vendors] = useState<{ name: string }[]>([{ name: "Mfd" }, { name: "Paam" }]);
  const [selectedVendor, setSelectedVendor] = useState<{ name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setVendorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mt-4 relative z-50" ref={dropdownRef}>
      <h3 className="mb-4 text-base font-medium text-gray-900">Vendors</h3>
      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() => setVendorOpen((prev) => !prev)}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-400">
          {selectedVendor ? selectedVendor.name : "Start typing..."}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {vendorOpen && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
          {vendors.map((vendor, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedVendor(vendor);
                setVendorOpen(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                {vendor.name.charAt(0).toUpperCase()}
              </div>
              <span>{vendor.name}</span>
              <span className="ml-auto text-gray-500 text-sm">No contacts</span>
            </div>
          ))}
          <div
            onClick={() => navigate("/vendors")}
            className="px-4 py-2 text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
          >
            + Create New Vendor
          </div>
        </div>
      )}
    </div>
  );
}
