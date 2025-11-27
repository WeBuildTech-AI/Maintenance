"use client";

import { ArrowLeft, X, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DynamicSelect, type SelectOption } from "../../work-orders/NewWorkOrderForm/DynamicSelect";
import { fetchFilterData } from "./../../utils/filterDataFetcher";
import toast from "react-hot-toast";

// ✅ Redux Hooks & Thunks (Matching OtherCostsPanel)
import { useAppDispatch } from "../../../store/hooks";
import { addPartUsage, deletePartUsage } from "../../../store/workOrders/workOrders.thunks";

interface PartEntry {
  id: string;           // Unique Row ID
  partId: string;       // Part ID
  locationId: string;   // Location ID
  quantity: string;     // Amount
  isNew: boolean;       // True = Not saved to DB yet
}

interface UpdatePartsPanelProps {
  onCancel: () => void;
  workOrderId?: string;
  selectedWorkOrder?: any; 
}

export default function UpdatePartsPanel({ 
  onCancel, 
  workOrderId, 
  selectedWorkOrder 
}: UpdatePartsPanelProps) {
  
  const dispatch = useAppDispatch();

  // --- Local State ---
  const [rows, setRows] = useState<PartEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options State
  const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  
  // Loading States
  const [loadingParts, setLoadingParts] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // =========================================================
  // 1. INIT: Populate rows from Redux Store (selectedWorkOrder)
  // =========================================================
  useEffect(() => {
    if (selectedWorkOrder?.parts && Array.isArray(selectedWorkOrder.parts)) {
      // Map existing API data to UI rows
      const existingRows = selectedWorkOrder.parts.map((p: any) => ({
        id: p.id, // Real Database ID
        partId: p.partId || p.part?.id || "", 
        locationId: p.locationId || p.location?.id || "",
        quantity: String(p.quantity || 1),
        isNew: false // Marked as existing
      }));
      
      if (existingRows.length > 0) {
        setRows(existingRows);
      } else {
        // Default empty row if no parts exist
        setRows([{ id: "init-1", partId: "", locationId: "", quantity: "1", isNew: true }]);
      }
    } else {
      setRows([{ id: "init-1", partId: "", locationId: "", quantity: "1", isNew: true }]);
    }
  }, [selectedWorkOrder]);

  // =========================================================
  // 2. DATA FETCHING: Load Dropdown Options
  // =========================================================
  const handleFetchParts = async () => {
    if (partOptions.length > 0) return;
    setLoadingParts(true);
    try {
      const { data } = await fetchFilterData("parts");
      const normalized = Array.isArray(data) ? data.map((d: any) => ({
        id: d.id, name: d.name || d.title || "Unknown Part"
      })) : [];
      setPartOptions(normalized);
    } catch (e) { console.error(e); } finally { setLoadingParts(false); }
  };

  const handleFetchLocations = async () => {
    if (locationOptions.length > 0) return;
    setLoadingLocations(true);
    try {
      const { data } = await fetchFilterData("locations");
      const normalized = Array.isArray(data) ? data.map((d: any) => ({
        id: d.id, name: d.name || d.title || "Unknown Location"
      })) : [];
      setLocationOptions(normalized);
    } catch (e) { console.error(e); } finally { setLoadingLocations(false); }
  };

  // =========================================================
  // 3. UI ACTIONS
  // =========================================================

  const updateRow = (id: string, field: keyof PartEntry, value: string) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const addBlankRow = () => {
    setRows(prev => [...prev, { id: Date.now().toString(), partId: "", locationId: "", quantity: "1", isNew: true }]);
  };

  const handleAddNewPart = (partId: string) => {
    if (!partId) return;
    const newRow: PartEntry = {
      id: Date.now().toString(),
      partId: partId,
      locationId: "",
      quantity: "1",
      isNew: true
    };
    setRows(prev => [...prev, newRow]);
  };

  // =========================================================
  // 4. DELETE LOGIC (Matches deleteOtherCost pattern)
  // =========================================================
  const removeRow = async (id: string, isNew: boolean) => {
    // If it's the last empty row, just clear it
    if (rows.length === 1 && isNew) {
       updateRow(id, "partId", "");
       updateRow(id, "locationId", "");
       updateRow(id, "quantity", "1");
       return;
    }

    // ✅ API Call: Delete existing part
    if (!isNew && workOrderId) {
      if (confirm("Are you sure you want to remove this part?")) {
        try {
           // Dispatch Thunk
           await dispatch(deletePartUsage({ id: workOrderId, usageId: id })).unwrap();
           
           toast.success("Part removed");
           setRows(prev => prev.filter(r => r.id !== id));
        } catch (error: any) {
           console.error(error);
           toast.error(error?.message || "Failed to delete part");
        }
      }
      return;
    }

    // Local Delete: Just remove from state
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // =========================================================
  // 5. SAVE LOGIC (Matches addOtherCost pattern)
  // =========================================================
  const handleSave = async () => {
    if (!workOrderId) {
      toast.error("Work Order ID missing");
      return;
    }

    // ✅ Filter: Only send NEW items that have a selected Part
    const newItems = rows.filter(r => r.isNew && r.partId);

    if (newItems.length === 0) {
      onCancel(); // Nothing new to save
      return;
    }

    setIsSubmitting(true);
    try {
      // Construct Payload for API
      const payload = {
        items: newItems.map(item => ({
          partId: item.partId,
          locationId: item.locationId || "", 
          quantity: parseInt(item.quantity) || 1
        }))
      };

      // Dispatch Thunk
      await dispatch(addPartUsage({ id: workOrderId, data: payload })).unwrap();
      
      toast.success("Parts added successfully");
      onCancel();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to save parts");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // 6. RENDER
  // =========================================================
  return (
    <div 
      className="bg-white"
      style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100vh" }}
    >
      
      {/* Header */}
      <div 
        style={{ 
          flexShrink: 0, 
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          padding: "20px 32px", 
          borderBottom: "1px solid #f3f4f6" 
        }}
      >
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>Update Parts</h2>
      </div>

      {/* Body */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "32px"
        }}
      >
        
        {/* Headers */}
        {rows.some(r => !!r.partId) && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
            <label style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#111827" }}>
              Parts
            </label>
            <label style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#111827" }}>
              Location
            </label>
            <label style={{ width: "100px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>
              Unit
            </label>
            <div style={{ width: "32px" }}></div>
          </div>
        )}

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {rows.map((row) => {
            const isSelected = !!row.partId;

            return (
              <div key={row.id} style={{ width: "100%" }}>
                
                {!isSelected ? (
                  // Initial State: Full Width Dropdown
                  <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                        <DynamicSelect
                          name={`part-${row.id}`}
                          placeholder="Select part..."
                          options={partOptions}
                          loading={loadingParts}
                          value={row.partId}
                          onSelect={(val) => updateRow(row.id, "partId", val as string)}
                          onFetch={handleFetchParts}
                          activeDropdown={activeDropdown}
                          setActiveDropdown={setActiveDropdown}
                          className="w-full"
                        />
                    </div>
                    {rows.length > 1 && (
                        <button
                            onClick={() => removeRow(row.id, row.isNew)}
                            style={{ width: "32px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af" }}
                        >
                            <X size={18} />
                        </button>
                    )}
                  </div>
                ) : (
                  // Expanded State: 3 Columns
                  <div className="animate-in fade-in slide-in-from-bottom-1" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                      <DynamicSelect
                        name={`part-${row.id}`}
                        placeholder="Select part"
                        options={partOptions}
                        loading={loadingParts}
                        value={row.partId}
                        onSelect={(val) => updateRow(row.id, "partId", val as string)}
                        onFetch={handleFetchParts}
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
                        className="w-full"
                      />
                    </div>
                    <div style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                      <DynamicSelect
                        name={`loc-${row.id}`}
                        placeholder="Select location"
                        options={locationOptions}
                        loading={loadingLocations}
                        value={row.locationId}
                        onSelect={(val) => updateRow(row.id, "locationId", val as string)}
                        onFetch={handleFetchLocations}
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
                        className="w-full"
                      />
                    </div>
                    <div style={{ width: "100px" }}>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                        style={{ width: "100%", height: "42px", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "6px", outline: "none", fontSize: "14px" }}
                      />
                    </div>
                    <button
                      onClick={() => removeRow(row.id, row.isNew)}
                      style={{ width: "32px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af" }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Row Trigger */}
        <div style={{ marginTop: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div onClick={() => {}}>
                <DynamicSelect
                    name="add-part-trigger"
                    placeholder="Start typing..."
                    options={partOptions}
                    loading={loadingParts}
                    value="" 
                    onSelect={(val) => handleAddNewPart(val as string)}
                    onFetch={handleFetchParts}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    icon={<Search size={16} className="text-gray-400" />}
                    className="w-full"
                />
            </div>
        </div>

      </div>

      {/* Footer */}
      <div 
        style={{ 
          flexShrink: 0, 
          borderTop: "1px solid #f3f4f6", 
          padding: "20px 32px", 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "12px", 
          backgroundColor: "white" 
        }}
      >
        <button
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            fontSize: "14px",
            fontWeight: 500,
            padding: "8px 16px",
            cursor: "pointer",
            borderRadius: "6px"
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            fontSize: "14px",
            fontWeight: 500,
            padding: "8px 24px",
            cursor: "pointer",
            borderRadius: "6px",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            opacity: isSubmitting ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
}