import { ChevronDown, Search, Plus, X, Loader2 } from "lucide-react";
import { useState, useMemo, useRef, useEffect, type ReactElement } from "react";
// Import service
import { assetService } from "../../../../store/assets";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";


type Asset = {
  id: number;
  name: string;
  organizationId: string;
};


type AssetTypesDropdownProps = {
  label: string; 
  value: number[]; 
  onChange: (selectedIds: number[]) => void; 
};


async function fetchAssetsFromAPI(): Promise<Asset[]> {
  console.log("API: Fetching assets...");
  const data = await assetService.fetchAssetType();
  return data;
}

/** Naya asset create karne ke liye (POST) */
async function createAssetInAPI(assetName: string, user: any): Promise<Asset> {
  if (!user?.organizationId) {
    throw new Error("User organization ID is missing.");
  }

  const payload = {
    name: assetName,
    // organizationId: user.organizationId, // ✅ correct spelling
  };

  const newAsset = await assetService.createAssetType(payload);

  console.log("API: Created new asset", newAsset);
  return newAsset;
}

// Props ko yahaan accept karein
export function AssetTypesDropdown({
  label,
  value, // Yeh 'selectedValues' state ki jagah lega
  onChange, // Yeh 'setSelectedValues' ki jagah lega
}: AssetTypesDropdownProps): ReactElement {
  // --- INTERNAL STATES (Yeh waise hi rahenge) ---
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [assets, setAssets] = useState<Asset[]>([]); // Master list
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.auth.user);

  // --- 'selectedValues' STATE HATA DIYA GAYA HAI ---
  // const [selectedValues, setSelectedValues] = useState<Asset[]>([]); // <-- YEH HATA DIYA GAYA

  const dropdownRef = useRef<HTMLDivElement>(null);

  // GET API (Ismein koi badlaav nahi)
  useEffect(() => {
    if (isOpen && !hasLoadedData && !isLoading) {
      async function loadAssets() {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchAssetsFromAPI();
          setAssets(data);
          setHasLoadedData(true);
        } catch (err) {
          setError("Failed to fetch assets.");
          console.error(err);
        }
        setIsLoading(false);
      }
      loadAssets();
    }
  }, [isOpen, hasLoadedData, isLoading]);

  // Click Outside Logic (Ismein koi badlaav nahi)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const selectedAssetObjects = useMemo(() => {
    
    const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
    
    return value.map((id) => assetMap.get(id)).filter(Boolean) as Asset[]; // 'filter(Boolean)' se undefined values hat jayengi
  }, [value, assets]); // Yeh tabhi run hoga jab 'value' ya 'assets' badlenge

  // === BADLAAV: FILTERING LOGIC ===
  const availableAssets = useMemo(() => {
   
    const selectedIds = new Set(value);
    const notSelected = assets.filter((asset) => !selectedIds.has(asset.id));

    const lowerSearch = searchTerm.toLowerCase();
    if (!lowerSearch) {
      return notSelected;
    }
    return notSelected.filter((asset) =>
      asset.name.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, assets, value]); // 'selectedValues' ko 'value' se replace kiya


  const canCreateNew = useMemo(() => {
    if (searchTerm.length === 0) return false;
    const exactMatchExists = assets.some(
      (asset) => asset.name.toLowerCase() === searchTerm.toLowerCase()
    );
    return !exactMatchExists;
  }, [searchTerm, assets]);

  // === BADLAAV: HANDLER FUNCTIONS ===

  const handleSelect = (asset: Asset) => {
   
    onChange([...value, asset.id]);
    setSearchTerm("");
  };

  const handleCreate = async () => {
    if (!canCreateNew || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      const newAsset = await createAssetInAPI(searchTerm, user);
      // Naye asset ko master list mein add karein (pehli ki tarah)
      setAssets((prev) => [...prev, newAsset]);

      onChange([...value, newAsset.id]);

      setSearchTerm("");
    } catch (err) {
      setError("Failed to create asset.");
      console.error(err);
    }
    setIsCreating(false);
  };

  const handleRemove = (assetId: number) => {
   
    onChange(value.filter((id) => id !== assetId));
  };

  // --- JSX RENDER ---
  return (
    <div className="relative mt-4 w-full max-w-lg" ref={dropdownRef}>
      {/* Label prop ka istemaal */}
      <h3 className="mb-2 text-base font-medium text-gray-900">{label}</h3>
      <div className="relative">
        <div
          className={`flex items-center gap-2 rounded-md border bg-white px-3 py-2 min-h-12 ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-500/50"
              : "border-gray-300"
          } flex-wrap`}
          onClick={() => setIsOpen(true)}
        >
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />

        
          {selectedAssetObjects.map((asset) => (
            <span
              key={asset.id}
              className="flex items-center gap-1.5 rounded-full bg-gray-200 px-2 py-1 text-sm font-medium text-gray-700"
            >
              {asset.name}
              <button
                type="button"
                className="rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-300 outline-none"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleRemove(asset.id);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Baaki JSX same rahega */}
          <input
            type="text"
            placeholder="Start typing..."
            className="flex-1 bg-transparent p-0 outline-none border-none text-gray-900 placeholder-gray-400 min-w-20"
            style={{ minWidth: "80px" }}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
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

      {/* Dropdown Panel (Ismein koi badlaav nahi) */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
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
              availableAssets.length > 0 &&
              availableAssets.map((asset) => (
                <li
                  key={asset.id}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleSelect(asset)}
                >
                  {asset.name}
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
            {hasLoadedData &&
              !isLoading &&
              !error &&
              availableAssets.length === 0 &&
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
