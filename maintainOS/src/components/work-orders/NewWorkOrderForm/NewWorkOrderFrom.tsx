"use client";

import { useState } from "react";
import { WorkOrderDetails } from "./WorkOrderDetails";
import { AssetsAndProcedures } from "./AssetsAndProcedures";
import { AssignmentAndScheduling } from "./AssignmentAndScheduling";
import { WorkOrderClassificationAndLinks } from "./WorkOrderClassificationAndLinks";
import { type SelectOption } from "../NewWorkOrderForm/DynamicSelect";

// --- MOCK DATA ---
const mockLocations: SelectOption[] = [{ id: 'loc-1', name: 'Main Building' }, { id: 'loc-2', name: 'Warehouse A' }];
const mockAssets: SelectOption[] = [{ id: 'asset-1', name: 'HVAC-001' }, { id: 'asset-2', name: 'Pump-003' }];
const mockTeams: SelectOption[] = [{ id: 'team-1', name: 'Maintenance' }, { id: 'team-2', name: 'Electrical' }];
const mockCategories: SelectOption[] = [{ id: 'cat-1', name: 'Inspection' }, { id: 'cat-2', name: 'Repair' }];
const mockParts: SelectOption[] = [{ id: 'part-1', name: 'Filter X-100' }, { id: 'part-2', name: 'Sealant G-5' }];
const mockVendors: SelectOption[] = [{ id: 'ven-1', name: 'Global Supplies Inc.' }, { id: 'ven-2', name: 'Local Hardware Co.' }];

const api = {
    getLocations: () => new Promise<SelectOption[]>(res => setTimeout(() => res(mockLocations), 1000)),
    getAssets: () => new Promise<SelectOption[]>(res => setTimeout(() => res(mockAssets), 1000)),
    getTeams: () => new Promise<SelectOption[]>(res => setTimeout(() => res(mockTeams), 1000)),
    getCategories: () => new Promise<SelectOption[]>(res => setTimeout(() => res(mockCategories), 1000)),
    getParts: () => new Promise<SelectOption[]>(res => setTimeout(() => res(mockParts), 1000)),
    getVendors: () => new Promise<SelectOption[]>(res => setTimeout(() => res(mockVendors), 1000)),
};

interface NewWorkOrderFormProps { onCreate: () => void; }

export function NewWorkOrderForm({ onCreate }: NewWorkOrderFormProps) {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [locationId, setLocationId] = useState('');
    const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
    const [isLocationsLoading, setLocationsLoading] = useState(false);
    const [assetIds, setAssetIds] = useState<string[]>([]);
    const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
    const [isAssetsLoading, setAssetsLoading] = useState(false);
    const [teamIds, setTeamIds] = useState<string[]>([]);
    const [teamOptions, setTeamOptions] = useState<SelectOption[]>([]);
    const [isTeamsLoading, setTeamsLoading] = useState(false);
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
    const [isCategoriesLoading, setCategoriesLoading] = useState(false);

    const [partIds, setPartIds] = useState<string[]>([]);
    const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
    const [isPartsLoading, setPartsLoading] = useState(false);
    const [vendorIds, setVendorIds] = useState<string[]>([]);
    const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);
    const [isVendorsLoading, setVendorsLoading] = useState(false);

    const handleFetchLocations = async () => { setLocationsLoading(true); const data = await api.getLocations(); setLocationOptions(data); setLocationsLoading(false); };
    const handleCreateLocation = () => alert("Open 'Create Location' Modal...");
    const handleFetchAssets = async () => { setAssetsLoading(true); const data = await api.getAssets(); setAssetOptions(data); setAssetsLoading(false); };
    const handleCreateAsset = () => alert("Open 'Create Asset' Modal...");
    const handleFetchTeams = async () => { setTeamsLoading(true); const data = await api.getTeams(); setTeamOptions(data); setTeamsLoading(false); };
    const handleCreateTeam = () => alert("Open 'Create Team' Modal...");
    const handleFetchCategories = async () => { setCategoriesLoading(true); const data = await api.getCategories(); setCategoryOptions(data); setCategoriesLoading(false); };
    const handleCreateCategory = () => alert("Open 'Create Category' Modal...");
    const handleFetchParts = async () => { setPartsLoading(true); const data = await api.getParts(); setPartOptions(data); setPartsLoading(false); };
    const handleCreatePart = () => alert("Open 'Create Part' Modal...");
    const handleFetchVendors = async () => { setVendorsLoading(true); const data = await api.getVendors(); setVendorOptions(data); setVendorsLoading(false); };
    const handleCreateVendor = () => alert("Open 'Create Vendor' Modal...");

    const [workOrderName, setWorkOrderName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [selectedWorkType, setSelectedWorkType] = useState("Reactive");
    const [selectedPriority, setSelectedPriority] = useState("None");
    const [qrCodeValue, setQrCodeValue] = useState("");

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border">
            <div className="flex-none border-b px-6 py-4"><h2 className="text-xl font-semibold">New Work Order</h2></div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <WorkOrderDetails
                    name={workOrderName} onNameChange={setWorkOrderName}
                    description={description} onDescriptionChange={setDescription}
                    locationId={locationId} onLocationSelect={(val) => setLocationId(val as string)}
                    locationOptions={locationOptions} isLocationsLoading={isLocationsLoading}
                    onFetchLocations={handleFetchLocations} onCreateLocation={handleCreateLocation}
                    activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
                />
                <AssetsAndProcedures
                    assetIds={assetIds} onAssetSelect={(val) => setAssetIds(val as string[])}
                    assetOptions={assetOptions} isAssetsLoading={isAssetsLoading}
                    onFetchAssets={handleFetchAssets} onCreateAsset={handleCreateAsset}
                    activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
                />
                <AssignmentAndScheduling
                    selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers}
                    dueDate={dueDate} setDueDate={setDueDate}
                    startDate={startDate} setStartDate={setStartDate}
                    selectedWorkType={selectedWorkType} setSelectedWorkType={setSelectedWorkType}
                    onOpenInviteModal={() => alert("Open Invite Modal...")}
                />
                <WorkOrderClassificationAndLinks
                    selectedPriority={selectedPriority} onPriorityChange={setSelectedPriority}
                    qrCodeValue={qrCodeValue} onQrCodeChange={setQrCodeValue}
                    teamIds={teamIds} onTeamSelect={(val) => setTeamIds(val as string[])}
                    teamOptions={teamOptions} isTeamsLoading={isTeamsLoading}
                    onFetchTeams={handleFetchTeams} onCreateTeam={handleCreateTeam}
                    categoryIds={categoryIds} onCategorySelect={(val) => setCategoryIds(val as string[])}
                    categoryOptions={categoryOptions} isCategoriesLoading={isCategoriesLoading}
                    onFetchCategories={handleFetchCategories} onCreateCategory={handleCreateCategory}
                    partIds={partIds} onPartSelect={(val) => setPartIds(val as string[])}
                    partOptions={partOptions} isPartsLoading={isPartsLoading}
                    onFetchParts={handleFetchParts} onCreatePart={handleCreatePart}
                    vendorIds={vendorIds} onVendorSelect={(val) => setVendorIds(val as string[])}
                    vendorOptions={vendorOptions} isVendorsLoading={isVendorsLoading}
                    onFetchVendors={handleFetchVendors} onCreateVendor={handleCreateVendor}
                    activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
                />
            </div>
            <div className="sticky bottom-0 flex items-center border-t bg-white px-6 py-4">
                {/* FIXED: The button style has been improved */}
                <button
                    onClick={onCreate}
                    className="ml-auto h-10 w-20 transform rounded-md bg-orange-600 px-10 text-sm font-medium text-white shadow-md transition-all duration-200 ease-in-out hover:bg-orange-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:bg-orange-800 active:translate-y-0 active:shadow-md"
                >
                    Create
                </button>
            </div>
        </div>
    );
}