import { DynamicSelect, type SelectOption } from "../NewWorkOrderForm/DynamicSelect";

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
}

export function WorkOrderClassificationAndLinks({
  selectedPriority, onPriorityChange,
  categoryIds, onCategorySelect, categoryOptions, isCategoriesLoading, onFetchCategories, onCreateCategory,
  partIds, onPartSelect, partOptions, isPartsLoading, onFetchParts, onCreatePart, // Destructure new props
  vendorIds, onVendorSelect, vendorOptions, isVendorsLoading, onFetchVendors, onCreateVendor, // Destructure new props
  activeDropdown, setActiveDropdown
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
            <button key={p.name} onClick={() => onPriorityChange(p.name)} className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-all ${selectedPriority === p.name ? `${p.color} ${p.textColor} shadow-sm` : "text-gray-700 bg-gray-100 hover:bg-gray-200"}`}>{p.name}</button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Categories</h3>
        <DynamicSelect name="categories" placeholder="Select categories..." options={categoryOptions} loading={isCategoriesLoading} value={categoryIds} onSelect={onCategorySelect} onFetch={onFetchCategories} ctaText="+ Create New Category" onCtaClick={onCreateCategory} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Parts</h3>
        {/* Correctly wired up for Parts */}
        <DynamicSelect name="parts" placeholder="Select parts..." options={partOptions} loading={isPartsLoading} value={partIds} onSelect={onPartSelect} onFetch={onFetchParts} ctaText="+ Add New Part" onCtaClick={onCreatePart} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>
      <div className="mt-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">Vendors</h3>
        {/* Correctly wired up for Vendors */}
        <DynamicSelect name="vendors" placeholder="Select vendors..." options={vendorOptions} loading={isVendorsLoading} value={vendorIds} onSelect={onVendorSelect} onFetch={onFetchVendors} ctaText="+ Add New Vendor" onCtaClick={onCreateVendor} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>
    </>
  );
}