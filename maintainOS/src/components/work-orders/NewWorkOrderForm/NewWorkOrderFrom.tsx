"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useSearchParams, useMatch } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { WorkOrderDetails } from "./WorkOrderDetails";
import { AssetsAndProcedures } from "./AssetsAndProcedures";
import { AssignmentAndScheduling } from "./AssignmentAndScheduling";
import { WorkOrderClassificationAndLinks } from "./WorkOrderClassificationAndLinks";

import type { SelectOption } from "../NewWorkOrderForm/DynamicSelect";
import {
  createWorkOrder,
  updateWorkOrder,
} from "../../../store/workOrders/workOrders.thunks";
import { fetchFilterData } from "../../utils/filterDataFetcher";
import { procedureService } from "../../../store/procedures/procedures.service";
import { LinkedProcedurePreviewModal } from "./LinkedProcedurePreviewModal";
import AddProcedureModal from "../WorkloadView/Modal/AddProcedureModal";

import GenerateProcedure from "../../Library/GenerateProcedure/GenerateProcedure";

import TimeOverviewPanel from "./../panels/TimeOverviewPanel";
import OtherCostsPanel from "./../panels/OtherCostsPanel";
import UpdatePartsPanel from "./../panels/UpdatePartsPanel";

function parseDateInputToISO(input?: string): string | undefined {
  if (!input) return undefined;
  const v = input.trim();
  if (!v) return undefined;
  const maybe = Date.parse(v);
  if (!Number.isNaN(maybe) && v.includes("T")) return new Date(maybe).toISOString();
  return new Date(v).toISOString();
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
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const authUser = useSelector((state: any) => state.auth.user);

  const procedureEditMatch = useMatch("/work-orders/:workOrderId/edit/library/:procedureId");
  const deepEditingProcedureId = procedureEditMatch?.params?.procedureId;

  const isEditMode = propIsEditMode ?? location.pathname.includes("/edit");
  const id = editId ?? existingWorkOrder?.id ?? null;
  const isCreateRoute = location.pathname.endsWith("/create");

  const [currentPanel, setCurrentPanel] = useState<'form' | 'time' | 'cost' | 'parts'>('form');

  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [workOrderName, setWorkOrderName] = useState("");
  const [description, setDescription] = useState("");
  const [locationId, setLocationId] = useState("");
  
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<{id: string, name: string}[]>([]);
  
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  
  const [selectedWorkType, setSelectedWorkType] = useState("Reactive");
  const [selectedPriority, setSelectedPriority] = useState("None");
  const [qrCodeValue, setQrCodeValue] = useState("");
  
  const [recurrenceRule, setRecurrenceRule] = useState<any>(null);
  
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [partIds, setPartIds] = useState<string[]>([]);
  const [vendorIds, setVendorIds] = useState<string[]>([]);

  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<SelectOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);

  const [linkedProcedure, setLinkedProcedure] = useState<any>(null);
  const [isProcedureLoading, setIsProcedureLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddProcModalOpen, setIsAddProcModalOpen] = useState(false);

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

  useEffect(() => {
    if (location.state?.previousFormState) {
      const s = location.state.previousFormState;
      if (s.workOrderName) setWorkOrderName(s.workOrderName);
      if (s.description) setDescription(s.description);
      if (s.locationId) setLocationId(s.locationId);
      if (s.assetIds) setAssetIds(s.assetIds);
      if (s.selectedUsers) setSelectedUsers(s.selectedUsers);
      if (s.dueDate) setDueDate(s.dueDate);
      if (s.startDate) setStartDate(s.startDate);
      if (s.selectedWorkType) setSelectedWorkType(s.selectedWorkType);
      if (s.selectedPriority) setSelectedPriority(s.selectedPriority);
      if (s.qrCodeValue) setQrCodeValue(s.qrCodeValue);
      if (s.recurrenceRule) setRecurrenceRule(s.recurrenceRule);
      if (s.teamIds) setTeamIds(s.teamIds);
      if (s.categoryIds) setCategoryIds(s.categoryIds);
      if (s.partIds) setPartIds(s.partIds);
      if (s.vendorIds) setVendorIds(s.vendorIds);
    }
  }, [location.state]);

  useEffect(() => {
    if (deepEditingProcedureId && linkedProcedure?.id !== deepEditingProcedureId) {
      const fetchSpecificProcedure = async () => {
        setIsProcedureLoading(true);
        try {
          const foundProc = await procedureService.fetchProcedureById(deepEditingProcedureId);
          if (foundProc) setLinkedProcedure(foundProc);
        } catch (err) {
          console.error("API Error:", err);
        } finally {
          setIsProcedureLoading(false);
        }
      };
      fetchSpecificProcedure();
    }
  }, [deepEditingProcedureId]);

  useEffect(() => {
    if (isCreateRoute && !editId && !location.state?.previousFormState) return; 

    const fillFields = (data: any) => {
      if (!data) return;

      setWorkOrderName(data.title || "");
      setDescription(data.description || "");
      
      setDueDate(data.dueDate ? new Date(data.dueDate).toLocaleDateString("en-US") : "");
      setStartDate(data.startDate ? new Date(data.startDate).toLocaleDateString("en-US") : "");
      
      setSelectedWorkType(data.workType || "Reactive");
      setSelectedPriority(
        data.priority ? data.priority.charAt(0).toUpperCase() + data.priority.slice(1) : "None"
      );
      
      setQrCodeValue(data.qrCode || "");
      
      if (data.recurrenceRule) {
        try {
          const parsed = typeof data.recurrenceRule === 'string' 
            ? JSON.parse(data.recurrenceRule) 
            : data.recurrenceRule;
          setRecurrenceRule(parsed);
        } catch(e) {
          setRecurrenceRule(null);
        }
      } else {
        setRecurrenceRule(null);
      }

      if (data.location) {
        setLocationId(data.location.id);
        setLocationOptions([{ id: data.location.id, name: data.location.name || "Unknown Location" }]);
      } else if (data.locationId) {
        setLocationId(data.locationId);
      }

      if (data.assets && data.assets.length > 0) {
        setAssetIds(data.assets.map((a: any) => a.id));
        setAssetOptions(data.assets.map((a: any) => ({ id: a.id, name: a.name || "Unknown Asset" })));
      } else {
        setAssetIds(data.assetIds || []);
      }

      if (data.teams && data.teams.length > 0) {
        setTeamIds(data.teams.map((t: any) => t.id));
        setTeamOptions(data.teams.map((t: any) => ({ id: t.id, name: t.name || "Unknown Team" })));
      } else {
        setTeamIds(data.assignedTeamIds || []);
      }

      if (data.categories && data.categories.length > 0) {
        setCategoryIds(data.categories.map((c: any) => c.id));
        setCategoryOptions(data.categories.map((c: any) => ({ id: c.id, name: c.name || "Unknown Category" })));
      } else {
        setCategoryIds(data.categoryIds || []);
      }

      if (data.parts && data.parts.length > 0) {
        setPartIds(data.parts.map((p: any) => p.id));
        setPartOptions(data.parts.map((p: any) => ({ id: p.id, name: p.name || "Unknown Part" })));
      } else {
        setPartIds(data.partIds || []);
      }

      if (data.vendors && data.vendors.length > 0) {
        setVendorIds(data.vendors.map((v: any) => v.id));
        setVendorOptions(data.vendors.map((v: any) => ({ id: v.id, name: v.name || "Unknown Vendor" })));
      } else {
        setVendorIds(data.vendorIds || []);
      }

      if (data.assignees && data.assignees.length > 0) {
        setSelectedUsers(data.assignees.map((u: any) => u.id));
        setAssigneeOptions(data.assignees.map((u: any) => ({
            id: u.id, 
            name: u.fullName || u.name || "Unknown"
        })));
      } else {
        setSelectedUsers(data.assigneeIds || []);
        setAssigneeOptions([]);
      }
      
      if (data.procedures && data.procedures.length > 0) {
        setLinkedProcedure(data.procedures[0]);
      } else if (data.procedure) {
        setLinkedProcedure(data.procedure);
      } else if (data.procedureIds && data.procedureIds.length > 0) {
        const procId = data.procedureIds[0];
        procedureService.fetchProcedureById(procId).then((proc) => {
            setLinkedProcedure(proc);
        }).catch(e => console.error("Failed to lazy load procedure", e));
      }
    };

    const loadWorkOrder = async () => {
      if (isEditMode && id) {
        if (location.state?.previousFormState) {
            if (location.state.previousFormState.procedureId && !linkedProcedure) {
                 const pId = location.state.previousFormState.procedureId;
                 const proc = await procedureService.fetchProcedureById(pId);
                 setLinkedProcedure(proc);
            }
            return; 
        }

        try {
          setLoading(true);
          if (existingWorkOrder && existingWorkOrder.id === id) {
            fillFields(existingWorkOrder);
          } else {
            const data = await (dispatch as any).unwrap();
            fillFields(data);
          }
        } catch (e) {
          console.error(e);
          toast.error("Failed to load work order details");
        } finally {
          setLoading(false);
        }
      } else if (existingWorkOrder) {
        fillFields(existingWorkOrder);
      }
    };

    loadWorkOrder();
  }, [dispatch, id, existingWorkOrder, isEditMode, isCreateRoute, location.state]);

  const handleEditLinkedProcedure = () => {
    if (linkedProcedure?.id) {
      const currentFormState = {
        workOrderName,
        description,
        locationId,
        assetIds,
        selectedUsers,
        dueDate,
        startDate,
        selectedWorkType,
        selectedPriority,
        qrCodeValue,
        recurrenceRule,
        teamIds,
        categoryIds,
        partIds,
        vendorIds,
        procedureId: linkedProcedure.id 
      };

      navigate(`/library/${linkedProcedure.id}/edit`, {
        state: { 
          returnPath: location.pathname,
          previousFormState: currentFormState 
        }
      });
    }
  };

  const handleEditorBack = async () => {
    if (id) {
        navigate(`/work-orders/${id}/edit`);
    }
    
    if (linkedProcedure?.id) {
      try {
        setIsProcedureLoading(true);
        const updatedProc = await procedureService.fetchProcedureById(linkedProcedure.id);
        if (updatedProc) {
          setLinkedProcedure(updatedProc);
          toast.success("Procedure updated");
        }
      } catch (e) {
        console.error("Failed to refresh procedure", e);
      } finally {
        setIsProcedureLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!workOrderName.trim()) {
        toast.error("Work order title is required");
        return;
      }

      const authorId = authUser?.id;
      if (!authorId) {
        toast.error("User information missing. Please re-login.");
        return;
      }

      const payload: any = {
        title: workOrderName,
        description,
        status: "open",
        workType: selectedWorkType,
        qrCode: qrCodeValue || undefined,
        priority: {
          None: "low", Low: "low", Medium: "medium", High: "high", Urgent: "urgent"
        }[selectedPriority] || "low",
        
        locationId: locationId || null,
        
        assetIds: assetIds,
        vendorIds: vendorIds,
        partIds: partIds,
        assignedTeamIds: teamIds,
        categoryIds: categoryIds,
        assigneeIds: selectedUsers,
        
        procedureIds: linkedProcedure ? [linkedProcedure.id] : [],
        
        dueDate: parseDateInputToISO(dueDate),
        startDate: parseDateInputToISO(startDate),
      };

      if (recurrenceRule) {
        const rule = typeof recurrenceRule === 'string' ? JSON.parse(recurrenceRule) : recurrenceRule;
        payload.recurrenceRule = rule;
      }

      setLoading(true);

      if (isEditMode && id) {
        await dispatch(updateWorkOrder({ 
            id, 
            authorId, 
            data: payload 
        })).unwrap();
        toast.success("✅ Work order updated successfully");
      } else {
        await dispatch(createWorkOrder(payload)).unwrap();
        toast.success("✅ Work order created successfully");
      }

      if (onCreate) onCreate();
      else navigate("/work-orders");

    } catch (err: any) {
      console.error("❌ Error saving work order:", err);
      const errorMsg = err?.message || (typeof err === 'string' ? err : "Failed to save work order");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading || isProcedureLoading)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    );

  if (currentPanel === 'time') return <TimeOverviewPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={existingWorkOrder} workOrderId={id} />;
  if (currentPanel === 'cost') return <OtherCostsPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={existingWorkOrder} workOrderId={id} />;
  if (currentPanel === 'parts') return <UpdatePartsPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={existingWorkOrder} workOrderId={id} />;

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white relative">
        
        {deepEditingProcedureId && linkedProcedure && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <GenerateProcedure 
              onBack={handleEditorBack}
              editingProcedureId={deepEditingProcedureId}
            />
          </div>
        )}

        <div className="flex-none border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditMode ? "Edit Work Order" : "New Work Order"}
          </h2>
        </div>

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
            onEditProcedure={handleEditLinkedProcedure}
            onOpenProcedureModal={() => setIsAddProcModalOpen(true)}
            setLinkedProcedure={setLinkedProcedure} 
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
            recurrenceRule={recurrenceRule}
            setRecurrenceRule={setRecurrenceRule}
            recurrence="Custom" 
            setRecurrence={() => {}}
            onOpenInviteModal={() => toast("Invite modal open")}
            initialAssignees={assigneeOptions}
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
            
            onPanelClick={setCurrentPanel}
            isEditMode={isEditMode}
            // ✅ PASS partUsages to display card
            partUsages={existingWorkOrder?.partUsages}
          />
        </div>

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
        onSelect={(proc: any) => {
            setLinkedProcedure(proc);
            setIsAddProcModalOpen(false);
        }}
      />
    </>
  );
}