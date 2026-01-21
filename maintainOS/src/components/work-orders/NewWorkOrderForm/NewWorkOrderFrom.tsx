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
  fetchWorkOrderById, 
} from "../../../store/workOrders/workOrders.thunks";
import { fetchFilterData } from "../../utils/filterDataFetcher";
import { procedureService } from "../../../store/procedures/procedures.service";
import { LinkedProcedurePreviewModal } from "./LinkedProcedurePreviewModal";
import AddProcedureModal from "../WorkloadView/Modal/AddProcedureModal";

import GenerateProcedure from "../../Library/GenerateProcedure/GenerateProcedure";

import TimeOverviewPanel from "./../panels/TimeOverviewPanel";
import OtherCostsPanel from "./../panels/OtherCostsPanel";
import UpdatePartsPanel from "./../panels/UpdatePartsPanel";
import { locationService } from "../../../store/locations";



// 🛠️ HELPER: UI String ("4:30") -> Backend Number (4.5)
const parseTimeToDecimal = (timeStr: string): number => {
  if (!timeStr) return 0;
  if (!timeStr.includes(":")) return Number(timeStr);

  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours || "0", 10);
  const m = parseInt(minutes || "0", 10);
  
  // Standard Time Math: Minutes / 60
  return h + (m / 60);
};

// 🛠️ HELPER: Backend Number (4.666) -> UI String ("4:40")
const parseDecimalToTime = (val: number): string => {
   if (val === undefined || val === null) return "";
   
   const h = Math.floor(val);
   const decimalPart = val - h;
   // Standard Time Math: .666 * 60 = 40 mins
   const m = Math.round(decimalPart * 60); 

   return `${h}:${m}`;
};

// ✅ FIXED HELPER: Robust Diffing Logic
const getChangedFields = (original: any, current: any) => {
    const changes: any = {};
    console.group("🚀 [DEBUG] PAYLOAD GENERATION");
    
    // 1. Simple Fields
    const simpleFields = [
      "title", "description", "priority", "status", "workType", 
      "locationId", 
      "assetStatus", "assetDowntimeType", "assetStatusNotes", "assetStatusSince", "assetStatusTo"
    ];

    simpleFields.forEach((key) => {
      let origVal = original[key];

      // 🛠️ FIX: Handle location edge case (Backend sends object, Form has ID)
      if (key === "locationId" && origVal === undefined && original.location?.id) {
        origVal = original.location.id;
      }

      if (current[key] !== undefined && origVal !== current[key]) {
        changes[key] = current[key];
      }
    });

    // 2. Estimated Time (Number Comparison)
    const origTime = original.estimatedTimeHours === null || original.estimatedTimeHours === undefined 
                      ? 0 
                      : Number(original.estimatedTimeHours);
    
    // current.estimatedTimeHours is already converted to Number by handleSubmit
    const currTime = Number(current.estimatedTimeHours || 0);
    
    if (Math.abs(origTime - currTime) > 0.001) {
        console.log(`✅ Time Changed: ${origTime} -> ${currTime}`);
        changes.estimatedTimeHours = currTime;
    }

    // 3. Date Fields
    const dateFields = ["startDate", "dueDate"];
    dateFields.forEach((key) => {
        const origVal = original[key];
        const currVal = current[key];

        if ((origVal && !currVal) || (!origVal && currVal)) {
            changes[key] = currVal;
        } 
        else if (origVal && currVal) {
             const d1 = new Date(origVal);
             const d2 = new Date(currVal);
             const dateStr1 = d1.toISOString().split('T')[0];
             const dateStr2 = d2.toISOString().split('T')[0];

             if (dateStr1 !== dateStr2) {
                 changes[key] = currVal;
             }
        }
    });

    // 4. Arrays (Compare IDs)
    const arrayMap: Record<string, string> = {
        "assetIds": "assets",
        "vendorIds": "vendors",
        "partIds": "parts",
        "assignedTeamIds": "teams",
        "categoryIds": "categories",
        "assigneeIds": "assignees",
        "procedureIds": "procedures"
    };

    const hasArrayChanged = (arr1: string[], arr2: string[]) => {
        const a1 = arr1 || [];
        const a2 = arr2 || [];
        if (a1.length !== a2.length) return true;
        const s1 = [...a1].sort();
        const s2 = [...a2].sort();
        return JSON.stringify(s1) !== JSON.stringify(s2);
    };

    Object.keys(arrayMap).forEach((payloadKey) => {
        const originalKey = arrayMap[payloadKey];
        const originalIds = original[originalKey]?.map((item: any) => item.id) || [];
        const currentIds = current[payloadKey] || [];

        if (hasArrayChanged(originalIds, currentIds)) {
            changes[payloadKey] = currentIds;
        }
    });

    // 5. Recurrence Rule
    let originalRule = original.recurrenceRule;
    if (typeof originalRule === 'string') {
        try { originalRule = JSON.parse(originalRule); } catch (e) {}
    }

    if (JSON.stringify(originalRule) !== JSON.stringify(current.recurrenceRule)) {
        changes.recurrenceRule = current.recurrenceRule;
    }

    console.log("📦 FINAL PAYLOAD:", changes);
    console.groupEnd();
    return changes;
};

export function NewWorkOrderForm({
  onCreate,
  existingWorkOrder,
  editId,
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
  const [searchParams] = useSearchParams(); 
  const authUser = useSelector((state: any) => state.auth.user);

  // ✅ LOCAL STATE TO HOLD BASELINE DATA (Fixes issue where 'existingWorkOrder' prop is stale)
  const [originalData, setOriginalData] = useState<any>(existingWorkOrder || {});

  const procedureEditMatch = useMatch("/work-orders/:workOrderId/edit/library/:procedureId");
  const deepEditingProcedureId = procedureEditMatch?.params?.procedureId;

  const activeId = editId ?? existingWorkOrder?.id ?? null;
  const isEditing = !!activeId; 
  
  const isCreateRoute = location.pathname.endsWith("/create");

  const [currentPanel, setCurrentPanel] = useState<'form' | 'time' | 'cost' | 'parts'>('form');

  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // --- Form State ---
  const [workOrderName, setWorkOrderName] = useState("");
  const [description, setDescription] = useState("");
  const [locationId, setLocationId] = useState("");
  
  const [estimatedTime, setEstimatedTime] = useState(""); 

  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<{id: string, name: string}[]>([]);
  
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [qrCodeValue, setQrCodeValue] = useState("");
  
  const [recurrenceRule, setRecurrenceRule] = useState<any>(null);
  const [status, setStatus] = useState("Open");
  
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const [partIds, setPartIds] = useState<string[]>([]);
  const [vendorIds, setVendorIds] = useState<string[]>([]);

  // ✅ Asset Status Extra Fields
  const [assetStatus, setAssetStatus] = useState("");
  const [assetDowntimeType, setAssetDowntimeType] = useState("");
  const [assetStatusNotes, setAssetStatusNotes] = useState("");
  const [assetStatusSince, setAssetStatusSince] = useState("");
  const [assetStatusTo, setAssetStatusTo] = useState("");

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

  // ✅ ADDED: Capture asset from Asset Detail navigation state
  useEffect(() => {
    if (location.state?.prefilledAsset) {
      const { id, name } = location.state.prefilledAsset;
      const assetIdStr = String(id);
      
      // Select the asset
      setAssetIds((prev) => (prev.includes(assetIdStr) ? prev : [...prev, assetIdStr]));
      
      // Ensure the name is in the dropdown options
      setAssetOptions((prev) => {
        if (prev.some((opt) => opt.id === assetIdStr)) return prev;
        return [...prev, { id: assetIdStr, name: name }];
      });

      // Clear state so it doesn't stay prefilled if user refreshes or navigates back
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const paramLocationId = searchParams.get("locationId");
    if (paramLocationId && !activeId) {
        setLocationId(paramLocationId);
        
        locationService.fetchLocationById(paramLocationId)
            .then((loc: any) => {
                if (loc) {
                    setLocationOptions([{ id: loc.id, name: loc.name }]);
                }
            })
            .catch((err: any) => console.error("Error prefilling location:", err));
    }
  }, [searchParams, activeId]);

  useEffect(() => {
    if (location.state?.prefilledPart) {
      const part = location.state.prefilledPart;
      setPartIds((prev) => prev.includes(part.id) ? prev : [...prev, part.id]);
      setPartOptions((prev) => prev.some((opt) => opt.id === part.id) ? prev : [...prev, { id: part.id, name: part.name }]);
    }
  }, [location.state]);

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
    if (location.state?.procedureData) {
      setLinkedProcedure(location.state.procedureData);
    } else {
      const queryProcId = searchParams.get("procedureId");
      if (queryProcId && !linkedProcedure && !isProcedureLoading) {
         setIsProcedureLoading(true);
         procedureService.fetchProcedureById(queryProcId)
           .then((proc) => { if(proc) setLinkedProcedure(proc); })
           .finally(() => setIsProcedureLoading(false));
      }
    }
  }, [location.state, searchParams]); 

  useEffect(() => {
    if (location.state?.previousFormState) {
      const s = location.state.previousFormState;
      if (s.workOrderName) setWorkOrderName(s.workOrderName);
      if (s.description) setDescription(s.description);
      if (s.locationId) setLocationId(s.locationId);
      if (s.estimatedTime) setEstimatedTime(s.estimatedTime); 
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
        } catch (err) { console.error("API Error:", err); } finally { setIsProcedureLoading(false); }
      };
      fetchSpecificProcedure();
    }
  }, [deepEditingProcedureId]);

  useEffect(() => {
    // Sync prop changes to local state if available
    if (existingWorkOrder) {
        setOriginalData(existingWorkOrder);
    }
  }, [existingWorkOrder]);

  useEffect(() => {
    if (isCreateRoute && !activeId && !location.state?.previousFormState) return; 

    const fillFields = (data: any) => {
      if (!data) return;

      // ✅ UPDATE BASELINE FOR DIFFING
      setOriginalData(data);

      setWorkOrderName(data.title || "");
      setDescription(data.description || "");
      
      if (data.estimatedTimeHours !== undefined && data.estimatedTimeHours !== null) {
          const timeStr = parseDecimalToTime(Number(data.estimatedTimeHours));
          setEstimatedTime(timeStr);
      } else {
          setEstimatedTime("");
      }

      setDueDate(data.dueDate || "");
      setStartDate(data.startDate || "");
      
      // ✅ Asset Status prefill logic - Check root first, fall back to first asset's status
      let prefilledStatus = data.assetStatus;
      if (!prefilledStatus && data.assets && data.assets.length > 0) {
          prefilledStatus = data.assets[0].status; // "offline", "online", etc.
      }
      if (prefilledStatus) {
          // Ensure Title Case for internal UI state comparison (if options are Title Case)
          // But options in AssetsAndProcedures are: "Online", "Offline", "Do not track"
          // Backend sends "offline", "in_progress" (for WO status)
          // Map backend "offline" -> "Offline"
          const mapStatus = (s: string) => {
              if (s.toLowerCase() === 'offline') return 'Offline';
              if (s.toLowerCase() === 'online') return 'Online';
              if (s.toLowerCase() === 'do_not_track' || s.toLowerCase() === 'do not track') return 'Do not track';
              return s;
          };
          setAssetStatus(mapStatus(prefilledStatus));
      }

      // Other Asset Fields
      if (data.assetDowntimeType) setAssetDowntimeType(data.assetDowntimeType);
      if (data.assetStatusNotes) setAssetStatusNotes(data.assetStatusNotes);
      if (data.assetStatusSince) setAssetStatusSince(data.assetStatusSince);
      if (data.assetStatusTo) setAssetStatusTo(data.assetStatusTo);
      
      // WorkType - Backend sends "reactive", UI expects "Reactive"
      if (data.workType) {
          setSelectedWorkType(data.workType.charAt(0).toUpperCase() + data.workType.slice(1));
      } else {
          setSelectedWorkType("Reactive");
      }

      setSelectedPriority(data.priority ? data.priority.charAt(0).toUpperCase() + data.priority.slice(1) : "None");
      
      // Status - Backend sends "open", "in_progress", etc. Map to UI
      const mapWOStatus = (s: string) => {
          if (!s) return "Open";
          if (s === "in_progress") return "In Progress";
          if (s === "on_hold") return "On Hold";
          return s.charAt(0).toUpperCase() + s.slice(1);
      };
      setStatus(mapWOStatus(data.status || "open"));

      setQrCodeValue(data.qrCode || "");
      
      if (data.recurrenceRule) {
        try {
          const parsed = typeof data.recurrenceRule === 'string' ? JSON.parse(data.recurrenceRule) : data.recurrenceRule;
          setRecurrenceRule(parsed);
        } catch(e) { setRecurrenceRule(null); }
      } else {
        setRecurrenceRule(null);
      }

      if (data.location) {
        setLocationId(data.location.id);
        setLocationOptions([{ id: data.location.id, name: data.location.name || "Unknown Location" }]);
      } else if (data.locationId) {
        setLocationId(data.locationId);
      }

      if (data.assets) {
        setAssetIds(data.assets.map((a: any) => a.id));
        setAssetOptions(data.assets.map((a: any) => ({ id: a.id, name: a.name || "Unknown Asset" })));
      } else { setAssetIds(data.assetIds || []); }

      if (data.teams) {
        setTeamIds(data.teams.map((t: any) => t.id));
        setTeamOptions(data.teams.map((t: any) => ({ id: t.id, name: t.name || "Unknown Team" })));
      } else { setTeamIds(data.assignedTeamIds || []); }

      if (data.categories) {
        setCategoryIds(data.categories.map((c: any) => c.id));
        setCategoryOptions(data.categories.map((c: any) => ({ id: c.id, name: c.name || "Unknown Category" })));
      } else { setCategoryIds(data.categoryIds || []); }

      if (data.parts) {
        setPartIds(data.parts.map((p: any) => p.id));
        setPartOptions(data.parts.map((p: any) => ({ id: p.id, name: p.name || "Unknown Part" })));
      } else { setPartIds(data.partIds || []); }

      if (data.vendors) {
        setVendorIds(data.vendors.map((v: any) => v.id));
        setVendorOptions(data.vendors.map((v: any) => ({ id: v.id, name: v.name || "Unknown Vendor" })));
      } else { setVendorIds(data.vendorIds || []); }

      if (data.assignees) {
        setSelectedUsers(data.assignees.map((u: any) => u.id));
        setAssigneeOptions(data.assignees.map((u: any) => ({ id: u.id, name: u.fullName || u.name || "Unknown" })));
      } else { setSelectedUsers(data.assigneeIds || []); setAssigneeOptions([]); }
      
      if (data.procedures && data.procedures.length > 0) setLinkedProcedure(data.procedures[0]);
      else if (data.procedure) setLinkedProcedure(data.procedure);
      else if (data.procedureIds && data.procedureIds.length > 0) {
        const procId = data.procedureIds[0];
        procedureService.fetchProcedureById(procId).then((proc) => setLinkedProcedure(proc)).catch(console.error);
      }
    };

    const loadWorkOrder = async () => {
      if (activeId) {
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
          if (existingWorkOrder && existingWorkOrder.id === activeId) {
            fillFields(existingWorkOrder);
          } else {
            const resultAction = await dispatch(fetchWorkOrderById(activeId));
            if (fetchWorkOrderById.fulfilled.match(resultAction)) {
                fillFields(resultAction.payload);
            } else {
                toast.error("Failed to fetch work order data");
            }
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
  }, [dispatch, activeId, existingWorkOrder, isCreateRoute, location.state]);

  const handleEditLinkedProcedure = () => {
    if (linkedProcedure?.id) {
      const currentFormState = {
        workOrderName, description, locationId, estimatedTime, assetIds, selectedUsers, dueDate, startDate, selectedWorkType, selectedPriority, qrCodeValue, recurrenceRule, teamIds, categoryIds, partIds, vendorIds, procedureId: linkedProcedure.id,
        assetStatus, assetDowntimeType, assetStatusNotes, assetStatusSince, assetStatusTo, status
      };
      navigate(`/library/${linkedProcedure.id}/edit`, { state: { returnPath: location.pathname, previousFormState: currentFormState } });
    }
  };

  const handleEditorBack = async () => {
    if (activeId) navigate(`/work-orders/${activeId}/edit`);
    if (linkedProcedure?.id) {
      try {
        setIsProcedureLoading(true);
        const updatedProc = await procedureService.fetchProcedureById(linkedProcedure.id);
        if (updatedProc) { setLinkedProcedure(updatedProc); toast.success("Procedure updated"); }
      } catch (e) { console.error(e); } finally { setIsProcedureLoading(false); }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!workOrderName.trim()) { toast.error("Work order title is required"); return; }
      const authorId = authUser?.id;
      if (!authorId) { toast.error("User information missing. Please re-login."); return; }

      const formState: any = {
        title: workOrderName,
        description,
        // ✅ UI Mapping back to Backend strings
        status: { "Open": "open", "In Progress": "in_progress", "On Hold": "on_hold", "Completed": "completed" }[status] || "open",
        workType: selectedWorkType ? selectedWorkType.toLowerCase() : "reactive", // Fallback and ensure lowercase
        qrCode: qrCodeValue || undefined,
        priority: { None: "low", Low: "low", Medium: "medium", High: "high", Urgent: "urgent" }[selectedPriority] || "low",
        locationId: locationId || null,
        estimatedTimeHours: parseTimeToDecimal(estimatedTime), // Returns number
        assetIds, vendorIds, partIds, assignedTeamIds: teamIds, categoryIds, assigneeIds: selectedUsers,
        procedureIds: linkedProcedure ? [linkedProcedure.id] : [],
        // ✅ Date Fix: Pass state directly (should be ISO string from AssignmentAndScheduling)
        dueDate: dueDate || null, 
        startDate: startDate || null,
        
        // ✅ Asset Status Fields - Allow Notes & Since for ALL statuses (Online, Do Not Track, Offline)
        // STRICT: Backend expects lowercase status (e.g. "offline") or specific camelCase ("doNotTrack")
        assetStatus: assetStatus || null,
        assetDowntimeType: (assetStatus === 'Offline' || assetStatus === 'offline') ? assetDowntimeType : null,
        assetStatusNotes: assetStatus ? assetStatusNotes : null,
        assetStatusSince: assetStatus ? assetStatusSince : null,
        assetStatusTo: (assetStatus === 'Offline' || assetStatus === 'offline') ? assetStatusTo : null
      };

      if (recurrenceRule) {
        const rule = typeof recurrenceRule === 'string' ? JSON.parse(recurrenceRule) : recurrenceRule;
        formState.recurrenceRule = rule;
      }

      setLoading(true);

      if (activeId) {
        // ✅ CALL THE DIFF FUNCTION with the CORRECT original data
        const payload = getChangedFields(originalData || {}, formState);
        
        if (Object.keys(payload).length === 0) {
            toast("No changes detected.");
            if (onCreate) onCreate(); else navigate("/work-orders");
            return;
        }

        // ✅ CRITICAL FIX: If Asset Status (or related fields) changed, we MUST send 'assetIds'
        // so the backend knows WHICH assets to update contextually.
        const isStatusChanging = payload.assetStatus || payload.assetDowntimeType || payload.assetStatusNotes || payload.assetStatusSince || payload.assetStatusTo;
        if (isStatusChanging && !payload.assetIds) {
             console.log("⚠️ Asset Status changing, forcing assetIds inclusion.");
             payload.assetIds = formState.assetIds;
        }

        await dispatch(updateWorkOrder({ id: activeId, authorId, data: payload })).unwrap();
        toast.success("✅ Work order updated successfully");
      } else {
        await dispatch(createWorkOrder(formState)).unwrap();
        toast.success("✅ Work order created successfully");
      }

      if (onCreate) onCreate(); else navigate("/work-orders");

    } catch (err: any) {
      console.error("❌ Error saving work order:", err);
      toast.error(err?.message || "Failed to save work order");
    } finally {
      setLoading(false);
    }
  };

  if (loading || isProcedureLoading)
    return (<div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><p className="text-sm font-medium">Loading...</p></div>);

  // ✅ FIX: Use 'originalData' (fetched state) instead of 'existingWorkOrder' (prop) to ensure Edit Mode has data
  if (currentPanel === 'time') return <TimeOverviewPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={originalData} workOrderId={activeId} />;
  if (currentPanel === 'cost') return <OtherCostsPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={originalData} workOrderId={activeId} />;
  if (currentPanel === 'parts') return <UpdatePartsPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={originalData} workOrderId={activeId} />;

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white relative">
        {deepEditingProcedureId && linkedProcedure && <div className="absolute inset-0 z-50 bg-white flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4"><GenerateProcedure onBack={handleEditorBack} editingProcedureId={deepEditingProcedureId} /></div>}
        <div className="flex-none border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{isEditing ? "Edit Work Order" : "New Work Order"}</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <WorkOrderDetails
            name={workOrderName} onNameChange={setWorkOrderName}
            description={description} onDescriptionChange={setDescription}
            estimatedTime={estimatedTime} onEstimatedTimeChange={setEstimatedTime}
            locationId={locationId} onLocationSelect={(val) => setLocationId(val as string)}
            locationOptions={locationOptions} isLocationsLoading={false} onFetchLocations={() => handleFetch("locations", setLocationOptions)} onCreateLocation={() => toast("Open Create Location Modal")}
            activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
          />
          <AssetsAndProcedures
            assetIds={assetIds} onAssetSelect={(val) => setAssetIds(val as string[])}
            assetOptions={assetOptions} isAssetsLoading={false} onFetchAssets={() => handleFetch("assets", setAssetOptions)} onCreateAsset={() => toast("Open Create Asset Modal")}
            activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
            linkedProcedure={linkedProcedure} onRemoveProcedure={() => setLinkedProcedure(null)} onPreviewProcedure={() => setIsPreviewOpen(true)} onEditProcedure={handleEditLinkedProcedure} setLinkedProcedure={setLinkedProcedure} 
            
            // ✅ Asset Status Props
            assetStatus={assetStatus} setAssetStatus={setAssetStatus}
            assetDowntimeType={assetDowntimeType} setAssetDowntimeType={setAssetDowntimeType}
            assetStatusNotes={assetStatusNotes} setAssetStatusNotes={setAssetStatusNotes}
            assetStatusSince={assetStatusSince} setAssetStatusSince={setAssetStatusSince}
            assetStatusTo={assetStatusTo} setAssetStatusTo={setAssetStatusTo}
          />
          <AssignmentAndScheduling
            selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers}
            dueDate={dueDate} setDueDate={setDueDate} startDate={startDate} setStartDate={setStartDate}
            selectedWorkType={selectedWorkType} setSelectedWorkType={setSelectedWorkType}
            recurrenceRule={recurrenceRule} setRecurrenceRule={setRecurrenceRule}
            onOpenInviteModal={() => toast("Invite modal open")} initialAssignees={assigneeOptions}

          />
          <WorkOrderClassificationAndLinks
            selectedPriority={selectedPriority} onPriorityChange={setSelectedPriority}
            status={status} onStatusChange={setStatus}
            qrCodeValue={qrCodeValue} onQrCodeChange={setQrCodeValue}
            teamIds={teamIds} onTeamSelect={(val) => setTeamIds(val as string[])} teamOptions={teamOptions} isTeamsLoading={false} onFetchTeams={() => handleFetch("team-members", setTeamOptions)} onCreateTeam={() => toast("Open Create Team Modal")}
            categoryIds={categoryIds} onCategorySelect={(val) => setCategoryIds(val as string[])} categoryOptions={categoryOptions} isCategoriesLoading={false} onFetchCategories={() => handleFetch("categories", setCategoryOptions)} onCreateCategory={() => toast("Open Create Category Modal")}
            partIds={partIds} onPartSelect={(val) => setPartIds(val as string[])} partOptions={partOptions} isPartsLoading={false} onFetchParts={() => handleFetch("parts", setPartOptions)} onCreatePart={() => toast("Open Create Part Modal")}
            vendorIds={vendorIds} onVendorSelect={(val) => setVendorIds(val as string[])} vendorOptions={vendorOptions} isVendorsLoading={false} onFetchVendors={() => handleFetch("vendors", setVendorOptions)} onCreateVendor={() => toast("Open Create Vendor Modal")}
            activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
            onPanelClick={setCurrentPanel} isEditMode={isEditing} 
            partUsages={originalData?.partUsages}
            timeEntries={originalData?.timeEntries}
            otherCosts={originalData?.otherCosts}
          />
        </div>
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white px-6 py-4">
          <button type="button" onClick={() => { if (onCancel) onCancel(); else navigate("/work-orders"); }} className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
          <button type="button" onClick={handleSubmit} className="rounded-md border border-orange-600 bg-orange-600 px-6 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors">{isEditing ? "Update" : "Create"}</button>
        </div>
      </div>
      <LinkedProcedurePreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} procedure={linkedProcedure} />
      <AddProcedureModal isOpen={isAddProcModalOpen} onClose={() => setIsAddProcModalOpen(false)} onSelect={(proc: any) => { setLinkedProcedure(proc); setIsAddProcModalOpen(false); }} />
    </>
  );
}