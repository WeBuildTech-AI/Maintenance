"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import { WorkOrderDetails } from "./WorkOrderDetails";
import { AssetsAndProcedures } from "./AssetsAndProcedures";
import { AssignmentAndScheduling } from "./AssignmentAndScheduling";
import { WorkOrderClassificationAndLinks } from "./WorkOrderClassificationAndLinks";

import type { SelectOption } from "../NewWorkOrderForm/DynamicSelect";
import {
  createWorkOrder,
  updateWorkOrder,
  fetchWorkOrderById,
  fetchWorkOrders,
} from "../../../store/workOrders/workOrders.thunks";
import { fetchFilterData } from "../../utils/filterDataFetcher";
import { procedureService } from "../../../store/procedures/procedures.service";
import { LinkedProcedurePreviewModal } from "./LinkedProcedurePreviewModal";
import AddProcedureModal from "../WorkloadView/Modal/AddProcedureModal";

// Panels for edit mode
import TimeOverviewPanel from "./../panels/TimeOverviewPanel";
import OtherCostsPanel from "./../panels/OtherCostsPanel";
import UpdatePartsPanel from "./../panels/UpdatePartsPanel";

function parseDateInputToISO(input?: string): string | undefined {
  if (!input) return undefined;
  const v = input.trim();
  if (!v) return undefined;
  const maybe = Date.parse(v);
  if (!Number.isNaN(maybe) && v.includes("T")) return new Date(maybe).toISOString();

  const isoLike = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (isoLike) {
    const [, yy, mm, dd] = isoLike;
    const d = new Date(Date.UTC(+yy, +mm - 1, +dd));
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  const usLike = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (usLike) {
    const [, mm, dd, yy] = usLike;
    const d = new Date(Date.UTC(+yy, +mm - 1, +dd));
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function NewWorkOrderForm({
  onCreate,
  existingWorkOrder,
  editId,
  isEditMode: propIsEditMode,
  onCancel,
}: {
  onCreate: () => void;
  existingWorkOrder?: any;
  editId?: string;
  isEditMode?: boolean;
  onCancel?: () => void;
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useSelector((state: any) => state.auth.user);

  const isEditMode = propIsEditMode ?? location.pathname.includes("/edit");
  const id = editId ?? existingWorkOrder?.id ?? null;
  // ✅ Fix Prefill: Check if we are on the create route
  const isCreateRoute = location.pathname.endsWith("/create");

  const [currentPanel, setCurrentPanel] = useState<'form' | 'time' | 'cost' | 'parts'>('form');

  // --- Form States ---
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [workOrderName, setWorkOrderName] = useState("");
  const [description, setDescription] = useState("");
  const [locationId, setLocationId] = useState("");
  
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  
  // ✅ Default values
  const [selectedWorkType, setSelectedWorkType] = useState("Reactive");
  const [selectedPriority, setSelectedPriority] = useState("None");
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [recurrence, setRecurrence] = useState("Does not repeat");
  
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [partIds, setPartIds] = useState<string[]>([]);
  const [vendorIds, setVendorIds] = useState<string[]>([]);

  // Options for Dropdowns
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<SelectOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);

  // Procedures
  const [linkedProcedure, setLinkedProcedure] = useState<any>(null);
  const [isProcedureLoading, setIsProcedureLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddProcModalOpen, setIsAddProcModalOpen] = useState(false);

  // Fetch Helper
  const handleFetch = async (type: string, setOptions: (val: SelectOption[]) => void) => {
    try {
      const { data } = await fetchFilterData(type);
      const normalized = Array.isArray(data) ? data.map((d: any) => ({
        id: d.id,
        name: d.name || d.title || d.fullName || "Unknown"
      })) : [];
      setOptions(normalized);
    } catch (e) {
      console.error(`Failed fetching ${type}`, e);
    }
  };

  // Load Procedure from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const procedureId = params.get("procedureId");

    if (procedureId && !linkedProcedure) {
      const fetchProcedure = async () => {
        setIsProcedureLoading(true);
        try {
          const allProcs = await procedureService.fetchProcedures();
          const foundProc = allProcs.find((p: any) => p.id === procedureId);
          if (foundProc) {
            setLinkedProcedure(foundProc);
            navigate(location.pathname, { replace: true });
          } else {
            toast.error("Could not find the selected procedure.");
          }
        } catch (err) {
          toast.error("Failed to load procedure.");
        } finally {
          setIsProcedureLoading(false);
        }
      };
      fetchProcedure();
    }
  }, [location.search, linkedProcedure, navigate, location.pathname]);

  // Load Existing Data
  useEffect(() => {
    // ✅ FIX: If we are on CREATE route, DO NOT load existing data
    if (isCreateRoute) return;

    const fillFields = (data: any) => {
      if (!data) return;
      setWorkOrderName(data.title || "");
      setDescription(data.description || "");
      setLocationId(data.locationId || "");
      setAssetIds(data.assetIds || []);
      setSelectedUsers(data.assigneeIds || []);
      
      setDueDate(data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-US") : "");
      setStartDate(data.startDate ? new Date(data.startDate).toLocaleDateString("en-US") : "");
      
      setSelectedWorkType(data.workType || "Reactive");
      setSelectedPriority(
        data.priority ? data.priority.charAt(0).toUpperCase() + data.priority.slice(1) : "None"
      );
      
      // ✅ Fill new fields
      setQrCodeValue(data.qrCode || "");
      setRecurrence(data.recurrence || "Does not repeat");
      setTeamIds(data.assignedTeamIds || []);
      setCategoryIds(data.categoryIds || []);
      setPartIds(data.partIds || []);
      setVendorIds(data.vendorIds || []);
      
      if (data.procedure) {
        setLinkedProcedure(data.procedure);
      }
    };

    const loadWorkOrder = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          if (existingWorkOrder) {
            fillFields(existingWorkOrder);
          } else {
            const data = await (dispatch as any)(fetchWorkOrderById(id)).unwrap();
            fillFields(data);
          }
        } catch {
          toast.error("Failed to load work order details");
        } finally {
          setLoading(false);
        }
      } else if (existingWorkOrder) {
        fillFields(existingWorkOrder);
      }
    };

    loadWorkOrder();
  }, [dispatch, id, existingWorkOrder, isEditMode, isCreateRoute]); // Added isCreateRoute dependency

  // ✅ Reset form when explicitly creating
  useEffect(() => {
    if (isCreateRoute && !location.search.includes("procedureId")) {
      setWorkOrderName("");
      setDescription("");
      setLocationId("");
      setAssetIds([]);
      setSelectedUsers([]);
      setDueDate("");
      setStartDate("");
      setSelectedWorkType("Reactive");
      setSelectedPriority("None");
      setQrCodeValue("");
      setRecurrence("Does not repeat");
      setTeamIds([]);
      setCategoryIds([]);
      setPartIds([]);
      setVendorIds([]);
      setLinkedProcedure(null);
    }
  }, [location.pathname, location.search, isCreateRoute]);

  const handleSubmit = async () => {
    try {
      if (!workOrderName.trim()) {
        toast.error("Work order title is required");
        return;
      }

      const formData = new FormData();
      
      // ✅ Only append if value exists
      if (workOrderName) formData.append("title", workOrderName);
      if (description) formData.append("description", description);
      
      // Default status
      formData.append("status", "open");

      // ✅ Only append Work Type if selected
      if (selectedWorkType) formData.append("workType", selectedWorkType);

      // ❌ FIX: Backend throwing 400 error for recurrence. 
      // Commenting this out until backend supports it.
      // if (recurrence) formData.append("recurrence", recurrence);

      // ✅ Only append QR Code if filled
      if (qrCodeValue) formData.append("qrCode", qrCodeValue);

      // Priority mapping
      const priorityMap: Record<string, string> = {
        None: "low", Low: "low", Medium: "medium", High: "high", Urgent: "urgent",
      };
      // Only send priority if not None (or send default low)
      const mappedPriority = priorityMap[selectedPriority] || "low";
      formData.append("priority", mappedPriority);

      if (locationId) formData.append("locationId", locationId);

      // Arrays - Only append if length > 0
      if (assetIds.length > 0) assetIds.forEach((i) => i && formData.append("assetIds[]", i));
      if (vendorIds.length > 0) vendorIds.forEach((i) => i && formData.append("vendorIds[]", i));
      if (partIds.length > 0) partIds.forEach((i) => i && formData.append("partIds[]", i));
      if (teamIds.length > 0) teamIds.forEach((i) => i && formData.append("assignedTeamIds[]", i));
      if (categoryIds.length > 0) categoryIds.forEach((i) => i && formData.append("categoryIds[]", i));
      if (selectedUsers.length > 0) selectedUsers.forEach((i) => i && formData.append("assigneeIds[]", i));

      if (linkedProcedure) {
        formData.append("procedureIds[]", linkedProcedure.id);
      }

      // Dates - Only append if valid
      const isoDue = parseDateInputToISO(dueDate);
      const isoStart = parseDateInputToISO(startDate);
      if (isoDue) formData.append("dueDate", isoDue);
      if (isoStart) formData.append("startDate", isoStart);

      const authorId = authUser?.id;
      if (!authorId) {
        toast.error("User information missing. Please re-login.");
        return;
      }

      // ✅ DEBUG LOG: See exactly what is being sent
      const payloadObj: any = {};
      formData.forEach((value, key) => {
        if (payloadObj[key]) {
            if (!Array.isArray(payloadObj[key])) payloadObj[key] = [payloadObj[key]];
            payloadObj[key].push(value);
        } else {
            payloadObj[key] = value;
        }
      });
      console.log("🚀 FINAL API PAYLOAD:", payloadObj);

      if (isEditMode && id) {
        await (dispatch as any)(
          updateWorkOrder({
            id,
            authorId, 
            data: formData as any,
          })
        ).unwrap();
        toast.success("✅ Work order updated successfully");
      } else {
        await (dispatch as any)(createWorkOrder(formData as any)).unwrap();
        toast.success("✅ Work order created successfully");
      }

      await (dispatch as any)(fetchWorkOrders()).unwrap();
      if (onCreate) onCreate();
      else navigate("/work-orders");

    } catch (err: any) {
      console.error("❌ Error saving work order:", err);
      // Show backend error message if available
      const errorMsg = err?.message || (typeof err === 'string' ? err : "Failed to save work order");
      toast.error(errorMsg);
    }
  };

  if (loading || isProcedureLoading)
    return <div className="flex items-center justify-center h-full"><p className="text-gray-600 text-sm">Loading...</p></div>;

  // Panel Switching
  if (currentPanel === 'time') return <TimeOverviewPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={existingWorkOrder} workOrderId={id} />;
  if (currentPanel === 'cost') return <OtherCostsPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={existingWorkOrder} workOrderId={id} />;
  if (currentPanel === 'parts') return <UpdatePartsPanel onCancel={() => setCurrentPanel('form')} />;

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white">
        {/* Header */}
        <div className="flex-none border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditMode ? "Edit Work Order" : "New Work Order"}
          </h2>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <WorkOrderDetails
            name={workOrderName}
            onNameChange={setWorkOrderName}
            description={description}
            onDescriptionChange={setDescription}
            locationId={locationId}
            onLocationSelect={(val) => setLocationId(val as string)}
            locationOptions={locationOptions}
            isLocationsLoading={false}
            onFetchLocations={() => handleFetch("locations", setLocationOptions)}
            onCreateLocation={() => toast("Open Create Location Modal")}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />

          <AssetsAndProcedures
            assetIds={assetIds}
            onAssetSelect={(val) => setAssetIds(val as string[])}
            assetOptions={assetOptions}
            isAssetsLoading={false}
            onFetchAssets={() => handleFetch("assets", setAssetOptions)}
            onCreateAsset={() => toast("Open Create Asset Modal")}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            linkedProcedure={linkedProcedure}
            onRemoveProcedure={() => setLinkedProcedure(null)}
            onPreviewProcedure={() => setIsPreviewOpen(true)}
            onOpenProcedureModal={() => setIsAddProcModalOpen(true)}
          />

          <AssignmentAndScheduling
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            dueDate={dueDate}
            setDueDate={setDueDate}
            startDate={startDate}
            setStartDate={setStartDate}
            selectedWorkType={selectedWorkType}
            setSelectedWorkType={setSelectedWorkType}
            // ✅ Pass Recurrence Props
            recurrence={recurrence}
            setRecurrence={setRecurrence}
            onOpenInviteModal={() => toast("Invite modal open")}
          />

          <WorkOrderClassificationAndLinks
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            // ✅ Pass QR and Teams Props
            qrCodeValue={qrCodeValue}
            onQrCodeChange={setQrCodeValue}
            teamIds={teamIds}
            onTeamSelect={(val) => setTeamIds(val as string[])}
            teamOptions={teamOptions}
            isTeamsLoading={false}
            onFetchTeams={() => handleFetch("team-members", setTeamOptions)}
            onCreateTeam={() => toast("Open Create Team Modal")}
            
            categoryIds={categoryIds}
            onCategorySelect={(val) => setCategoryIds(val as string[])}
            categoryOptions={categoryOptions}
            isCategoriesLoading={false}
            onFetchCategories={() => handleFetch("categories", setCategoryOptions)}
            onCreateCategory={() => toast("Open Create Category Modal")}
            
            partIds={partIds}
            onPartSelect={(val) => setPartIds(val as string[])}
            partOptions={partOptions}
            isPartsLoading={false}
            onFetchParts={() => handleFetch("parts", setPartOptions)}
            onCreatePart={() => toast("Open Create Part Modal")}
            
            vendorIds={vendorIds}
            onVendorSelect={(val) => setVendorIds(val as string[])}
            vendorOptions={vendorOptions}
            isVendorsLoading={false}
            onFetchVendors={() => handleFetch("vendors", setVendorOptions)}
            onCreateVendor={() => toast("Open Create Vendor Modal")}
            
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            
            onPanelClick={setCurrentPanel}
            isEditMode={isEditMode}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white px-6 py-4">
          <button
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
              else navigate("/work-orders");
            }}
            className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md border border-orange-600 bg-orange-600 px-6 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
          >
            {isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </div>
      
      <LinkedProcedurePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        procedure={linkedProcedure}
      />
      <AddProcedureModal
        isOpen={isAddProcModalOpen}
        onClose={() => setIsAddProcModalOpen(false)}
      />
    </>
  );
}