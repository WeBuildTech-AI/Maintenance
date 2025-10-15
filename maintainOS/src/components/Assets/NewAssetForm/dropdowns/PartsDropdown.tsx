import { ChevronDown, Search, X } from "lucide-react";
import { RefObject, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { partService } from "../../../../store/parts";
import Loader from "../../../Loader/Loader";

// ✅ Step 1: Interface ko parent component ke type se match karein
interface SelectableItem {
  id: number | string;
  name: string;
}

// ✅ Step 2: Props ke types ko sahi karein
interface PartsDropdownProps {
  partOpen: boolean;
  setPartOpen: (open: boolean) => void;
  partRef: RefObject<HTMLDivElement>;
  // 👇 Major Change: Ab ye ek array of objects lega
  setSelectedParts: (parts: SelectableItem[]) => void;
  selectedParts: SelectableItem[];
}

export function PartsDropdown({
  partOpen,
  setPartOpen,
  partRef,
  selectedParts,
  setSelectedParts,
}: PartsDropdownProps) {
  const navigate = useNavigate();
  const [partData, setPartData] = useState<SelectableItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetchApi = async () => {
    if (partData.length > 0) return; // Baar baar fetch na karein
    setLoading(true);
    try {
      const res = await partService.fetchPartsName();
      setPartData(res || []);
    } catch (err) {
      console.error("Error fetching parts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (partRef.current && !partRef.current.contains(event.target as Node)) {
        setPartOpen(false);
      }
    };
    if (partOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [partOpen, setPartOpen, partRef]);

  // ✅ Step 3: Multi-select ke liye logic banayein
  const handleSelectPart = (part: SelectableItem) => {
    const isSelected = selectedParts.some((p) => p.id === part.id);

    if (isSelected) {
      // Agar pehle se selected hai, to use array se hata dein (deselect)
      setSelectedParts(selectedParts.filter((p) => p.id !== part.id));
    } else {
      // Agar selected nahi hai, to use array mein add karein
      setSelectedParts([...selectedParts, part]);
    }
  };

  // ✅ Step 4: Display logic ko theek karein (ek se zyada naam dikhane ke liye)
  const displayValue =
    selectedParts.length > 0
      ? selectedParts.map((p) => p.name).join(", ")
      : "Select...";

  return (
    <div className="relative mt-4" ref={partRef}>
      <h3 className="mb-2 text-base font-medium text-gray-900">Part</h3>

      <div
        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
        onClick={() => {
          setPartOpen(!partOpen);
          handleFetchApi();
        }}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="flex-1 text-gray-600 truncate">{displayValue}</span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      {partOpen && (
        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader />
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {partData.length > 0 ? (
                partData.map((part) => (
                  <li
                    key={part.id}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
                      selectedParts.some((p) => p.id === part.id)
                        ? "font-semibold bg-gray-100"
                        : ""
                    }`}
                    onClick={() => handleSelectPart(part)} // 👈 Yahan naya function use karein
                  >
                    {part.name}
                    {selectedParts.some((p) => p.id === part.id) && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No parts found</li>
              )}
            </ul>
          )}
          <div
            onClick={() => navigate("/inventory")}
            className="relative flex items-center px-4 py-2 rounded-b-md text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
            <span className="ml-3">Create Part</span>
          </div>
        </div>
      )}
    </div>
  );
}
