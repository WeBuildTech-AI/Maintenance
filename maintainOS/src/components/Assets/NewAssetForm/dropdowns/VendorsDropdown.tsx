import { ChevronDown, Search } from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vendorService, type VendorResponse } from "../../../../store/vendors";
import Loader from "../../../Loader/Loader";

interface LocationDropdownProps {
  vendorOpen: boolean;
  setVendorOpen: (open: boolean) => void;
  vendorRef: RefObject<HTMLDivElement>;
}

export function VendorsDropdown({
  vendorOpen,
  setVendorOpen,
  vendorRef,
  setSelectedvendorId,
  selectedVendorId,
}: LocationDropdownProps) {
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [vendorData, setVendorData] = useState<VendorResponse[]>([]);

  const handleFetchApi = async () => {
    if (hasFetched.current) return;
    setLoading(true);
    try {
      const res = await vendorService.fetchVendorName(10, 1, 0);
      setVendorData(res.data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        vendorRef.current &&
        !vendorRef.current.contains(event.target as Node)
      ) {
        setVendorOpen(false);
      }
    };
    if (vendorRef) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // cleanup
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [vendorOpen, setVendorOpen, vendorRef]);

  return (
    <div className="relative mt-4" ref={vendorRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">Vendor</h3>

      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() => {
          setVendorOpen(!vendorOpen);
          handleFetchApi();
        }}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-600">Select...</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {vendorOpen && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
          {/* CTA */}
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader />
            </div>
          ) : (
            <ul className="max-h-32 overflow-y-auto">
              {vendorData.length > 0 ? (
                vendorData.map((loc, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedvendorId(
                        typeof loc === "string" ? loc : loc.name
                      );
                      setVendorOpen(false);
                    }}
                  >
                    {typeof loc === "string" ? loc : loc.name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No Vendor found</li>
              )}
            </ul>
          )}
          <div
            onClick={() => navigate("/vendor")} // ✅ Navigate works now
            className="relative flex items-center px-4 py-2 rounded-md text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
            <span className="ml-3">Create Vendor</span>
          </div>
        </div>
      )}
    </div>
  );
}

// /* <div className="mt-4">
//    <h3 className="mb-4 text-base font-medium text-gray-900">Location</h3>
//    <div className="relative">
//      <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
//        <MapPin className="h-5 w-5 text-blue-500" />
//        <span className="flex-1 text-gray-900">General</span>
//        <ChevronDown className="h-5 w-5 text-gray-400" />
//      </div>
//    </div>
//  </div>
