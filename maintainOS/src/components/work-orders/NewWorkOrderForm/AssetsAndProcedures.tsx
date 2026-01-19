import { useState, useEffect } from "react";
import { Plus, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";
import AddAssetsModal from "../WorkloadView/Modal/AddAssetsModal";
import AddProcedureModal from "../WorkloadView/Modal/AddProcedureModal";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Clock } from "lucide-react";
import { 
  safeParseDate, getTimeString, getDisplayDate, constructSecureISO, TimePickerInput 
} from "./AssignmentAndScheduling";
import { useRef } from "react";

interface Props {
  assetIds: string[];
  onAssetSelect: (value: string | string[]) => void;
  assetOptions: SelectOption[];
  isAssetsLoading: boolean;
  onFetchAssets: () => void;
  onCreateAsset: () => void;
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
  
  onAssetSearch?: (query: string) => void;

  assetStatus?: string;
  setAssetStatus?: (value: string) => void;

  linkedProcedure: any | null;
  onRemoveProcedure: () => void;
  onPreviewProcedure: () => void;
  onOpenProcedureModal: () => void;
  setLinkedProcedure: (p: any) => void;
  onEditProcedure?: () => void;

  assetDowntimeType?: string;
  setAssetDowntimeType?: (value: string) => void;
  assetStatusNotes?: string;
  setAssetStatusNotes?: (value: string) => void;
  assetStatusSince?: string;
  setAssetStatusSince?: (value: string) => void;
  assetStatusTo?: string;
  setAssetStatusTo?: (value: string) => void;
}

// ✅ Options defined outside to prevent re-renders
const ASSET_STATUS_OPTIONS = [
  { id: "Online", name: "Online" },
  { id: "Offline", name: "Offline" },
];

export function AssetsAndProcedures({
  assetIds,
  onAssetSelect,
  assetOptions,
  isAssetsLoading,
  onFetchAssets,
  onCreateAsset,
  activeDropdown,
  setActiveDropdown,
  onAssetSearch,

  assetStatus,
  setAssetStatus,

  linkedProcedure,
  onRemoveProcedure,
  onPreviewProcedure,
  onOpenProcedureModal,
  setLinkedProcedure,
  
  onEditProcedure,
  
  assetDowntimeType, setAssetDowntimeType,
  assetStatusNotes, setAssetStatusNotes,
  assetStatusSince, setAssetStatusSince,
  assetStatusTo, setAssetStatusTo
}: Props) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  
  // Date Picker States
  const [showSinceCalendar, setShowSinceCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const sinceRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Close calendars on click outside
  useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
          if (sinceRef.current && !sinceRef.current.contains(e.target as Node)) setShowSinceCalendar(false);
          if (toRef.current && !toRef.current.contains(e.target as Node)) setShowToCalendar(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Time Input toggles (auto-show if time exists or user clicks add)
  const [showSinceTime, setShowSinceTime] = useState(!!assetStatusSince && assetStatusSince.includes("T"));
  const [showToTime, setShowToTime] = useState(!!assetStatusTo && assetStatusTo.includes("T"));

  useEffect(() => {
     if (assetStatusSince && assetStatusSince.includes("T") && !showSinceTime) setShowSinceTime(true);
  }, [assetStatusSince]);

  useEffect(() => {
     if (assetStatusTo && assetStatusTo.includes("T") && !showToTime) setShowToTime(true);
  }, [assetStatusTo]);

  // ✅ Local state to ensure immediate UI updates for Asset Status
  const [internalAssetStatus, setInternalAssetStatus] = useState(assetStatus || "");
  const [hasInteracted, setHasInteracted] = useState(false);

  // ✅ Sync local state if parent prop changes
  useEffect(() => {
    if (assetStatus !== undefined) {
      setInternalAssetStatus(assetStatus);
    }
  }, [assetStatus]);

  const handleAddAssets = (selected: { id: string; name: string }[]) => {
    const newIds = selected.map((a) => a.id);
    const uniqueIds = Array.from(new Set([...assetIds, ...newIds]));
    onAssetSelect(uniqueIds);
  };

  const handleOpenAssetModal = () => {
    setIsModalOpen(true);
    // ✅ Fetch latest assets from API when opening the modal
    onFetchAssets(); 
  };

  return (
    <>
      <div className="mt-8 relative z-20"> {/* Parent container z-index context */}
        
        {/* Flex container for Asset & Asset Status */}
        <div className="flex gap-4 items-start w-full relative">
          
          {/* Left: Asset Selection */}
          <div className={`flex-1 min-w-0 relative ${activeDropdown === 'assets' ? 'z-50' : 'z-20'}`}>
            <h3 className="mb-4 text-base font-medium text-gray-900">Asset</h3>
            <DynamicSelect
              name="assets"
              placeholder="Start typing..."
              options={assetOptions}
              loading={isAssetsLoading}
              value={assetIds}
              onSelect={(val) => {
                 onAssetSelect(val);
                 // Reset status if all assets are removed
                 if (Array.isArray(val) && val.length === 0) {
                   setInternalAssetStatus(""); // Clear local
                   setHasInteracted(true);
                   if (setAssetStatus) setAssetStatus(""); // Clear parent
                 }
              }}
              onFetch={onFetchAssets}
              onSearch={onAssetSearch}
              ctaText="+ Create New Asset"
              onCtaClick={onCreateAsset}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              className="w-full"
            />
          </div>

          {/* Right: Asset Status (Conditional) */}
          {assetIds.length > 0 && (
            <div className={`w-[200px] flex-shrink-0 relative ${activeDropdown === 'asset-status' ? 'z-50' : 'z-20'}`}>
              <h3 className="mb-4 text-base font-medium text-gray-900">Asset Status</h3>
              <DynamicSelect
                name="asset-status"
                placeholder="Select status..."
                options={ASSET_STATUS_OPTIONS}
                loading={false}
                value={internalAssetStatus} // ✅ Use local state
                onSelect={(val) => {
                  const newVal = val as string;
                  setInternalAssetStatus(newVal); // ✅ Update local immediately
                  setHasInteracted(true); // ✅ Mark as interacted to show detailed view
                  if (setAssetStatus) setAssetStatus(newVal); // Update parent
                }}
                onFetch={() => {}} 
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* 🔻 EXTENDED ASSET STATUS FIELDS (Detailed Breakdown) */}
        {/* Only show if status is selected AND user has interacted (or it's a new selection) OR explicit request to view details (affordance could be added later) */}
        {internalAssetStatus && internalAssetStatus !== "" && hasInteracted && (
           <div className={`mt-6 p-6 rounded-xl shadow-sm border animate-in fade-in slide-in-from-top-2 ${
               internalAssetStatus === 'Offline' ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/50 border-gray-100'
           }`}>
             <div className="flex items-center gap-2 mb-6">
                <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                    internalAssetStatus === 'Offline' ? 'bg-red-500' : 
                    internalAssetStatus === 'Online' ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <h4 className={`text-sm font-semibold ${
                    internalAssetStatus === 'Offline' ? 'text-red-900' : 'text-gray-900'
                }`}>
                    {internalAssetStatus === 'Offline' ? 'Downtime Details' : 'Status Details'}
                </h4>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Downtime Type - ONLY FOR OFFLINE */}
                {internalAssetStatus === 'Offline' && (
                    <div className={`relative ${activeDropdown === 'downtime-type' ? 'z-[100]' : 'z-[60]'}`}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Downtime Type</label>
                        <DynamicSelect
                            name="downtime-type"
                            placeholder="Select type"
                            options={[{ id: "unplanned", name: "Unplanned Repairs" }, { id: "planned", name: "Planned Maintenance" }]}
                            loading={false}
                            value={assetDowntimeType || ""}
                            onSelect={(val) => setAssetDowntimeType && setAssetDowntimeType(val as string)}
                            onFetch={() => {}}
                            activeDropdown={activeDropdown}
                            setActiveDropdown={setActiveDropdown}
                            className="w-full bg-white border-gray-300 shadow-sm rounded-lg"
                        />
                    </div>
                )}

                {/* 2. Status Since - ALWAYS VISIBLE - High Z-Index for Time dropdown */}
                <div className="relative z-[50]" ref={sinceRef}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Since</label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 group">
                            <input 
                                type="text" readOnly 
                                value={getDisplayDate(assetStatusSince || "")} 
                                onClick={() => setShowSinceCalendar(!showSinceCalendar)}
                                placeholder="Select Date"
                                className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer shadow-sm transition-all text-gray-700 font-medium"
                            />
                            {showSinceCalendar && (
                                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 animate-in fade-in zoom-in-95 left-0">
                                    <DayPicker mode="single" selected={safeParseDate(assetStatusSince || "")} onSelect={(d) => { if(d && setAssetStatusSince) { setAssetStatusSince(constructSecureISO(assetStatusSince || "", d, undefined)); setShowSinceCalendar(false); } }} />
                                </div>
                            )}
                        </div>
                        {showSinceTime ? (
                            <div className="w-28 relative">
                                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <TimePickerInput 
                                    value={getTimeString(assetStatusSince || "")} 
                                    onChange={(t) => setAssetStatusSince && setAssetStatusSince(constructSecureISO(assetStatusSince || "", undefined, t))}
                                    onClear={() => { setShowSinceTime(false); setAssetStatusSince && setAssetStatusSince(constructSecureISO(assetStatusSince || "", undefined, "00:00")); }}
                                    className="h-9 border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500 rounded-lg shadow-sm pl-8"
                                />
                            </div>
                        ) : (
                            <button type="button" onClick={() => setShowSinceTime(true)} className="h-9 px-3 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap">
                                + Time
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. Estimated Up - ONLY FOR OFFLINE - Lower Z-Index */}
                {internalAssetStatus === 'Offline' && (
                    <div className="relative z-[40]" ref={toRef}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Estimated Up</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 group">
                                <input 
                                    type="text" readOnly 
                                    value={getDisplayDate(assetStatusTo || "")} 
                                    onClick={() => setShowToCalendar(!showToCalendar)}
                                    placeholder="Select Date"
                                    className="w-full h-9 px-3 border border-gray-300 rounded-lg text-[13px] bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer shadow-sm transition-all text-gray-700 font-medium"
                                />
                                {showToCalendar && (
                                    <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 animate-in fade-in zoom-in-95 left-0">
                                        <DayPicker mode="single" selected={safeParseDate(assetStatusTo || "")} onSelect={(d) => { if(d && setAssetStatusTo) { setAssetStatusTo(constructSecureISO(assetStatusTo || "", d, undefined)); setShowToCalendar(false); } }} />
                                    </div>
                                )}
                            </div>
                            {showToTime ? (
                                <div className="w-28 relative">
                                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <TimePickerInput 
                                        value={getTimeString(assetStatusTo || "")} 
                                        onChange={(t) => setAssetStatusTo && setAssetStatusTo(constructSecureISO(assetStatusTo || "", undefined, t))}
                                        onClear={() => { setShowToTime(false); setAssetStatusTo && setAssetStatusTo(constructSecureISO(assetStatusTo || "", undefined, "00:00")); }}
                                        className="h-9 border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500 rounded-lg shadow-sm pl-8"
                                    />
                                </div>
                            ) : (
                                <button type="button" onClick={() => setShowToTime(true)} className="h-9 px-3 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap">
                                    + Time
                                </button>
                            )}
                        </div>
                    </div>
                )}

             </div>

             {/* Notes - ALWAYS VISIBLE */}
             <div className="mt-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">Status Notes</label>
                <div className="relative">
                    <textarea 
                        value={assetStatusNotes || ""} 
                        onChange={(e) => setAssetStatusNotes && setAssetStatusNotes(e.target.value)}
                        placeholder={internalAssetStatus === 'Offline' ? "Describe the issue causing downtime..." : "Add any notes regarding the asset status..."}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-[13px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-20 shadow-sm transition-all"
                    />
                </div>
             </div>
           </div>
        )}

        {/* Add Assets Button */}
        <button
          type="button"
          onClick={handleOpenAssetModal} // ✅ Updated to fetch data on click
          className="flex items-center gap-1.5 text-sm text-blue-500 font-medium mt-2 hover:text-blue-600 focus:outline-none relative z-0"
        >
          <Plus className="h-4 w-4" />
          Add Assets
        </button>
      </div>

      {/* ---------------- PROCEDURE SECTION ---------------- */}
      <div className="mt-8 relative z-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Procedure</h2>

        {linkedProcedure ? (
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{ backgroundColor: "#f0f7ff" }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-blue-200">
                <ClipboardList className="w-6 h-6 text-blue-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {linkedProcedure.title || "Untitled Procedure"}
                </p>
                <p className="text-sm text-gray-600">From Procedure Library</p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-4">
                <button
                  onClick={onPreviewProcedure}
                  type="button"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Preview
                </button>

                <span className="text-gray-300">|</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditProcedure) onEditProcedure();
                  }}
                  type="button"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProcedure();
                  }}
                  type="button"
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProcedureModal(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-700 self-start"
            >
              <Plus className="h-5 w-5" />
              Add Another Procedure
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center text-center gap-3 mb-6">
              <span className="text-base text-gray-600">
                Create or attach new Form, Procedure or Checklist
              </span>
            </div>

            <div className="flex justify-center items-center">
              <button
                type="button"
                onClick={() => setShowProcedureModal(true)}
                className="inline-flex items-center justify-center gap-2 px-8 h-12 text-sm font-semibold text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Procedure
              </button>
            </div>
          </>
        )}
      </div>

      {/* ---------------- ASSETS MODAL ---------------- */}
      <AddAssetsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddAssets}
        // ✅ PASS REAL API DATA HERE (Replaced hardcoded list)
        assets={assetOptions} 
      />

      {/* ---------------- PROCEDURE MODAL ---------------- */}
      <AddProcedureModal
        isOpen={showProcedureModal}
        onClose={() => setShowProcedureModal(false)}
        onSelect={(p) => {
          setLinkedProcedure(p);
          setShowProcedureModal(false);
        }}
      />
    </>
  );
}