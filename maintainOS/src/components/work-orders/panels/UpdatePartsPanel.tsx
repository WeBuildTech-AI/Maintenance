"use client";

import { ArrowLeft, X, Loader2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { DynamicSelect, type SelectOption } from "../../work-orders/NewWorkOrderForm/DynamicSelect";
import { fetchFilterData } from "./../../utils/filterDataFetcher";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../../store/hooks";
import { addPartUsage, deletePartUsage } from "../../../store/workOrders/workOrders.thunks";

interface PartEntry {
  id: string;
  partId: string;
  locationId: string;
  quantity: string;
  isNew: boolean;
}

interface UpdatePartsPanelProps {
  onCancel: () => void;
  workOrderId?: string;
  selectedWorkOrder?: any;
  onSaveSuccess?: () => void; // ✅ Callback for parent refresh
}

export default function UpdatePartsPanel({ 
  onCancel, 
  workOrderId, 
  selectedWorkOrder,
  onSaveSuccess // ✅ Destructure prop
}: UpdatePartsPanelProps) {
  
  const dispatch = useAppDispatch();

  // --- Local State ---
  const [rows, setRows] = useState<PartEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Options State
  const [partOptions, setPartOptions] = useState<SelectOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  
  const [loadingParts, setLoadingParts] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // =========================================================
  // 1. INIT
  // =========================================================
  useEffect(() => {
    if (hasInitialized) return;

    if (selectedWorkOrder) {
      let initialRows: PartEntry[] = [];

      if (selectedWorkOrder.parts && Array.isArray(selectedWorkOrder.parts)) {
        initialRows = selectedWorkOrder.parts
          .filter((p: any) => p && (p.partId || p.part?.id))
          .map((p: any) => ({
            id: p.id || Math.random().toString(), 
            partId: p.partId || p.part?.id, 
            locationId: p.locationId || p.location?.id || "",
            quantity: String(p.quantity || 1),
            isNew: false 
          }));
      }

      if (initialRows.length === 0) {
        initialRows = [{
          id: "default-row-1",
          partId: "",
          locationId: "",
          quantity: "1",
          isNew: true
        }];
      }

      setRows(initialRows);
      setHasInitialized(true);
    }
  }, [selectedWorkOrder, hasInitialized]);

  // =========================================================
  // 2. DATA FETCHING
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

  const handleAddRow = () => {
    const newRow: PartEntry = {
      id: Date.now().toString(),
      partId: "",
      locationId: "",
      quantity: "1",
      isNew: true
    };
    setRows(prev => [...prev, newRow]);
  };

  // =========================================================
  // 4. DELETE LOGIC
  // =========================================================
  const removeRow = async (id: string, isNew: boolean) => {
    // Prevent deleting the last empty row if it's the only one
    if (rows.length === 1 && !rows[0].partId && isNew) return;

    if (!isNew && workOrderId) {
      if (confirm("Are you sure you want to remove this part?")) {
        try {
           await dispatch(deletePartUsage({ id: workOrderId, usageId: id })).unwrap();
           toast.success("Part removed");
           
           // ✅ Refresh Parent immediately after deletion
           if (onSaveSuccess) onSaveSuccess();
           
           setRows(prev => prev.filter(r => r.id !== id));
        } catch (error: any) {
           console.error(error);
           toast.error(error?.message || "Failed to delete part");
        }
      }
      return;
    }
    // Just remove from local state if it's a new unsaved row
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // =========================================================
  // 5. SAVE LOGIC
  // =========================================================
  const handleSave = async () => {
    if (!workOrderId) {
      toast.error("Work Order ID missing");
      return;
    }

    const newItems = rows.filter(r => r.isNew && r.partId);

    if (newItems.length === 0) {
      onCancel(); 
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: newItems.map(item => ({
          partId: item.partId,
          locationId: item.locationId || "", 
          quantity: parseInt(item.quantity) || 1
        }))
      };

      await dispatch(addPartUsage({ id: workOrderId, data: payload })).unwrap();
      
      toast.success("Parts added successfully");
      
      // ✅ Trigger Parent Refresh and Close Panel
      if (onSaveSuccess) {
          onSaveSuccess(); 
      }
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
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>Add Parts</h2>
      </div>

      {/* Body */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "32px",
          paddingBottom: "200px" 
        }}
      >
        
        {/* Headers */}
        {rows.some(r => !!r.partId) && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
            <label style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#111827" }}>Parts</label>
            <label style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#111827" }}>Location</label>
            <label style={{ width: "100px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>Qty</label>
            <div style={{ width: "32px" }}></div>
          </div>
        )}

        {/* Rows List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {rows.map((row, index) => {
             const isSelected = !!row.partId;
             const isActive = activeDropdown && (activeDropdown.includes(row.id));
             const zIndexStyle = isActive ? { zIndex: 50, position: "relative" as const } : { zIndex: 10 - index, position: "relative" as const };

             return (
              <div key={row.id} style={{ width: "100%", ...zIndexStyle }}>
                
                {!isSelected ? (
                  // ✅ STATE 1: Full Width Dropdown (Initial State)
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
                  // ✅ STATE 2: 3-Column Layout (Selected State)
                  <div className="animate-in fade-in slide-in-from-bottom-1" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    
                    {/* 1. Part Name */}
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

                    {/* 2. Location */}
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

                    {/* 3. Quantity */}
                    <div style={{ width: "100px" }}>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                        style={{ width: "100%", height: "42px", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "6px", outline: "none", fontSize: "14px" }}
                      />
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeRow(row.id, row.isNew)}
                      style={{ width: "32px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", color: "#ef4444" }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
             );
          })}
        </div>

        {/* ✅ "Add Part" Button */}
        <div style={{ marginTop: "24px" }}>
            <button
                onClick={handleAddRow}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#2563eb",
                    background: "transparent",
                    border: "1px dashed #2563eb",
                    borderRadius: "6px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    width: "100%",
                    justifyContent: "center"
                }}
            >
                <Plus size={16} />
                Add Part
            </button>
        </div>

      </div>

      {/* Footer Actions */}
      <div 
        style={{ 
          flexShrink: 0, 
          borderTop: "1px solid #f3f4f6", 
          padding: "20px 32px", 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "12px", 
          backgroundColor: "white",
          zIndex: 60, 
          position: "relative"
        }}
      >
        <button
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
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
          disabled={isSubmitting || rows.filter(r => r.isNew && r.partId).length === 0}
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
            opacity: (isSubmitting || rows.filter(r => r.isNew && r.partId).length === 0) ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Saving..." : "Save Parts"}
        </button>
      </div>
    </div>
  );
}