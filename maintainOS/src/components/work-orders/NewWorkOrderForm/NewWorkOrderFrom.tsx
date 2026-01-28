"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useSearchParams, useMatch } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { WorkOrderDetails } from "./WorkOrderDetails";
import { AssetsAndProcedures } from "./AssetsAndProcedures";
import { AssignmentAndScheduling } from "./AssignmentAndScheduling";
import { WorkOrderClassificationAndLinks } from "./WorkOrderClassificationAndLinks";

// import type { SelectOption } from "../NewWorkOrderForm/DynamicSelect"; // REMOVED unused import
import {
  createWorkOrder,
  updateWorkOrder,
  fetchWorkOrderById,
  fetchFilterData,
} from "../../../store/workOrders/workOrders.thunks";
// import { fetchFilterData } from "../../utils/filterDataFetcher"; // REMOVED
import { procedureService } from "../../../store/procedures/procedures.service";
import { LinkedProcedurePreviewModal } from "./LinkedProcedurePreviewModal";
import AddProcedureModal from "../WorkloadView/Modal/AddProcedureModal";

import GenerateProcedure from "../../Library/GenerateProcedure/GenerateProcedure";

import TimeOverviewPanel from "./../panels/TimeOverviewPanel";
import OtherCostsPanel from "./../panels/OtherCostsPanel";
import UpdatePartsPanel from "./../panels/UpdatePartsPanel";
// import { locationService } from "../../../store/locations"; // REMOVED unused import
import type { RootState } from "../../../store"; // Added RootState import



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
    "locationId"
  ];

  simpleFields.forEach((key) => {
    let origVal = original[key];

    // 🛠️ FIX: Handle location edge case (Backend sends object, Form has ID)
    if (key === "locationId" && origVal === undefined && original.location?.id) {
      origVal = original.location.id;
    }

    // 🛠️ FIX: Handle Partial Data (Summary Object) vs UI Defaults
    // If original is missing the field (undefined/null), and current is matching the 'default',
    // DO NOT count it as a change to avoid overwriting backend data with UI defaults.
    const defaults: Record<string, string> = {
      status: "open",
      workType: "reactive",
      priority: "low"
    };

    if (current[key] !== undefined && origVal !== current[key]) {
      // If original is missing and current is just the default, ignore it
      if ((origVal === undefined || origVal === null) && current[key] === defaults[key]) {
        return;
      }
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

    let originalIds: string[] = [];

    // 1. Try to get IDs from relational objects (e.g. original.assets -> map ids)
    if (original[originalKey] && Array.isArray(original[originalKey])) {
      originalIds = original[originalKey].map((item: any) => item.id);
    }
    // 2. Fallback: Try to get IDs from flat array (e.g. original.assetIds)
    else if (original[payloadKey] && Array.isArray(original[payloadKey])) {
      originalIds = original[payloadKey];
    }

    const currentIds = current[payloadKey] || [];

    if (hasArrayChanged(originalIds, currentIds)) {
      changes[payloadKey] = currentIds;
    }
  });

  // 5. Recurrence Rule
  let originalRule = original.recurrenceRule;
  if (typeof originalRule === 'string') {
    try { originalRule = JSON.parse(originalRule); } catch (e) { }
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
  prefillData,
}: {
  onCreate: (wo?: any) => void;
  existingWorkOrder?: any;
  editId?: string;
  isEditMode?: boolean;
  onCancel?: () => void;
  prefillData?: any;
}) {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const authUser = useSelector((state: any) => state.auth.user);

  // Gets cached filter data from Redux
  const filterData = useSelector((state: RootState) => state.workOrders.filterData);

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
  // const [assigneeOptions, setAssigneeOptions] = useState<{ id: string, name: string }[]>([]); // Derived from Redux now

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

  // Removed local options state
  // const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  // const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
  // const [teamOptions, setTeamOptions] = useState<SelectOption[]>([]);
  // const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  // const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
  // const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);

  const [linkedProcedure, setLinkedProcedure] = useState<any>(null);
  const [isProcedureLoading, setIsProcedureLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddProcModalOpen, setIsAddProcModalOpen] = useState(false);


  // Wait, line 242: const [isAddProcModalOpen, setIsAddProcModalOpen] = useState(false);
  // So I don't need to re-declare it. I just need to insert timersRef before the effect.

  // Timer Guard Ref
  const timersRef = useRef<Set<string>>(new Set());

  // Fetch all filter data on mount
  useEffect(() => {
    // Optimization: Only fetch if we really don't have data.
    // However, options might be stale. But per "Zero Redundant API Calls", if we have them, reuse them.
    // If filterData is null/undefined, fetch.
    // If filterData exists but arrays are empty? Might be valid empty state.

    // We can assume if 'filterData' object exists, we have fetched it at least once in the session 
    // (since Redux state persists in session usually, or at least while app is loaded).

    if (!filterData) {
      const TIMER_LABEL = "FILTER_DATA_FETCH_FORM";
      if (!timersRef.current.has(TIMER_LABEL)) {
        try { console.timeEnd(TIMER_LABEL); } catch (e) { }
        console.time(TIMER_LABEL);
        timersRef.current.add(TIMER_LABEL);
      }

      dispatch(fetchFilterData())
        .unwrap()
        .finally(() => {
          if (timersRef.current.has(TIMER_LABEL)) {
            try { console.timeEnd(TIMER_LABEL); } catch (e) { }
            timersRef.current.delete(TIMER_LABEL);
          }
        });
    } else {
      console.log("⚡ [Optimization] Reusing existing filter data");
    }
  }, [dispatch, filterData]);

  // Derive options from Redux state
  const locationOptions = useMemo(() => filterData?.locations || [], [filterData]);
  const assetOptions = useMemo(() => filterData?.assets || [], [filterData]);
  const teamOptions = useMemo(() => filterData?.teams || [], [filterData]);
  const categoryOptions = useMemo(() => filterData?.categories || [], [filterData]);
  const partOptions = useMemo(() => filterData?.parts || [], [filterData]);
  const vendorOptions = useMemo(() => filterData?.vendors || [], [filterData]);
  const assigneeOptions = useMemo(() => filterData?.users || [], [filterData]);


  // ✅ ADDED: Capture asset from Asset Detail navigation state
  useEffect(() => {
    if (location.state?.prefilledAsset) {
      const { id } = location.state.prefilledAsset; // removed name because options come from Redux now
      const assetIdStr = String(id);

      // Select the asset
      setAssetIds((prev) => (prev.includes(assetIdStr) ? prev : [...prev, assetIdStr]));

      // Removed manual option setting since we rely on Redux options now
      // setAssetOptions(...) 

      // Clear state so it doesn't stay prefilled if user refreshes or navigates back
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const paramLocationId = searchParams.get("locationId");
    if (paramLocationId && !activeId) {
      setLocationId(paramLocationId);
      // Removed manual fetch location by ID and option setting
    }
  }, [searchParams, activeId]);

  useEffect(() => {
    if (location.state?.prefilledPart) {
      const part = location.state.prefilledPart;
      setPartIds((prev) => prev.includes(part.id) ? prev : [...prev, part.id]);
      // Removed manual option setting
    }
  }, [location.state]);


  // Removed handleFetch
  // const handleFetch = async (type: string, setOptions: (val: SelectOption[]) => void) => { ... }

  useEffect(() => {
    if (location.state?.procedureData) {
      setLinkedProcedure(location.state.procedureData);
    } else {
      const queryProcId = searchParams.get("procedureId");
      if (queryProcId && !linkedProcedure && !isProcedureLoading) {
        setIsProcedureLoading(true);
        procedureService.fetchProcedureById(queryProcId)
          .then((proc) => { if (proc) setLinkedProcedure(proc); })
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
        } catch (e) { setRecurrenceRule(null); }
      } else {
        setRecurrenceRule(null);
      }

      if (data.location) {
        setLocationId(data.location.id);
        // setLocationOptions removed
      } else if (data.locationId) {
        setLocationId(data.locationId);
      }

      if (data.assets) {
        setAssetIds(data.assets.map((a: any) => a.id));
        // setAssetOptions removed
      } else { setAssetIds(data.assetIds || []); }

      if (data.teams) {
        setTeamIds(data.teams.map((t: any) => t.id));
        // setTeamOptions removed
      } else { setTeamIds(data.assignedTeamIds || []); }

      if (data.categories) {
        setCategoryIds(data.categories.map((c: any) => c.id));
        // setCategoryOptions removed
      } else { setCategoryIds(data.categoryIds || []); }

      if (data.parts) {
        setPartIds(data.parts.map((p: any) => p.id));
        // setPartOptions removed
      } else { setPartIds(data.partIds || []); }

      if (data.vendors) {
        setVendorIds(data.vendors.map((v: any) => v.id));
        // setVendorOptions removed
      } else { setVendorIds(data.vendorIds || []); }

      if (data.assignees) {
        setSelectedUsers(data.assignees.map((u: any) => u.id));
        // setAssigneeOptions removed
      } else { setSelectedUsers(data.assigneeIds || []); }

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

  // ✅ Handle prefillData from Assets offline prompt or other sources
  useEffect(() => {
    if (prefillData && !activeId) {
      // Only apply prefill if not editing an existing work order
      if (prefillData.assetIds && prefillData.assetIds.length > 0) {
        setAssetIds(prefillData.assetIds);
        // Removed manual option setting
      }
      if (prefillData.locationId) {
        setLocationId(prefillData.locationId);
        // Removed manual option setting
      }

    }
  }, [prefillData, activeId]);

  const handleEditLinkedProcedure = () => {
    if (linkedProcedure?.id) {
      const currentFormState = {
        workOrderName, description, locationId, estimatedTime, assetIds, selectedUsers, dueDate, startDate, selectedWorkType, selectedPriority, qrCodeValue, recurrenceRule, teamIds, categoryIds, partIds, vendorIds, procedureId: linkedProcedure.id,
        status
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
        status: (() => {
          if (status === "On Hold") return "on_hold";
          if (status === "In Progress") return "in_progress";
          if (status === "Completed") return "completed";
          return "open";
        })(),
        workType: selectedWorkType ? selectedWorkType.toLowerCase() : "reactive", // Fallback and ensure lowercase
        qrCode: qrCodeValue || undefined,
        priority: { None: "low", Low: "low", Medium: "medium", High: "high", Urgent: "urgent" }[selectedPriority] || "low",
        locationId: locationId || null,
        estimatedTimeHours: parseTimeToDecimal(estimatedTime), // Returns number
        assetIds, vendorIds, partIds, assignedTeamIds: teamIds, categoryIds, assigneeIds: selectedUsers,
        procedureIds: linkedProcedure ? [linkedProcedure.id] : [],
        // ✅ Date Fix: Pass state directly (should be ISO string from AssignmentAndScheduling)
        dueDate: dueDate || null,
        startDate: startDate || null
      };

      if (recurrenceRule) {
        const rule = typeof recurrenceRule === 'string' ? JSON.parse(recurrenceRule) : recurrenceRule;
        formState.recurrenceRule = rule;
      } else {
        // ✅ Explicitly send null if no recurrence rule (handles "Does not repeat" case)
        formState.recurrenceRule = null;
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



        const result = await dispatch(updateWorkOrder({ id: activeId, authorId, data: payload })).unwrap();
        toast.success("✅ Work order updated successfully");
        if (onCreate) onCreate(result); else navigate("/work-orders");
      } else {
        const result = await dispatch(createWorkOrder(formState)).unwrap();
        toast.success("✅ Work order created successfully");
        if (onCreate) onCreate(result); else navigate("/work-orders");
      }

    } catch (err: any) {
      console.error("❌ Error saving work order:", err);
      toast.error(err?.message || "Failed to save work order");
    } finally {
      setLoading(false);
    }
  };

  // ✅ REFRESH HANDLER FOR PANELS
  const handlePanelRefresh = async () => {
    if (activeId) {
      try {
        const resultAction = await dispatch(fetchWorkOrderById(activeId));
        if (fetchWorkOrderById.fulfilled.match(resultAction)) {
          setOriginalData(resultAction.payload);
          // We don't overwrite form fields (title, etc) to preserve any unsaved edits there?
          // Actually, if I'm in a panel, I replaced the view. 
          // When I come back, 'form' view re-renders.
          // State like 'workOrderName' is controlled state.
          // 'originalData' is background data. 
          // If I update 'originalData', the classification links (which use originalData.parts) will update.
        }
      } catch (e) {
        console.error("Failed to refresh after panel update", e);
      }
    }
  };

  if (loading || isProcedureLoading)
    return (<div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><p className="text-sm font-medium">Loading...</p></div>);

  // ✅ FIX: Use 'originalData' (fetched state) instead of 'existingWorkOrder' (prop) to ensure Edit Mode has data
  // ✅ ADDED onSaveSuccess to refresh parent data explicitly
  if (currentPanel === 'time') return <TimeOverviewPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={originalData} workOrderId={activeId} onSaveSuccess={handlePanelRefresh} />;
  if (currentPanel === 'cost') return <OtherCostsPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={originalData} workOrderId={activeId} onSaveSuccess={handlePanelRefresh} />;
  if (currentPanel === 'parts') return <UpdatePartsPanel onCancel={() => setCurrentPanel('form')} selectedWorkOrder={originalData} workOrderId={activeId} onSaveSuccess={handlePanelRefresh} />;

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
            locationOptions={locationOptions} isLocationsLoading={!filterData} onFetchLocations={() => { }} onCreateLocation={() => toast("Open Create Location Modal")}
            activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
          />
          <AssetsAndProcedures
            assetIds={assetIds} onAssetSelect={(val) => setAssetIds(val as string[])}
            assetOptions={assetOptions} isAssetsLoading={!filterData} onFetchAssets={() => { }} onCreateAsset={() => toast("Open Create Asset Modal")}
            activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
            linkedProcedure={linkedProcedure} onRemoveProcedure={() => setLinkedProcedure(null)} onPreviewProcedure={() => setIsPreviewOpen(true)} onEditProcedure={handleEditLinkedProcedure} setLinkedProcedure={setLinkedProcedure}
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
            teamIds={teamIds} onTeamSelect={(val) => setTeamIds(val as string[])} teamOptions={teamOptions} isTeamsLoading={!filterData} onFetchTeams={() => { }} onCreateTeam={() => toast("Open Create Team Modal")}
            categoryIds={categoryIds} onCategorySelect={(val) => setCategoryIds(val as string[])} categoryOptions={categoryOptions} isCategoriesLoading={!filterData} onFetchCategories={() => { }} onCreateCategory={() => toast("Open Create Category Modal")}
            partIds={partIds} onPartSelect={(val) => setPartIds(val as string[])} partOptions={partOptions} isPartsLoading={!filterData} onFetchParts={() => { }} onCreatePart={() => toast("Open Create Part Modal")}
            vendorIds={vendorIds} onVendorSelect={(val) => setVendorIds(val as string[])} vendorOptions={vendorOptions} isVendorsLoading={!filterData} onFetchVendors={() => { }} onCreateVendor={() => toast("Open Create Vendor Modal")}
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