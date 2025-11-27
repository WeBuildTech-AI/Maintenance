import { DynamicSelect, type SelectOption } from "./DynamicSelect";
import { Clock, DollarSign, Wrench, MapPin } from "lucide-react";

interface Props {
  selectedPriority: string; onPriorityChange: (value: string) => void;
  qrCodeValue: string; onQrCodeChange: (value: string) => void;
  teamIds: string[]; onTeamSelect: (value: string | string[]) => void;
  teamOptions: SelectOption[]; isTeamsLoading: boolean;
  onFetchTeams: () => void; onCreateTeam: () => void;
  
  categoryIds: string[]; onCategorySelect: (value: string | string[]) => void;
  categoryOptions: SelectOption[]; isCategoriesLoading: boolean;
  onFetchCategories: () => void; onCreateCategory: () => void;

  partIds: string[]; onPartSelect: (value: string | string[]) => void;
  partOptions: SelectOption[]; isPartsLoading: boolean;
  onFetchParts: () => void; onCreatePart: () => void;
  
  vendorIds: string[]; onVendorSelect: (value: string | string[]) => void;
  vendorOptions: SelectOption[]; isVendorsLoading: boolean;
  onFetchVendors: () => void; onCreateVendor: () => void;
  
  activeDropdown: string | null; setActiveDropdown: (name: string | null) => void;
  onPanelClick: (panel: 'time' | 'cost' | 'parts') => void;
  isEditMode: boolean;

  // ✅ NEW: Receive part usages to render the card
  partUsages?: any[]; 
}

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
  selectedPriority, onPriorityChange,
  qrCodeValue, onQrCodeChange,
  teamIds, onTeamSelect, teamOptions, isTeamsLoading, onFetchTeams, onCreateTeam,
  categoryIds, onCategorySelect, categoryOptions, isCategoriesLoading, onFetchCategories, onCreateCategory,
  partIds, onPartSelect, partOptions, isPartsLoading, onFetchParts, onCreatePart,
  vendorIds, onVendorSelect, vendorOptions, isVendorsLoading, onFetchVendors, onCreateVendor,
  activeDropdown, setActiveDropdown,
  onPanelClick, isEditMode,
  partUsages = [] // Default empty
}: Props) {
  
  const priorities = [
    { name: "None", color: "bg-blue-500", textColor: "text-white" },
    { name: "Low", color: "bg-green-500", textColor: "text-white" },
    { name: "Medium", color: "bg-orange-500", textColor: "text-white" },
    { name: "High", color: "bg-red-500", textColor: "text-white" },
  ];

  // Calculate total cost from the partUsages array
  const partsTotalCost = partUsages.reduce((sum, p) => {
    const cost = Number(p.totalCost) || (Number(p.unitCost || 0) * Number(p.quantity || 0));
    return sum + cost;
  }, 0);

  return (
    <>
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Priority</h3>
        <div className="flex w-full">
          {priorities.map((p) => (
            <button key={p.name} type="button" onClick={() => onPriorityChange(p.name)} className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${selectedPriority === p.name ? `${p.color} ${p.textColor} shadow-sm` : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}>{p.name}</button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Teams</h3>
        <DynamicSelect name="teams" placeholder="Select teams..." options={teamOptions} loading={isTeamsLoading} value={teamIds} onSelect={onTeamSelect} onFetch={onFetchTeams} ctaText="+ Create New Team" onCtaClick={onCreateTeam} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Categories</h3>
        <DynamicSelect name="categories" placeholder="Select categories..." options={categoryOptions} loading={isCategoriesLoading} value={categoryIds} onSelect={onCategorySelect} onFetch={onFetchCategories} ctaText="+ Create New Category" onCtaClick={onCreateCategory} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>
      
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Parts</h3>
        <DynamicSelect name="parts" placeholder="Select parts..." options={partOptions} loading={isPartsLoading} value={partIds} onSelect={onPartSelect} onFetch={onFetchParts} ctaText="+ Add New Part" onCtaClick={onCreatePart} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>
      
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Vendors</h3>
        <DynamicSelect name="vendors" placeholder="Select vendors..." options={vendorOptions} loading={isVendorsLoading} value={vendorIds} onSelect={onVendorSelect} onFetch={onFetchVendors} ctaText="+ Add New Vendor" onCtaClick={onCreateVendor} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>

      <div className="mt-6">
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
      </div>

      {isEditMode && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cost Tracking
          </h2>
          <div className="space-y-3">
            
            {/* ✅ CONDITIONALLY RENDER PARTS CARD IF PARTS EXIST */}
            {partUsages.length > 0 ? (
                <div 
                  onClick={() => onPanelClick('parts')}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-all group"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Wrench size={18} className="text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Parts Used</h3>
                      </div>
                      <span className="text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                  </div>

                  {/* Parts List */}
                  <div className="space-y-3 mb-3">
                      {partUsages.map((p: any, i: number) => (
                        <div key={p.id || i} className="flex justify-between items-start text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <div>
                              <div className="font-medium text-gray-800">{p.part?.name || "Unknown Part"}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin size={10} /> {p.location?.name || "Unknown Location"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-900 font-medium">x{p.quantity || 0}</div>
                              {/* Show cost if available */}
                              <div className="text-xs text-gray-500">
                                ${Number(p.totalCost || (Number(p.unitCost) * Number(p.quantity)) || 0).toFixed(2)}
                              </div>
                            </div>
                        </div>
                      ))}
                  </div>

                  {/* Footer Total */}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-gray-50 -mx-4 -mb-4 px-4 py-2 mt-2 rounded-b-lg">
                      <span className="text-sm font-medium text-gray-600">Total Parts Cost</span>
                      <span className="text-base font-bold text-gray-900">${partsTotalCost.toFixed(2)}</span>
                  </div>
                </div>
            ) : (
                // Default Button if no parts
                <TrackingButton
                  icon={Wrench}
                  label="Parts"
                  onClick={() => onPanelClick('parts')}
                />
            )}

            <TrackingButton
              icon={Clock}
              label="Time"
              onClick={() => onPanelClick('time')}
            />
            <TrackingButton
              icon={DollarSign}
              label="Other Costs"
              onClick={() => onPanelClick('cost')}
            />
          </div>
        </div>
      )}
    </>
  );
}