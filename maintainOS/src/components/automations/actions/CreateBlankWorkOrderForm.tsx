import { useState, useEffect } from "react";
import { Settings, Trash2, ChevronDown, X, Plus } from "lucide-react";
import { DynamicSelect, type SelectOption } from "../../work-orders/NewWorkOrderForm/DynamicSelect";
import { fetchFilterData } from "../../utils/filterDataFetcher";

export interface WorkOrderActionData {
  title: string;
  description: string;
  assetId: string;
  categoryId?: string;
  locationId?: string;
  priority?: "high" | "medium" | "low";
  estimatedTimeHours?: number;
  vendorIds?: string[];
  procedureIds?: string[];
  partIds?: string[];
  assigneeUserIds: string[];
  assigneeTeamIds: string[];
  onlyIfPreviousClosed: boolean;
}

interface CreateBlankWorkOrderFormProps {
  onBack: () => void;
  onChange?: (data: WorkOrderActionData) => void;
  initialData?: WorkOrderActionData | null;
}

// Priority options
const PRIORITY_OPTIONS = [
  { id: "high", name: "High" },
  { id: "medium", name: "Medium" },
  { id: "low", name: "Low" },
];

export function CreateBlankWorkOrderForm({ onBack, onChange, initialData }: CreateBlankWorkOrderFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [selectedAssetId, setSelectedAssetId] = useState(initialData?.assetId || "{{asset.id}}");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId || "");
  const [selectedLocationId, setSelectedLocationId] = useState(initialData?.locationId || "");
  const [selectedPriority, setSelectedPriority] = useState<"high" | "medium" | "low" | "none">(initialData?.priority || "none");
  const [estimatedTime, setEstimatedTime] = useState(initialData?.estimatedTimeHours?.toString() || "");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(initialData?.assigneeUserIds || []);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(initialData?.assigneeTeamIds || []);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>(initialData?.vendorIds || []);
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>(initialData?.procedureIds || []);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>(initialData?.partIds || []);
  const [onlyIfPreviousClosed, setOnlyIfPreviousClosed] = useState(initialData?.onlyIfPreviousClosed ?? true);

  // Dynamic dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([]);
  const [teamOptions, setTeamOptions] = useState<{ id: string; name: string }[]>([]);
  const [vendorOptions, setVendorOptions] = useState<{ id: string; name: string }[]>([]);
  const [procedureOptions, setProcedureOptions] = useState<{ id: string; name: string }[]>([]);
  const [partOptions, setPartOptions] = useState<{ id: string; name: string }[]>([]);
  
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isTeamsLoading, setIsTeamsLoading] = useState(false);
  const [isVendorsLoading, setIsVendorsLoading] = useState(false);
  const [isProceduresLoading, setIsProceduresLoading] = useState(false);
  const [isPartsLoading, setIsPartsLoading] = useState(false);
  
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [procedureDropdownOpen, setProcedureDropdownOpen] = useState(false);
  const [partDropdownOpen, setPartDropdownOpen] = useState(false);
  
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [procedureSearchQuery, setProcedureSearchQuery] = useState("");
  const [partSearchQuery, setPartSearchQuery] = useState("");

  // Fetch assets
  const handleFetchAssets = async () => {
    try {
      setIsAssetsLoading(true);
      const { data } = await fetchFilterData("assets");
      const normalized = Array.isArray(data)
        ? data.map((d: any) => ({
            id: d.id,
            name: d.name || "Unknown Asset",
          }))
        : [];
      setAssetOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setIsAssetsLoading(false);
    }
  };

  // Fetch users
  const handleFetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      const { data } = await fetchFilterData("users");
      const normalized = Array.isArray(data)
        ? data.map((u: any) => ({
            id: u.id,
            name: u.fullName || u.name || "Unnamed User",
          }))
        : [];
      setUserOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  // Fetch categories
  const handleFetchCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const { data } = await fetchFilterData("categories");
      const normalized = Array.isArray(data)
        ? data.map((c: any) => ({
            id: c.id,
            name: c.name || "Unnamed Category",
          }))
        : [];
      setCategoryOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  // Fetch locations
  const handleFetchLocations = async () => {
    try {
      setIsLocationsLoading(true);
      const { data } = await fetchFilterData("locations");
      const normalized = Array.isArray(data)
        ? data.map((l: any) => ({
            id: l.id,
            name: l.name || "Unnamed Location",
          }))
        : [];
      setLocationOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setIsLocationsLoading(false);
    }
  };

  // Fetch teams
  const handleFetchTeams = async () => {
    try {
      setIsTeamsLoading(true);
      const { data } = await fetchFilterData("teams");
      const normalized = Array.isArray(data)
        ? data.map((t: any) => ({
            id: t.id,
            name: t.name || "Unnamed Team",
          }))
        : [];
      setTeamOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setIsTeamsLoading(false);
    }
  };

  // Fetch vendors
  const handleFetchVendors = async () => {
    try {
      setIsVendorsLoading(true);
      const { data } = await fetchFilterData("vendors");
      const normalized = Array.isArray(data)
        ? data.map((v: any) => ({
            id: v.id,
            name: v.name || "Unnamed Vendor",
          }))
        : [];
      setVendorOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setIsVendorsLoading(false);
    }
  };

  // Fetch procedures
  const handleFetchProcedures = async () => {
    try {
      setIsProceduresLoading(true);
      const { data } = await fetchFilterData("procedures");
      const normalized = Array.isArray(data)
        ? data.map((p: any) => ({
            id: p.id,
            name: p.name || p.title || "Unnamed Procedure",
          }))
        : [];
      setProcedureOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch procedures:", error);
    } finally {
      setIsProceduresLoading(false);
    }
  };

  // Fetch parts
  const handleFetchParts = async () => {
    try {
      setIsPartsLoading(true);
      const { data } = await fetchFilterData("parts");
      const normalized = Array.isArray(data)
        ? data.map((p: any) => ({
            id: p.id,
            name: p.name || "Unnamed Part",
          }))
        : [];
      setPartOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    } finally {
      setIsPartsLoading(false);
    }
  };

  // Fetch users when dropdown opens
  useEffect(() => {
    if (userDropdownOpen && userOptions.length === 0) {
      handleFetchUsers();
    }
  }, [userDropdownOpen]);

  // Fetch teams when dropdown opens
  useEffect(() => {
    if (teamDropdownOpen && teamOptions.length === 0) {
      handleFetchTeams();
    }
  }, [teamDropdownOpen]);

  // Fetch vendors when dropdown opens
  useEffect(() => {
    if (vendorDropdownOpen && vendorOptions.length === 0) {
      handleFetchVendors();
    }
  }, [vendorDropdownOpen]);

  // Fetch procedures when dropdown opens
  useEffect(() => {
    if (procedureDropdownOpen && procedureOptions.length === 0) {
      handleFetchProcedures();
    }
  }, [procedureDropdownOpen]);

  // Fetch parts when dropdown opens
  useEffect(() => {
    if (partDropdownOpen && partOptions.length === 0) {
      handleFetchParts();
    }
  }, [partDropdownOpen]);

  // Fetch data for fields with initial values (for edit mode)
  useEffect(() => {
    if (initialData) {
      if (initialData.assigneeUserIds && initialData.assigneeUserIds.length > 0 && userOptions.length === 0) {
        handleFetchUsers();
      }
      if (initialData.assigneeTeamIds && initialData.assigneeTeamIds.length > 0 && teamOptions.length === 0) {
        handleFetchTeams();
      }
      if (initialData.vendorIds && initialData.vendorIds.length > 0 && vendorOptions.length === 0) {
        handleFetchVendors();
      }
      if (initialData.procedureIds && initialData.procedureIds.length > 0 && procedureOptions.length === 0) {
        handleFetchProcedures();
      }
      if (initialData.partIds && initialData.partIds.length > 0 && partOptions.length === 0) {
        handleFetchParts();
      }
    }
  }, [initialData]);

  // Notify parent of data changes
  useEffect(() => {
    if (onChange) {
      onChange({
        title,
        description,
        assetId: selectedAssetId,
        categoryId: selectedCategoryId || undefined,
        locationId: selectedLocationId || undefined,
        priority: selectedPriority !== "none" ? selectedPriority : undefined,
        estimatedTimeHours: estimatedTime ? parseFloat(estimatedTime) : undefined,
        vendorIds: selectedVendorIds.length > 0 ? selectedVendorIds : undefined,
        procedureIds: selectedProcedureIds.length > 0 ? selectedProcedureIds : undefined,
        partIds: selectedPartIds.length > 0 ? selectedPartIds : undefined,
        assigneeUserIds: selectedUserIds,
        assigneeTeamIds: selectedTeamIds.length > 0 ? selectedTeamIds : [],
        onlyIfPreviousClosed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, selectedAssetId, selectedCategoryId, selectedLocationId, selectedPriority, estimatedTime, selectedUserIds, selectedTeamIds, selectedVendorIds, selectedProcedureIds, selectedPartIds, onlyIfPreviousClosed]);

  // Toggle user selection
  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = userOptions.find((u) => u.id === userId);
    return user ? user.name : "Unknown";
  };

  // Filter users based on search query
  const filteredUsers = userOptions.filter((u) =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Toggle team selection
  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  // Get team name by ID
  const getTeamName = (teamId: string) => {
    const team = teamOptions.find((t) => t.id === teamId);
    return team ? team.name : "Unknown";
  };

  // Filter teams based on search query
  const filteredTeams = teamOptions.filter((t) =>
    t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  // Toggle vendor selection
  const toggleVendor = (vendorId: string) => {
    setSelectedVendorIds((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  // Get vendor name by ID
  const getVendorName = (vendorId: string) => {
    const vendor = vendorOptions.find((v) => v.id === vendorId);
    return vendor ? vendor.name : "Unknown";
  };

  // Filter vendors based on search query
  const filteredVendors = vendorOptions.filter((v) =>
    v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase())
  );

  // Toggle procedure selection
  const toggleProcedure = (procedureId: string) => {
    setSelectedProcedureIds((prev) =>
      prev.includes(procedureId) ? prev.filter((id) => id !== procedureId) : [...prev, procedureId]
    );
  };

  // Get procedure name by ID
  const getProcedureName = (procedureId: string) => {
    const procedure = procedureOptions.find((p) => p.id === procedureId);
    return procedure ? procedure.name : "Unknown";
  };

  // Filter procedures based on search query
  const filteredProcedures = procedureOptions.filter((p) =>
    p.name.toLowerCase().includes(procedureSearchQuery.toLowerCase())
  );

  // Toggle part selection
  const togglePart = (partId: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(partId) ? prev.filter((id) => id !== partId) : [...prev, partId]
    );
  };

  // Get part name by ID
  const getPartName = (partId: string) => {
    const part = partOptions.find((p) => p.id === partId);
    return part ? part.name : "Unknown";
  };

  // Filter parts based on search query
  const filteredParts = partOptions.filter((p) =>
    p.name.toLowerCase().includes(partSearchQuery.toLowerCase())
  );

  // Reusable multi-select component
  const MultiSelectDropdown = ({
    label,
    selectedIds,
    isLoading,
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    filteredOptions,
    toggleItem,
    getItemName,
    placeholder,
  }: {
    label: string;
    selectedIds: string[];
    options: { id: string; name: string }[];
    isLoading: boolean;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredOptions: { id: string; name: string }[];
    toggleItem: (id: string) => void;
    getItemName: (id: string) => string;
    placeholder: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-2 min-h-[44px] cursor-pointer"
        >
          {selectedIds.map((id) => (
            <span
              key={id}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-800 text-sm pl-2 pr-2 py-1 rounded-sm"
            >
              <span className="text-sm font-medium">{getItemName(id)}</span>
              <X
                className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(id);
                }}
              />
            </span>
          ))}
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={selectedIds.length === 0 ? placeholder : ""}
            className="flex-1 border-0 outline-none text-sm py-1 px-1 min-w-[150px]"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          />
          <ChevronDown
            className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide bg-gray-50 border-b">
              {label}
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "200px", scrollbarWidth: "thin" }}>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No items found</div>
              ) : (
                filteredOptions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                      selectedIds.includes(item.id) ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-sm font-medium text-gray-900">{item.name}</span>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      readOnly
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="border rounded-md shadow bg-white mb-6">
      {/* Header */}
      <div className="bg-blue-50 px-6 py-4 flex items-center justify-between rounded-t-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800 text-lg leading-none">
            ←
          </button>
          <h3 className="text-base font-semibold text-gray-900">Create from blank</h3>
        </div>
        <div className="flex items-center gap-10 pr-2">
          <button className="text-gray-600 hover:text-gray-800">
            <Settings className="h-5 w-5" />
          </button>
          <button className="text-red-600 hover:text-red-800">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Work Order Title <span className="text-red-500">(Required)</span>
            </label>
            <input
              type="text"
              placeholder="Enter title for the work order"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
            <textarea
              placeholder="Enter description for the work order"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
            <DynamicSelect
              name="work-order-category"
              placeholder="Select category"
              options={categoryOptions}
              loading={isCategoriesLoading}
              value={selectedCategoryId}
              onSelect={(val) => setSelectedCategoryId(typeof val === "string" ? val : val[0] || "")}
              onFetch={handleFetchCategories}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </div>

          {/* Priority */}
          <div className="mt-6">
            <h3 className="mb-4 text-base font-medium text-gray-900">Priority</h3>
            <div className="flex w-full gap-2">
              {[
                { name: "none", label: "None", color: "bg-blue-500", textColor: "text-white" },
                { name: "low", label: "Low", color: "bg-green-500", textColor: "text-white" },
                { name: "medium", label: "Medium", color: "bg-orange-500", textColor: "text-white" },
                { name: "high", label: "High", color: "bg-red-500", textColor: "text-white" },
              ].map((priority) => (
                <button
                  key={priority.name}
                  type="button"
                  onClick={() => setSelectedPriority(priority.name as any)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90 rounded ${
                    selectedPriority === priority.name
                      ? `${priority.color} ${priority.textColor} shadow-sm`
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Asset */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
              <DynamicSelect
                name="work-order-location"
                placeholder="Select location"
                options={locationOptions}
                loading={isLocationsLoading}
                value={selectedLocationId}
                onSelect={(val) => setSelectedLocationId(typeof val === "string" ? val : val[0] || "")}
                onFetch={handleFetchLocations}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Asset</label>
              <DynamicSelect
                name="work-order-asset"
                placeholder="Select asset"
                options={assetOptions}
                loading={isAssetsLoading}
                value={selectedAssetId}
                onSelect={(val) => setSelectedAssetId(typeof val === "string" ? val : val[0] || "")}
                onFetch={handleFetchAssets}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            </div>
          </div>
        </div>

        {/* Time Estimation */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Estimated Time (Hours)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Enter estimated hours"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
            />
          </div>
        </div>

        {/* Procedure */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Procedure</h2>
          <div className="flex justify-center items-center gap-3 mb-6">
            <svg
              className="w-5 h-5 text-blue-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-base text-gray-600">
              Create or attach new Form, Procedure or Checklist
            </span>
          </div>
          <div className="flex justify-center items-center">
            <button
              type="button"
              onClick={() => setProcedureDropdownOpen(!procedureDropdownOpen)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-orange-600 border border-orange-600 rounded-sm hover:bg-orange-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Procedure
            </button>
          </div>
          
          {/* Show selected procedures */}
          {selectedProcedureIds.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedProcedureIds.map((id) => (
                <span
                  key={id}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-800 text-sm pl-3 pr-2 py-1.5 rounded-sm"
                >
                  <span className="text-sm font-medium">{getProcedureName(id)}</span>
                  <X
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => toggleProcedure(id)}
                  />
                </span>
              ))}
            </div>
          )}
          
          {/* Procedure dropdown */}
          {procedureDropdownOpen && (
            <div className="mt-4 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide bg-gray-50 border-b">
                Select Procedures
              </div>
              <div className="p-3">
                <input
                  value={procedureSearchQuery}
                  onChange={(e) => setProcedureSearchQuery(e.target.value)}
                  placeholder="Search procedures..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
                />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "200px", scrollbarWidth: "thin" }}>
                {isProceduresLoading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                ) : filteredProcedures.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No procedures found</div>
                ) : (
                  filteredProcedures.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleProcedure(item.id)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                        selectedProcedureIds.includes(item.id) ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex-1 text-sm font-medium text-gray-900">{item.name}</span>
                      <input
                        type="checkbox"
                        checked={selectedProcedureIds.includes(item.id)}
                        readOnly
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <MultiSelectDropdown
            label="Vendors"
            selectedIds={selectedVendorIds}
            options={vendorOptions}
            isLoading={isVendorsLoading}
            isOpen={vendorDropdownOpen}
            setIsOpen={setVendorDropdownOpen}
            searchQuery={vendorSearchQuery}
            setSearchQuery={setVendorSearchQuery}
            filteredOptions={filteredVendors}
            toggleItem={toggleVendor}
            getItemName={getVendorName}
            placeholder="Select vendors"
          />

          <MultiSelectDropdown
            label="Parts"
            selectedIds={selectedPartIds}
            options={partOptions}
            isLoading={isPartsLoading}
            isOpen={partDropdownOpen}
            setIsOpen={setPartDropdownOpen}
            searchQuery={partSearchQuery}
            setSearchQuery={setPartSearchQuery}
            filteredOptions={filteredParts}
            toggleItem={togglePart}
            getItemName={getPartName}
            placeholder="Select parts"
          />
        </div>

        {/* Assignment */}
        <div className="space-y-4">
          
          <MultiSelectDropdown
            label="Assign to Users"
            selectedIds={selectedUserIds}
            options={userOptions}
            isLoading={isUsersLoading}
            isOpen={userDropdownOpen}
            setIsOpen={setUserDropdownOpen}
            searchQuery={userSearchQuery}
            setSearchQuery={setUserSearchQuery}
            filteredOptions={filteredUsers}
            toggleItem={toggleUser}
            getItemName={getUserName}
            placeholder="Type name or email address"
          />

          <MultiSelectDropdown
            label="Assign to Teams"
            selectedIds={selectedTeamIds}
            options={teamOptions}
            isLoading={isTeamsLoading}
            isOpen={teamDropdownOpen}
            setIsOpen={setTeamDropdownOpen}
            searchQuery={teamSearchQuery}
            setSearchQuery={setTeamSearchQuery}
            filteredOptions={filteredTeams}
            toggleItem={toggleTeam}
            getItemName={getTeamName}
            placeholder="Select teams"
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="createOnlyIfClosed"
              className="h-4 w-4 border-gray-300 rounded text-blue-600"
              checked={onlyIfPreviousClosed}
              onChange={(e) => setOnlyIfPreviousClosed(e.target.checked)}
            />
            <label htmlFor="createOnlyIfClosed" className="text-sm text-gray-700 cursor-pointer">
              Create only if previous Work Order generated from Automation is closed
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
