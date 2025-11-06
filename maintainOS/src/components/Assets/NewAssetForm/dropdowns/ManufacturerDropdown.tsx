import { ChevronDown, Search, Plus, Loader2 } from "lucide-react";
import { useState, useMemo, useRef, useEffect, type ReactElement } from "react";
import { assetService } from "../../../../store/assets";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";

/*
====================================================================
TYPESCRIPT: TYPE DEFINITIONS
====================================================================
*/

type SelectableItem = {
  id: number | string;
  name: string;
};

// Component ke liye naye Props
type ManufacturerDropdownProps = {
  label: string;
  value: SelectableItem | null; 
  onChange: (value: SelectableItem | null) => void; 
};

/*
====================================================================
API FUNCTIONS
====================================================================
*/

async function fetchManufacturersFromAPI(): Promise<SelectableItem[]> {
  const data = await assetService.fetchAssetManufacturer();
  return data;
}

async function createManufacturerInAPI(name: string , user: any): Promise<SelectableItem> {
  const payload = {
    name: name,
    // organizationId: user.organizationId,
  };

  const newManufacturer = await assetService.createAssetManufacture(payload);
  return newManufacturer;
}

/*
====================================================================
COMPONENT CODE (FIXED)
====================================================================
*/

export function ManufacturerDropdown({
  label,
  value,
  onChange,
}: ManufacturerDropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(value?.name || "");
  const [manufacturers, setManufacturers] = useState<SelectableItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value?.name || "");
  }, [value]);

  // === BADLAAV YAHAN HAI ===
  useEffect(() => {
    // Ab yeh effect tabhi chalega jab 'isOpen' true hoga.
    // 'isLoading' state is logic ko dobara trigger nahi karega.
    if (isOpen) { 
      async function loadData() {
        setIsLoading(true); // Loader chalu
        setError(null);
        try {
          const data = await fetchManufacturersFromAPI();
          setManufacturers(data);
        } catch (err) {
          setError("Failed to fetch manufacturers.");
          console.error(err);
        }
        setIsLoading(false); // Loader band (success ya error, dono case mein)
      }
      loadData();
    }
  }, [isOpen]); // <-- Dependency array se 'isLoading' hata diya gaya hai

  // Click Outside Logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm(value?.name || "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, value]);

  // FILTERING LOGIC
  const filteredManufacturers = useMemo(() => {
    const lowerSearch = (searchTerm || "").toLowerCase();
    if (!lowerSearch) {
      return manufacturers;
    }
    if (value && value.name.toLowerCase() === lowerSearch) {
      return manufacturers.filter((m) =>
        m.name.toLowerCase().includes(lowerSearch)
      );
    }
    return manufacturers.filter((m) =>
      m.name.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, manufacturers, value]);

  // "CREATE NEW" LOGIC
  const canCreateNew = useMemo(() => {
    if (!searchTerm || searchTerm.length === 0) return false;
    const lowerSearchTerm = searchTerm.toLowerCase();
    const exactMatchExists = manufacturers.some(
      (m) => m.name.toLowerCase() === lowerSearchTerm
    );
    return !exactMatchExists;
  }, [searchTerm, manufacturers]);

  // HANDLER FUNCTIONS
  const handleSelect = (manufacturer: SelectableItem) => {
    onChange(manufacturer);
    setSearchTerm(manufacturer.name);
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!canCreateNew || isCreating || !searchTerm) return;
    setIsCreating(true);
    setError(null);
    try {
      const newManufacturer = await createManufacturerInAPI(searchTerm , user);
      setManufacturers((prev) => [...prev, newManufacturer]);
      onChange(newManufacturer);
      setSearchTerm(newManufacturer.name);
      setIsOpen(false);
    } catch (err) {
      setError("Failed to create manufacturer.");
      console.error(err);
    }
    setIsCreating(false);
  };

  // --- JSX RENDER ---
  return (
    <div className="relative mt-4 w-full max-w-lg" ref={dropdownRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">{label}</h3>
      <div className="relative">
        <div
          className={`flex items-center gap-3 rounded-md border bg-white px-4 py-3 h-12 ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-500/50"
              : "border-gray-300"
          }`}
        >
          <input
            type="text"
            placeholder="Start typing to search or customize..."
            className="flex-1 bg-transparent p-0 outline-none border-none text-gray-900 placeholder-gray-400"
            value={searchTerm || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
              if (e.target.value === "") {
                onChange(null);
              }
            }}
            onFocus={() => setIsOpen(true)}
          />

          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="ml-auto outline-none flex-shrink-0"
          >
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
          <ul className="max-h-60 overflow-y-auto p-2">
            {isLoading && (
              <li className="flex items-center justify-center p-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </li>
            )}

            {error && <li className="p-2 text-sm text-red-500">{error}</li>}

            {!isLoading &&
              !error &&
              filteredManufacturers.length > 0 &&
              filteredManufacturers.map((manufacturer) => (
                <li
                  key={manufacturer.id}
                  className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                    value?.id === manufacturer.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelect(manufacturer)}
                >
                  {manufacturer.name}
                </li>
              ))}

            {!isLoading && canCreateNew && (
              <li
                className={`flex items-center gap-2 cursor-pointer rounded-md px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 ${
                  isCreating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleCreate}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isCreating ? "Creating..." : `Create "${searchTerm}"`}
              </li>
            )}

            {/* 'hasLoadedData' ki zaroorat nahi kyunki data har baar fetch hota hai */}
            {!isLoading &&
              !error &&
              filteredManufacturers.length === 0 &&
              !canCreateNew && (
                <li className="px-3 py-2 text-sm text-gray-500">
                  No results found.
                </li>
              )}
          </ul>
        </div>
      )}
    </div>
  );
}