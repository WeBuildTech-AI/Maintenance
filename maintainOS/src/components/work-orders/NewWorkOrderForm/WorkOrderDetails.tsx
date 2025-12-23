import { useEffect, useState } from "react";
import { Package, Upload } from "lucide-react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";

interface Props {
  name: string; onNameChange: (value: string) => void;
  description: string; onDescriptionChange: (value: string) => void;
  
  // ✅ Props for Time
  estimatedTime: string; 
  onEstimatedTimeChange: (value: string) => void;

  locationId: string; onLocationSelect: (value: string | string[]) => void;
  locationOptions: SelectOption[]; isLocationsLoading: boolean;
  onFetchLocations: () => void; onCreateLocation: () => void;
  activeDropdown: string | null; setActiveDropdown: (name: string | null) => void;
}

export function WorkOrderDetails({
  name, onNameChange, 
  description, onDescriptionChange,
  estimatedTime, onEstimatedTimeChange,
  locationId, onLocationSelect, locationOptions, isLocationsLoading, onFetchLocations, onCreateLocation,
  activeDropdown, setActiveDropdown
}: Props) {

  // ✅ Local State for UI splitting (Hours vs Minutes)
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  // ✅ SYNC: When Parent sends data (e.g. from API "1.5"), update local inputs ("1" and "30")
  useEffect(() => {
    const totalHours = Number(estimatedTime);
    
    // Handle empty or 0 initial state safely
    if (!estimatedTime || isNaN(totalHours)) {
        if (estimatedTime === "") {
            setHours("");
            setMinutes("");
        }
        return;
    }

    const h = Math.floor(totalHours);
    // Extract minutes from decimal part (0.5 * 60 = 30)
    const m = Math.round((totalHours - h) * 60);

    setHours(h > 0 ? String(h) : "");
    setMinutes(m > 0 ? String(m) : "");
  }, [estimatedTime]);

  // ✅ HANDLER: Calculate Total and Send to Parent
  const handleTimeChange = (newHours: string, newMinutes: string) => {
    // Update local state immediately for typing feel
    setHours(newHours);
    setMinutes(newMinutes);

    const h = parseInt(newHours || "0", 10);
    const m = parseInt(newMinutes || "0", 10);
    
    // Logic: Total Hours = Hours + (Minutes / 60)
    const total = h + (m / 60);
    
    // If both empty, send empty string (so backend doesn't receive 0 unexpectedly)
    // If has value, send stringified number
    const finalValue = (newHours === "" && newMinutes === "") ? "" : total.toString();

    onEstimatedTimeChange(finalValue);
  };

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full border bg-white text-gray-400">
            <Package className="h-5 w-5" />
        </div>
        <div className="w-full">
            <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter Work Order Name (Required)" className="w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 text-lg text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Pictures</h3>
        <div className="mb-20 border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer">
            <Upload className="mx-auto mb-2 h-6 w-6" />
            <p className="text-gray-900">Add or drag pictures</p>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-4 text-sm font-medium text-gray-900">Description</label>
        <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="Add a description" className="mt-2 w-full min-h-[96px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      {/* ✅ UPDATED: Estimated Time Section (Design Match) */}
      <div className="mt-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Estimated Time</h3>
        <div className="flex items-center gap-4">
            {/* Hours Input */}
            <div className="flex-1 flex items-center gap-2">
                <input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(e) => handleTimeChange(e.target.value, minutes)}
                    className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">H</span>
            </div>
            {/* Minutes Input */}
            <div className="flex-1 flex items-center gap-2">
                <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => handleTimeChange(hours, e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">M</span>
            </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Location</h3>
        <DynamicSelect name="location" placeholder="Select a location..." options={locationOptions} loading={isLocationsLoading} value={locationId} onSelect={onLocationSelect} onFetch={onFetchLocations} ctaText="+ Create New Location" onCtaClick={onCreateLocation} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>
    </>
  );
}