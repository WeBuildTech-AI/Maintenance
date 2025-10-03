import { ChevronDown, Search } from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assetService } from "../../../../store/assets";
import Loader from "../../../Loader/Loader";

interface LocationDropdownProps {
  parentAssetOpen: boolean;
  setParentAssetOpen: (open: boolean) => void;
  parentAssetRef: RefObject<HTMLDivElement>;
  selectedParentAssets: string;
  setSelectedParentAssets: (val: string) => void;
}

interface parentAssetItem {
  name: string; // adjust if API differs
}

export function ParentAssetDropdown({
  parentAssetOpen,
  setParentAssetOpen,
  parentAssetRef,
  selectedParentAssets,
  setSelectedParentAssets,
}: LocationDropdownProps) {
  const navigate = useNavigate(); // ✅ Use React Router's hook
  const [parentAssetData, setParentAssetData] = useState<parentAssetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const handleFetchApi = async () => {
    if (hasFetched.current) return;
    setLoading(true);
    try {
      const res = await assetService.fetchAssetsName(10, 1, 0);
      setParentAssetData(res.data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (parentAssetRef.current && !parentAssetRef.current.contains(event.target as Node)) {
        setParentAssetOpen(false);
      }
    };
    if (parentAssetOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [parentAssetOpen, setParentAssetOpen, parentAssetRef]);

  return (
    <div className="relative mt-4" ref={parentAssetRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">
        Parent Assets
      </h3>

      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() =>{ setParentAssetOpen(!parentAssetOpen); handleFetchApi()}}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-600">Select...</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {parentAssetOpen && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
          {loading ? (
                     <div className="flex justify-center items-center py-4">
                       <Loader />
                     </div>
                   ) : (
                     <ul className="max-h-32 overflow-y-auto">
                       {parentAssetData.length > 0 ? (
                         parentAssetData.map((loc, index) => (
                           <li
                             key={index}
                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                             onClick={() => {
                               setSelectedParentAssets(loc); // 👈 store whole object
                               setParentAssetOpen(false);
                              //  console.log("Send ID to backend:", loc.id);
                             }}
                           >
                             {loc.name}
                           </li>
                         ))
                       ) : (
                         <li className="px-4 py-2 text-gray-500">No locations found</li>
                       )}
                     </ul>
                   )}
          <div
            onClick={() => navigate("")} // ✅ Navigate works now
            className="relative flex items-center px-4 py-2 rounded-md text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
            <span className="ml-3">Create Location</span>
          </div>
        </div>
      )}
    </div>
  );
}