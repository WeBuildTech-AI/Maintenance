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

  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [workOrderName, setWorkOrderName] = useState("");
  const [description, setDescription] = useState("");
  const [locationId, setLocationId] = useState("");
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedWorkType, setSelectedWorkType] = useState("Reactive");
  const [selectedPriority, setSelectedPriority] = useState("None");
  const [qrCodeValue, setQrCodeValue] = useState("");

  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [teamOptions, setTeamOptions] = useState<SelectOption[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [partIds, setPartIds] = useState<string[]>([]);
  const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);

  const handleFetch = async (type: string, setOptions: (val: SelectOption[]) => void) => {
    try {
      const { data } = await fetchFilterData(type);
      setOptions(data);
    } catch (e) {
      console.error(`Failed fetching ${type}`, e);
    }
  };

  useEffect(() => {
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
      setQrCodeValue(data.qrCodeValue || "");
      setTeamIds(data.assignedTeamIds || []);
      setCategoryIds(data.categoryIds || []);
      setPartIds(data.partIds || []);
      setVendorIds(data.vendorIds || []);
    };

    const loadWorkOrder = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const data = await (dispatch as any)(fetchWorkOrderById(id)).unwrap();
          fillFields(data);
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
  }, [dispatch, id, existingWorkOrder, isEditMode]);

  useEffect(() => {
    if (location.pathname.endsWith("/create")) {
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
      setTeamIds([]);
      setCategoryIds([]);
      setPartIds([]);
      setVendorIds([]);
    }
  }, [location.pathname]);

  const handleSubmit = async () => {
    try {
      if (!workOrderName.trim()) {
        toast.error("Work order title is required");
        return;
      }

      const formData = new FormData();
      formData.append("organizationId", authUser?.organizationId || "");
      formData.append("title", workOrderName);
      formData.append("description", description || "");
      formData.append("status", "open");

      const priorityMap: Record<string, string> = {
        None: "low",
        Low: "low",
        Medium: "medium",
        High: "high",
        Urgent: "urgent",
      };
      formData.append("priority", priorityMap[selectedPriority] || "low");

      if (locationId) formData.append("locationId", locationId);

      // ✅ Send all array fields as repeated FormData entries
      assetIds.forEach((i) => i && formData.append("assetIds[]", i));
      vendorIds.forEach((i) => i && formData.append("vendorIds[]", i));
      partIds.forEach((i) => i && formData.append("partIds[]", i));
      teamIds.forEach((i) => i && formData.append("assignedTeamIds[]", i));
      categoryIds.forEach((i) => i && formData.append("categoryIds[]", i));
      selectedUsers.forEach((i) => i && formData.append("assigneeIds[]", i));

      const isoDue = parseDateInputToISO(dueDate);
      const isoStart = parseDateInputToISO(startDate);
      if (isoDue) formData.append("dueDate", isoDue);
      if (isoStart) formData.append("startDate", isoStart);

      // ✅ Use Redux user ID as authorId
      const authorId = authUser?.id;
      if (!authorId) {
        toast.error("User information missing. Please re-login.");
        return;
      }

      if (isEditMode && id) {
        await (dispatch as any)(
          updateWorkOrder({
            id,
            authorId, // 👈 added for PATCH /{id}/{authorId}
            data: formData as any,
          })
        ).unwrap();
        toast.success("✅ Work order updated successfully");
      } else {
        await (dispatch as any)(createWorkOrder(formData as any)).unwrap();
        toast.success("✅ Work order created successfully");
      }

      await (dispatch as any)(fetchWorkOrders()).unwrap();
      navigate("/work-orders");
      onCreate?.();
    } catch (err: any) {
      console.error("❌ Error saving work order:", err);
      toast.error(err?.message || "Failed to save work order");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 text-sm">Loading work order...</p>
      </div>
    );

  return (
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
          onOpenInviteModal={() => toast("Invite modal open")}
        />

        <WorkOrderClassificationAndLinks
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
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
        />
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white px-6 py-4">
        <button
          onClick={() => {
            if (onCancel) onCancel();
            else navigate("/work-orders");
          }}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-md border border-orange-600 bg-orange-600 px-6 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          {isEditMode ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}
