import { DynamicSelect, type SelectOption } from "../NewWorkOrderForm/DynamicSelect";
// ✅ ADD: Import Icons
import { Clock, DollarSign, Wrench } from "lucide-react";

interface Props {
  selectedPriority: string; onPriorityChange: (value: string) => void;
  qrCodeValue: string; onQrCodeChange: (value: string) => void;
  
  teamIds: string[]; onTeamSelect: (value: string | string[]) => void;
  teamOptions: SelectOption[]; isTeamsLoading: boolean;
  onFetchTeams: () => void; onCreateTeam: () => void;
  
  categoryIds: string[]; onCategorySelect: (value: string | string[]) => void;
  categoryOptions: SelectOption[]; isCategoriesLoading: boolean;
  onFetchCategories: () => void; onCreateCategory: () => void;

  // Added Props for Parts
  partIds: string[]; onPartSelect: (value: string | string[]) => void;
  partOptions: SelectOption[]; isPartsLoading: boolean;
  onFetchParts: () => void; onCreatePart: () => void;
  
  // Added Props for Vendors
  vendorIds: string[]; onVendorSelect: (value: string | string[]) => void;
  vendorOptions: SelectOption[]; isVendorsLoading: boolean;
  onFetchVendors: () => void; onCreateVendor: () => void;
  
  activeDropdown: string | null; setActiveDropdown: (name: string | null) => void;

  // ✅ ADD: Props for panel logic
  onPanelClick: (panel: 'time' | 'cost' | 'parts') => void;
  isEditMode: boolean;
}

// ✅ ADD: Helper component for tracking buttons
const TrackingButton = ({ icon: Icon, label, onClick }) => (
  <button
    type="button" // Prevent form submission
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
  qrCodeValue, onQrCodeChange, // Added missing props
  teamIds, onTeamSelect, teamOptions, isTeamsLoading, onFetchTeams, onCreateTeam, // Added missing props
  categoryIds, onCategorySelect, categoryOptions, isCategoriesLoading, onFetchCategories, onCreateCategory,
  partIds, onPartSelect, partOptions, isPartsLoading, onFetchParts, onCreatePart,
  vendorIds, onVendorSelect, vendorOptions, isVendorsLoading, onFetchVendors, onCreateVendor,
  activeDropdown, setActiveDropdown,
  onPanelClick, // ✅ ADD: Destructure
  isEditMode    // ✅ ADD: Destructure
}: Props) {
  const priorities = [
    { name: "None", color: "bg-blue-500", textColor: "text-white" },
    { name: "Low", color: "bg-green-500", textColor: "text-white" },
    { name: "Medium", color: "bg-orange-500", textColor: "text-white" },
    { name: "High", color: "bg-red-500", textColor: "text-white" },
  ];

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
      
      {/* ✅ ADD: Missing fields from your screenshot (Teams, QR Code) */}
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">QR Code/Barcode</h3>
        <input
          type="text"
          value={qrCodeValue}
          onChange={(e) => onQrCodeChange(e.target.value)}
          placeholder="Enter or scan code"
          className="w-full h-12 px-4 border border-gray-300 rounded-md text-sm bg-white"
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Teams in Charge</h3>
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

      {/* ✅ ADD: Cost Tracking section is now conditional */}
      {isEditMode && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cost Tracking
          </h2>
          <div className="space-y-3">
            <TrackingButton
              icon={Wrench}
              label="Parts"
              onClick={() => onPanelClick('parts')}
            />
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