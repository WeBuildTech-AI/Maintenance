import { DynamicSelect, type SelectOption } from "./DynamicSelect";
import { Clock, DollarSign, Wrench, MapPin } from "lucide-react";

interface Props {
  selectedPriority: string;
  onPriorityChange: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  qrCodeValue: string;
  onQrCodeChange: (value: string) => void;
  teamIds: string[];
  onTeamSelect: (value: string | string[]) => void;
  teamOptions: SelectOption[];
  isTeamsLoading: boolean;
  onFetchTeams: () => void;
  onCreateTeam: () => void;

  categoryIds: string[];
  onCategorySelect: (value: string | string[]) => void;
  categoryOptions: SelectOption[];
  isCategoriesLoading: boolean;
  onFetchCategories: () => void;
  onCreateCategory: () => void;

  partIds: string[];
  onPartSelect: (value: string | string[]) => void;
  partOptions: SelectOption[];
  isPartsLoading: boolean;
  onFetchParts: () => void;
  onCreatePart: () => void;

  vendorIds: string[];
  onVendorSelect: (value: string | string[]) => void;
  vendorOptions: SelectOption[];
  isVendorsLoading: boolean;
  onFetchVendors: () => void;
  onCreateVendor: () => void;

  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
  onPanelClick: (panel: "time" | "cost" | "parts") => void;
  isEditMode: boolean;

  // ✅ NEW: Receive part usages to render the card
  partUsages?: any[];
  timeEntries?: any[]; // ✅ NEW PROP
  otherCosts?: any[];  // ✅ NEW PROP
}

// 🛠️ Helper for formatted duration
const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const TrackingButton = ({ icon: Icon, label, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors duration-200"
  >
    <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full flex-shrink-0">
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
    <div className="ml-4 text-left">
      <div className="text-sm font-medium text-blue-600">{label}</div>
      <div className="text-xs text-gray-500">Add</div>
    </div>
  </button>
);

export function WorkOrderClassificationAndLinks({
  selectedPriority,
  onPriorityChange,
  status,
  onStatusChange,
  qrCodeValue,
  onQrCodeChange,
  teamIds,
  onTeamSelect,
  teamOptions,
  isTeamsLoading,
  onFetchTeams,
  onCreateTeam,
  categoryIds,
  onCategorySelect,
  categoryOptions,
  isCategoriesLoading,
  onFetchCategories,
  onCreateCategory,
  partIds,
  onPartSelect,
  partOptions,
  isPartsLoading,
  onFetchParts,
  onCreatePart,
  vendorIds,
  onVendorSelect,
  vendorOptions,
  isVendorsLoading,
  onFetchVendors,
  onCreateVendor,
  activeDropdown,
  setActiveDropdown,
  onPanelClick,
  isEditMode,
  partUsages = [], // Default empty
  timeEntries = [], // Default empty
  otherCosts = [], // Default empty
}: Props) {
  const priorities = [
    { name: "None", color: "bg-blue-500", textColor: "text-white" },
    { name: "Low", color: "bg-green-500", textColor: "text-white" },
    { name: "Medium", color: "bg-orange-500", textColor: "text-white" },
    { name: "High", color: "bg-red-500", textColor: "text-white" },
  ];

  const statuses = [
    { name: "Open", color: "bg-blue-500" },
    { name: "In Progress", color: "bg-orange-500" },
    { name: "On Hold", color: "bg-yellow-500" },
    { name: "Completed", color: "bg-green-500" },
  ];

  // Calculate total cost from the partUsages array
  const partsTotalCost = partUsages.reduce((sum, p) => {
    const cost =
      Number(p.totalCost) || Number(p.unitCost || 0) * Number(p.quantity || 0);
    return sum + cost;
  }, 0);

  // ✅ CALCULATE TOTALS
  const totalTimeMins = timeEntries.reduce((acc, t) => {
      const minutes = Number(t.minutes || 0) + (Number(t.hours || 0) * 60) + (Number(t.totalMinutes || 0));
      return acc + minutes;
  }, 0);

  const totalTimeCost = timeEntries.reduce((acc, t) => {
      // Calculate individual cost if stored, or approximate from rate * duration
      const durationHours = (Number(t.minutes || 0) / 60) + Number(t.hours || 0) + (Number(t.totalMinutes || 0) / 60);
      return acc + (durationHours * Number(t.rate || t.hourlyRate || 0));
  }, 0);

  const totalOtherCosts = otherCosts.reduce((acc, c) => acc + Number(c.amount || c.cost || 0), 0);

  return (
    <>
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Priority</h3>
        <DynamicSelect
          name="priority"
          placeholder="Select priority..."
          options={priorities.map(p => ({ id: p.name, name: p.name }))}
          loading={false}
          value={selectedPriority}
          onSelect={(val) => onPriorityChange(val as string)}
          onFetch={() => {}}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Status</h3>
        <DynamicSelect
          name="status"
          placeholder="Select status..."
          options={statuses.map(s => ({ id: s.name, name: s.name }))}
          loading={false}
          value={status || ""}
          onSelect={(val) => onStatusChange && onStatusChange(val as string)}
          onFetch={() => {}}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Teams</h3>
        <DynamicSelect
          name="teams"
          placeholder="Select teams..."
          options={teamOptions}
          loading={isTeamsLoading}
          value={teamIds}
          onSelect={onTeamSelect}
          onFetch={onFetchTeams}
          ctaText="+ Create New Team"
          onCtaClick={onCreateTeam}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Categories</h3>
        <DynamicSelect
          name="categories"
          placeholder="Select categories..."
          options={categoryOptions}
          loading={isCategoriesLoading}
          value={categoryIds}
          onSelect={onCategorySelect}
          onFetch={onFetchCategories}
          ctaText="+ Create New Category"
          onCtaClick={onCreateCategory}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Parts</h3>
        <DynamicSelect
          name="parts"
          placeholder="Select parts..."
          options={partOptions}
          loading={isPartsLoading}
          value={partIds}
          onSelect={onPartSelect}
          onFetch={onFetchParts}
          ctaText="+ Add New Part"
          onCtaClick={onCreatePart}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Vendors</h3>
        <DynamicSelect
          name="vendors"
          placeholder="Select vendors..."
          options={vendorOptions}
          loading={isVendorsLoading}
          value={vendorIds}
          onSelect={onVendorSelect}
          onFetch={onFetchVendors}
          ctaText="+ Add New Vendor"
          onCtaClick={onCreateVendor}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>

      {/* <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-900">
          QR Code/Barcode
        </label>
        <input
          type="text"
          value={qrCodeValue}
          onChange={(e) => onQrCodeChange(e.target.value)}
          placeholder="Enter or scan code"
          className="w-full h-12 px-4 border border-gray-300 rounded-md text-sm bg-white"
        />
        <div className="mt-2">
          <span className="text-gray-900 text-sm">or </span>
          <span className="text-orange-600 text-sm cursor-pointer hover:underline">
            Generate Code
          </span>
        </div>
      </div> */}

      {isEditMode && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cost Tracking
          </h2>
          <div className="space-y-3">
            {/* ✅ CONDITIONALLY RENDER PARTS CARD IF PARTS EXIST */}
            {partUsages.length > 0 ? (
              <div
                onClick={() => onPanelClick("parts")}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-all group"
              >
                {/* Card Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Wrench size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Parts Used</h3>
                  </div>
                  <span className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </span>
                </div>

                {/* Parts List */}
                {/* Parts List */}
                <div className="space-y-4 mb-4">
                  {partUsages.map((p: any, i: number) => (
                    <div
                      key={p.id || i}
                      className="flex justify-between items-start text-sm border-b border-gray-100 border-dashed pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium text-gray-800 mb-1">
                          {p.part?.name || "Unknown Part"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={12} />{" "}
                          {p.location?.name || "Unknown Location"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 font-medium mb-1">
                          x{p.quantity || 0}
                        </div>
                        {/* Show cost if available */}
                        <div className="text-xs text-gray-500">
                          $
                          {Number(
                            p.totalCost ||
                              Number(p.unitCost) * Number(p.quantity) ||
                              0
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-gray-50 -mx-4 -mb-4 px-4 py-3 mt-4 rounded-b-lg">
                  <span className="text-sm font-medium text-gray-600">
                    Total Parts Cost
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    ${partsTotalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              // Default Button if no parts
              <TrackingButton
                icon={Wrench}
                label="Parts"
                onClick={() => onPanelClick("parts")}
              />
            )}

            {/* ✅ TIME CARD */}
            {timeEntries.length > 0 ? (
                <div onClick={() => onPanelClick("time")} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-all group">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2"><Clock size={18} className="text-gray-500" /><h3 className="font-semibold text-gray-900">Time Logged</h3></div>
                        <span className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                    </div>
                    <div className="space-y-4 mb-4">
                        {timeEntries.map((t: any, i: number) => (
                             <div key={i} className="flex justify-between items-start text-sm border-b border-gray-100 border-dashed pb-3 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-medium text-gray-800 mb-1">{t.user?.fullName || "User"}</div>
                                    <div className="text-xs text-gray-500">{(t.entryType || "work").charAt(0).toUpperCase() + (t.entryType || "work").slice(1)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-900 font-medium mb-1">{formatDuration(Number(t.totalMinutes) || (Number(t.hours)*60 + Number(t.minutes)))}</div>
                                    {Number(t.rate || t.hourlyRate) > 0 && <div className="text-xs text-gray-500">${(Number(t.rate || t.hourlyRate) * ((Number(t.totalMinutes) || (Number(t.hours)*60 + Number(t.minutes)))/60)).toFixed(2)}</div>}
                                </div>
                             </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-gray-50 -mx-4 -mb-4 px-4 py-3 mt-4 rounded-b-lg">
                        <span className="text-sm font-medium text-gray-600">Total Time Cost</span>
                        <div className="text-right">
                            <span className="block text-base font-bold text-gray-900">${totalTimeCost.toFixed(2)}</span>
                            <span className="text-xs text-gray-500">{formatDuration(totalTimeMins)}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <TrackingButton icon={Clock} label="Time" onClick={() => onPanelClick("time")} />
            )}

            {/* ✅ OTHER COSTS CARD */}
            {otherCosts.length > 0 ? (
                <div onClick={() => onPanelClick("cost")} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-all group">
                    <div className="flex justify-between items-center mb-3">
                         <div className="flex items-center gap-2"><DollarSign size={18} className="text-gray-500" /><h3 className="font-semibold text-gray-900">Other Costs</h3></div>
                         <span className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                    </div>
                    <div className="space-y-4 mb-4">
                        {otherCosts.map((c: any, i: number) => (
                             <div key={i} className="flex justify-between items-start text-sm border-b border-gray-100 border-dashed pb-3 last:border-0 last:pb-0">
                                <div className="font-medium text-gray-800">{c.description || "Cost Entry"}</div>
                                <div className="text-gray-900 font-medium">${Number(c.amount || c.cost || 0).toFixed(2)}</div>
                             </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-gray-50 -mx-4 -mb-4 px-4 py-3 mt-4 rounded-b-lg">
                        <span className="text-sm font-medium text-gray-600">Total Other Costs</span>
                        <span className="text-base font-bold text-gray-900">${totalOtherCosts.toFixed(2)}</span>
                    </div>
                </div>
            ) : (
                <TrackingButton icon={DollarSign} label="Other Costs" onClick={() => onPanelClick("cost")} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
