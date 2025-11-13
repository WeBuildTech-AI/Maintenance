import {
  Calendar,

  GripVertical,
  Gauge,

} from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { type FieldData } from "../types";
// --- [NEW] Imports for fetching data and using the custom dropdown ---
import { useState,  useCallback } from "react";
import { meterService } from "../../../../store/meters/meters.service";
import type { MeterResponse } from "../../../../store/meters/meters.types";

import LibDynamicSelect from "../components/LibDynamicSelect";

// --- ADDED: A clock icon ---
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
// --- END ADDED ---

interface FieldContentRendererProps {
  field: FieldData;
  isEditing: boolean;
  parentSectionId?: number;
}

export function FieldContentRenderer({
  field,
  isEditing,
}: FieldContentRendererProps) {
  const {
    handleFieldPropChange,
    handleOptionChange,
    handleRemoveOption,
    handleAddOption,
    // --- [NEW] Custom dropdown ke liye context se state lein ---
    activeDropdown,
    setActiveDropdown,
  } = useProcedureBuilder();

  const [meters, setMeters] = useState<MeterResponse[]>([]);
  const [isLoadingMeters, setIsLoadingMeters] = useState(false);

  const loadMeters = useCallback(async () => {
    // Don't refetch if already loading or already fetched
    if (isLoadingMeters || meters.length > 0) return;

    setIsLoadingMeters(true);
    try {
      const data = await meterService.fetchMeters(1000, 1, 0); // Default pagination
      setMeters(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch meters:", e);
      setMeters([]); // Error par empty array
    } finally {
      setIsLoadingMeters(false);
    }
  }, [isLoadingMeters, meters.length]); // Dependencies
  
  const handleMeterSelectChange = (meterId: string | string[]) => {
    const selectedId = Array.isArray(meterId) ? meterId[0] : meterId;
    
    if (!selectedId) {
      // Handle "None" or "Clear"
      handleFieldPropChange(field.id, "selectedMeter", "");
      handleFieldPropChange(field.id, "selectedMeterName", "");
      handleFieldPropChange(field.id, "meterUnit", "");
      handleFieldPropChange(field.id, "lastReading", null);
      return;
    }

    const selectedMeter = meters.find(m => m.id === selectedId);
    if (!selectedMeter) return;

    handleFieldPropChange(field.id, "selectedMeter", selectedId);
    handleFieldPropChange(field.id, "selectedMeterName", selectedMeter.name);
    handleFieldPropChange(field.id, "meterUnit", selectedMeter.measurement?.symbol || "");
    handleFieldPropChange(field.id, "lastReading", selectedMeter.last_reading?.value || null);
  };


  const ReadingPlaceholder = ({

    className,
  }: {
    unit?: string;
    className?: string;
  }) => (
    
    <div className={`relative ${className}`}> 
      <textarea
        placeholder="Reading will be entered here"
        disabled
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 italic placeholder-gray-400 resize-none h-24 bg-gray-50 cursor-not-allowed"
      />
    </div>
  );

  switch (field.selectedType) {
    case "Checkbox":
      return (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            id={`cb-${field.id}`}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`cb-${field.id}`} className="text-gray-700">
            {field.label || "Checkbox"}
          </label>
        </div>
      );

    case "Text Field":
      return (
        <textarea
          placeholder="Text will be entered here"
          disabled
          className="mt-3 w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 cursor-not-allowed"
        />
      );

    case "Number Field":
      return (
        <textarea
          placeholder="Number will be entered here"
          disabled
          className="mt-3 w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 italic placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 cursor-not-allowed"
        />
      );

    case "Amount ($)":
      return (
        <div className="relative mt-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
          <textarea
            placeholder="Amount will be entered here"
            disabled
            className="w-full border border-gray-200 rounded-md px-3 py-2 pl-7 text-sm text-gray-600 italic placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 cursor-not-allowed"
          />
        </div>
      );

    case "Multiple Choice":
    case "Checklist":
      const options = field.options?.length ? field.options : ["Option 1"];
      const type =
        field.selectedType === "Multiple Choice" ? "radio" : "checkbox";

      return (
        <div className="mt-3">
          {options.map((opt, index) => (
            <div key={index} className="flex items-center mb-2 gap-2">
              {isEditing ? (
                <>
                  <div className="text-gray-400 cursor-grab">
                    <GripVertical size={16} />
                  </div>
                  <input
                    type="text"
                    value={opt}
                    placeholder={`Option ${index + 1}`}
                    onChange={(e) =>
                      handleOptionChange(field.id, index, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => handleRemoveOption(field.id, index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <input
                    type={type}
                    id={`opt-${field.id}-${index}`}
                    name={`group-${field.id}`}
                    className={`h-4 w-4 ${
                      type === "radio" ? "rounded-full" : "rounded"
                    } border-gray-300 text-blue-600 focus:ring-blue-500`}
                  />
                  <label
                    htmlFor={`opt-${field.id}-${index}`}
                    className="text-gray-700"
                  >
                    {opt}
                  </label>
                </>
              )}
            </div>
          ))}
          {isEditing && (
            <>
              <button
                onClick={() => handleAddOption(field.id)}
                className="text-blue-600 text-sm font-medium mt-1"
              >
                + Add Option
              </button>
            </>
          )}
        </div>
      );

    case "Inspection Check":
      return (
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-green-600 font-medium cursor-pointer hover:bg-gray-50">
            Pass
          </div>
          <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-orange-500 font-medium cursor-pointer hover:bg-gray-50">
            Flag
          </div>
          <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-red-600 font-medium cursor-pointer hover:bg-gray-50">
            Fail
          </div>
        </div>
      );

    case "Yes, No, N/A":
      return (
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-50">
            Yes
          </div>
          <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-50">
            No
          </div>
          <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-50">
            N/A
          </div>
        </div>
      );

    case "Picture/File Field":
      return (
        <div className="w-full border border-dashed border-yellow-400 rounded-md mt-3">
          <div className="bg-white text-gray-600 text-center py-4 rounded-md">
            Assignees will add a Picture/File here
          </div>
        </div>
      );

    case "Signature Block":
      return (
        <div className="w-full border border-dashed border-gray-300 rounded-md mt-3">
          <div className="bg-gray-50 text-gray-400 italic text-center py-10 rounded-md">
            Assignees will sign here
          </div>
        </div>
      );

    case "Date":
      const inputBaseStyle =
        "flex-1 w-full bg-gray-50 text-sm text-gray-600 placeholder-gray-400 outline-none";
      const pillStyle =
        "flex items-center gap-2 flex-1 border border-gray-200 rounded-md px-3 py-3 bg-gray-50 cursor-not-allowed";

      return (
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          {/* Date Input */}
          <div className={pillStyle}>
            <Calendar size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              disabled
              className={inputBaseStyle}
            />
          </div>
          {/* Time Input (conditionally) */}
          {field.includeTime && (
            <div className={pillStyle}>
              <ClockIcon />
              <input
                type="text"
                placeholder="-- : -- --"
                disabled
                className={inputBaseStyle}
              />
            </div>
          )}
        </div>
      );

    case "Meter Reading":
      if (isEditing) {
        return (
          <div className="mt-3 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Select Meter
              </label>
              {/* --- [FIX] Native <select> ko <LibDynamicSelect> se replace kiya --- */}
              <div 
                className="flex items-center bg-white"
                // Click ko field tak bubble hone se rokein
                onClick={(e) => e.stopPropagation()} 
              >
                <LibDynamicSelect
                  // --- [NEW] Icon prop add karein ---
                  icon={<Gauge size={20} className="text-gray-500" />}
                  options={meters.map(m => ({ id: m.id, label: m.name }))}
                  value={field.selectedMeter || ""}
                  onChange={handleMeterSelectChange}
                  fetchOptions={loadMeters} // Dropdown khulne par fetch karega
                  loading={isLoadingMeters}
                  placeholder={isLoadingMeters ? "Loading meters..." : "Start typing..."}
                  name={`meter-select-${field.id}`} // Dropdown ke liye unique name
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  isMulti={false} // Sirf ek select kar sakte hain
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Unit
              </label>
              <input
                type="text"
                placeholder="e.g., Feet, kWh, Volts"
                value={field.meterUnit || ""}
                // Unit auto-fill hoga, isliye read-only
                readOnly
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50"
              />
            </div>
            {/* --- [FIX] ReadingPlaceholder component unit ko andar dikhayega --- */}
            <ReadingPlaceholder unit={field.meterUnit} className="mt-2" />
          </div>
        );
      } else {
        // --- View mode logic ---
        return (
          <>
            {/* Selected meter ka naam dikhayein */}
            {field.selectedMeterName && (
              <p className="text-blue-600 text-sm mb-3">
                {field.selectedMeterName}
              </p>
            )}
            {/* "Last Reading" ab FieldViewer.tsx mein dikhega */}
            {/* --- [FIX] ReadingPlaceholder component unit ko andar dikhayega --- */}
            <ReadingPlaceholder unit={field.meterUnit} className="mt-2" />
          </>
        );
      }

    default:
      return null;
  }
}