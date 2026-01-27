import { useEffect, useState } from "react";
import { Package, Upload } from "lucide-react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";

interface Props {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  
  // Parent sends "HH:MM" string here (e.g. "4:40")
  estimatedTime: string; 
  onEstimatedTimeChange: (value: string) => void;

  locationId: string;
  onLocationSelect: (value: string | string[]) => void;
  locationOptions: SelectOption[];
  isLocationsLoading: boolean;
  onFetchLocations: () => void;
  onCreateLocation: () => void;
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
}

export function WorkOrderDetails({
  name, onNameChange, 
  description, onDescriptionChange,
  estimatedTime, onEstimatedTimeChange,
  locationId, onLocationSelect, locationOptions, isLocationsLoading, onFetchLocations, onCreateLocation,
  activeDropdown, setActiveDropdown
}: Props) {

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  // ✅ SYNC: Jab Parent se "HH:MM" aaye, toh usse split karke inputs me dikhao
  useEffect(() => {
    if (!estimatedTime) {
      setHours("");
      setMinutes("");
      return;
    }

    // Check if format is "H:M"
    if (estimatedTime.includes(":")) {
      const [h, m] = estimatedTime.split(":");
      setHours(h === "0" ? "" : h);
      setMinutes(m === "0" ? "" : m);
    } else {
      // Fallback if somehow a plain number comes
      setHours(estimatedTime);
      setMinutes("");
    }
  }, [estimatedTime]);

  // ✅ HANDLER: Jab user type kare, toh wapas "HH:MM" bana kar parent ko bhejo
  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours);
    setMinutes(newMinutes);

    const h = newHours || "0";
    const m = newMinutes || "0";
    
    // Always send formatted string "H:M"
    onEstimatedTimeChange(`${h}:${m}`);
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

      {/* ✅ UPDATED: Estimated Time Inputs */}
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
                    placeholder="0"
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
                    placeholder="0"
                />
                <span className="text-sm font-medium text-gray-900">M</span>
            </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-sm font-medium text-gray-900">Location</h3>
        <DynamicSelect 
          name="location" 
          placeholder="Select a location..." 
          options={locationOptions} 
          loading={isLocationsLoading} 
          value={locationId} 
          onSelect={onLocationSelect} 
          onFetch={onFetchLocations} 
          ctaText="+ Create New Location" 
          onCtaClick={onCreateLocation} 
          activeDropdown={activeDropdown} 
          setActiveDropdown={setActiveDropdown} 
          limitOptions={3} 
        />
      </div>
    </>
  );
}