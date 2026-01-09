import { useState, useEffect } from "react";
import { Trash2, X, Plus } from "lucide-react";
import { DynamicSelect, type SelectOption } from "../../work-orders/NewWorkOrderForm/DynamicSelect";
import { meterService } from "../../../store/meters/meters.service";

interface Condition {
  id: string;
  operator: string;
  value: string;
}

export interface TriggerData {
  meterId: string;
  assetId: string;
  conditions: Condition[];
  forOption: string;
  multipleReadingsCount: string;
  lastReadingsCount: string;
  durationValue: string;
  timeUnit: string;
}

interface TriggerCardProps {
  title: string;
  onDelete: () => void;
  assetOptions: SelectOption[];
  meterOptions: SelectOption[];
  isAssetsLoading: boolean;
  isMetersLoading: boolean;
  onFetchAssets: () => void;
  onFetchMeters: () => void;
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
  onChange?: (data: TriggerData) => void;
}

export function TriggerCard({
  title,
  onDelete,
  assetOptions,
  meterOptions,
  isAssetsLoading,
  isMetersLoading,
  onFetchAssets,
  onFetchMeters,
  activeDropdown,
  setActiveDropdown,
  onChange,
}: TriggerCardProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [selectedMeterId, setSelectedMeterId] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [meterUnit, setMeterUnit] = useState<string>("");
  const [forOption, setForOption] = useState<string>("oneReading");
  
  // For "Multiple readings" option
  const [multipleReadingsCount, setMultipleReadingsCount] = useState<string>("");
  const [lastReadingsCount, setLastReadingsCount] = useState<string>("");
  
  // For "A reading longer than" option
  const [durationValue, setDurationValue] = useState<string>("");
  const [timeUnit, setTimeUnit] = useState<string>("minutes");

  // Notify parent of data changes
  useEffect(() => {
    if (onChange) {
      onChange({
        meterId: selectedMeterId,
        assetId: selectedAssetId,
        conditions,
        forOption,
        multipleReadingsCount,
        lastReadingsCount,
        durationValue,
        timeUnit,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeterId, selectedAssetId, conditions, forOption, multipleReadingsCount, lastReadingsCount, durationValue, timeUnit]);

  // Auto-populate asset when meter is selected
  useEffect(() => {
    const fetchMeterDetails = async () => {
      if (selectedMeterId) {
        try {
          const meter = await meterService.fetchMeterById(selectedMeterId);
          if (meter) {
            // Auto-populate asset if meter has an associated asset
            if (meter.assetId) {
              setSelectedAssetId(meter.assetId);
            }
            // Store meter unit for condition display
            if (meter.measurement) {
              setMeterUnit(meter.measurement.name);
            }
          }
        } catch (error) {
          console.error("Failed to fetch meter details:", error);
        }
      }
    };

    fetchMeterDetails();
  }, [selectedMeterId]);

  const handleMeterSelect = (value: string | string[]) => {
    const meterId = typeof value === "string" ? value : value[0] || "";
    setSelectedMeterId(meterId);
    
    // Clear conditions when meter changes
    if (!meterId) {
      setConditions([]);
      setSelectedAssetId("");
      setMeterUnit("");
    }
  };

  const handleClearMeter = () => {
    setSelectedMeterId("");
    setConditions([]);
    setSelectedAssetId("");
    setMeterUnit("");
  };

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      operator: "equal",
      value: "",
    };
    setConditions([...conditions, newCondition]);
  };

  const deleteCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, field: "operator" | "value", newValue: string) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [field]: newValue } : c))
    );
  };

  const operatorOptions = [
    { value: "equal", label: "Is equal to" },
    { value: "notEqual", label: "Is not equal to" },
    { value: "above", label: "Is above" },
    { value: "below", label: "Is below" },
    { value: "aboveOrEqual", label: "Is above or equal to" },
    { value: "belowOrEqual", label: "Is below or equal to" },
    {value: "isBetween", label: "Is between"},
    {value: "DecreasedbyLastTrigger", label: "Decreased by (from last trigger)"},
    {value: "IncreasedbyLastTrigger", label: "Increased by (from last trigger)"},
    {value: "IncreasedbyLastReading", label: "Increased by (from last reading)"},
    {value: "DecreasedbyLastReading", label: "Decreased by (from last reading)"}

  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <p className="font-medium text-blue-800">When: {title}</p>
        <button className="p-2 hover:bg-blue-100 rounded" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-blue-600" />
        </button>
      </div>

      {/* Asset Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Asset</label>
        <DynamicSelect
          name="trigger-asset"
          placeholder="Start typing..."
          options={assetOptions}
          loading={isAssetsLoading}
          value={selectedAssetId}
          onSelect={(val) => setSelectedAssetId(typeof val === "string" ? val : val[0] || "")}
          onFetch={onFetchAssets}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>

      {/* Meter Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Meter <span className="text-red-500">(Required)</span>
        </label>
        <div className="relative">
          <DynamicSelect
            name="trigger-meter"
            placeholder="Start typing..."
            options={meterOptions}
            loading={isMetersLoading}
            value={selectedMeterId}
            onSelect={handleMeterSelect}
            onFetch={onFetchMeters}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
          {selectedMeterId && (
            <button
              onClick={handleClearMeter}
              className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Conditions Section - Only show if meter is selected */}
      {selectedMeterId && (
        <div className="space-y-3 mt-4 ml-6 border-l-2 border-gray-200 pl-4">
          {conditions.map((condition, index) => (
            <div key={condition.id}>
              {index > 0 && (
                <div className="text-sm font-medium text-gray-700 mb-2">Or</div>
              )}
              <div className="flex gap-2 items-center">
                {/* Operator Dropdown */}
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(condition.id, "operator", e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {operatorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Value Input */}
                <div className="flex-1 flex gap-2 items-center">
                  <input
                    type="number"
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                    placeholder="0"
                    className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {meterUnit && (
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      {meterUnit}
                    </span>
                  )}
                </div>

                {/* Delete Condition Button */}
                <button
                  onClick={() => deleteCondition(condition.id)}
                  className="p-2 hover:bg-red-50 rounded text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Condition Button */}
          <button
            onClick={addCondition}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add Condition</span>
            </div>
          </button>

          {/* For Dropdown */}
          <div className="space-y-2 mt-4 -ml-4 pl-0">
            <label className="text-sm font-medium text-gray-700">For</label>
            <select
              value={forOption}
              onChange={(e) => setForOption(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="oneReading">One reading</option>
              <option value="multipleReadings">Multiple readings</option>
              <option value="readingLongerThan">A reading longer than</option>
            </select>

            {/* Conditional inputs for "Multiple readings" */}
            {forOption === "multipleReadings" && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  value={multipleReadingsCount}
                  onChange={(e) => setMultipleReadingsCount(e.target.value)}
                  placeholder="0"
                  className="w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">of the last</span>
                <input
                  type="number"
                  value={lastReadingsCount}
                  onChange={(e) => setLastReadingsCount(e.target.value)}
                  placeholder="0"
                  className="w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">readings</span>
              </div>
            )}

            {/* Conditional inputs for "A reading longer than" */}
            {forOption === "readingLongerThan" && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  placeholder="0"
                  className="w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
