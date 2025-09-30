import { ChevronDown, Search } from "lucide-react";
import { RefObject, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../Loader/Loader";
import { locationService } from "../../../../store/locations";

interface LocationDropdownProps {
  locationOpen: boolean;
  setLocationOpen: (open: boolean) => void;
  LocationRef: RefObject<HTMLDivElement>;
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
}

interface LocationItem {
  name: string; // adjust if API differs
}

export function LocationDropdown({
  locationOpen,
  setLocationOpen,
  LocationRef,
  selectedLocation,
  setSelectedLocation,
}: LocationDropdownProps) {
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationItem[]>([]);

  const handleFetchApi = async () => {
    if (hasFetched.current) return;
    setLoading(true);
    try {
      const res = await locationService.fetchLocationsName(10, 1, 0);
      setLocationData(res.data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  };

  // 👇 Detect outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        LocationRef.current &&
        !LocationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
    };
    if (locationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // cleanup
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [locationOpen, setLocationOpen, LocationRef]);

  return (
    <div className="relative mt-4" ref={LocationRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">Locations</h3>

      {/* Dropdown Trigger */}
      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() => {
          setLocationOpen(!locationOpen);
          handleFetchApi();
        }}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-600">
          {selectedLocation || "Select..."}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {/* Dropdown Menu */}
      {locationOpen && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-md z-50">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader />
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {locationData.length > 0 ? (
                locationData.map((loc, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedLocation(
                        typeof loc === "string" ? loc : loc.name
                      );
                      setLocationOpen(false);
                    }}
                  >
                    {typeof loc === "string" ? loc : loc.name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No locations found</li>
              )}
            </ul>
          )}

          {/* Create Location CTA */}
          <div
            onClick={() => navigate("/locations")}
            className="relative flex items-center px-4 py-2 rounded-b-md text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100 border-t"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
            <span className="ml-3">+ Create Location</span>
          </div>
        </div>
      )}
    </div>
  );
}
