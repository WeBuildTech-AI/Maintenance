import { useState, useEffect } from "react";
import { Settings, Trash2, ChevronDown, X } from "lucide-react";
import { DynamicSelect, type SelectOption } from "../../work-orders/NewWorkOrderForm/DynamicSelect";
import { fetchFilterData } from "../../utils/filterDataFetcher";

export interface WorkOrderActionData {
  title: string;
  description: string;
  assetId: string;
  assigneeUserIds: string[];
  assigneeTeamIds: string[];
  onlyIfPreviousClosed: boolean;
}

interface CreateBlankWorkOrderFormProps {
  onBack: () => void;
  onChange?: (data: WorkOrderActionData) => void;
  initialData?: WorkOrderActionData | null;
}

export function CreateBlankWorkOrderForm({ onBack, onChange, initialData }: CreateBlankWorkOrderFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [selectedAssetId, setSelectedAssetId] = useState(initialData?.assetId || "{{asset.id}}");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(initialData?.assigneeUserIds || []);
  const [onlyIfPreviousClosed, setOnlyIfPreviousClosed] = useState(initialData?.onlyIfPreviousClosed ?? true);

  // Dynamic dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
  const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

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

  // Fetch users when dropdown opens
  useEffect(() => {
    if (userDropdownOpen && userOptions.length === 0) {
      handleFetchUsers();
    }
  }, [userDropdownOpen]);

  // Notify parent of data changes
  useEffect(() => {
    if (onChange) {
      onChange({
        title,
        description,
        assetId: selectedAssetId,
        assigneeUserIds: selectedUserIds,
        assigneeTeamIds: [],
        onlyIfPreviousClosed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, selectedAssetId, selectedUserIds, onlyIfPreviousClosed]);

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

        {/* Asset Dropdown */}
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

        {/* Users Multi-Select Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Assign to</label>
          <div className="relative">
            <div
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-2 min-h-[44px] cursor-pointer"
            >
              {selectedUserIds.map((id) => (
                <span
                  key={id}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-800 text-sm pl-1 pr-2 py-1 rounded-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-300 text-white flex items-center justify-center text-xs font-semibold">
                    {getUserName(id).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{getUserName(id)}</span>
                  <X
                    className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUser(id);
                    }}
                  />
                </span>
              ))}
              <input
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder={selectedUserIds.length === 0 ? "Type name or email address" : ""}
                className="flex-1 border-0 outline-none text-sm py-1 px-1 min-w-[150px]"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserDropdownOpen(true);
                }}
              />
              <ChevronDown
                className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${
                  userDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {userDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 tracking-wide bg-gray-50 border-b">
                  Users
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: "200px", scrollbarWidth: "thin" }}>
                  {isUsersLoading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
                  ) : (
                    filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => toggleUser(u.id)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                          selectedUserIds.includes(u.id) ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-900">{u.name}</span>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(u.id)}
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
  );
}
