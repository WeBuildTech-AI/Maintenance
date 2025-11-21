import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useMatch, useNavigate } from "react-router-dom"; // <-- ADDED
import type { AppDispatch } from "../../store";
import { updateVendor, vendorService } from "../../store/vendors";
import type { ViewMode } from "../purchase-orders/po.types";

import { VendorHeaderComponent } from "./VendorHeader";
import { VendorForm } from "./VendorsForm/VendorForm";
import { VendorSidebar } from "./VendorSidebar";
import { VendorTable } from "./VendorTable";
import VendorDetails from "./VendorDetails/VendorDetails";

export function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState();
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);


  // ✅ ADDED FILTER STATE
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );

  const dispatch = useDispatch<AppDispatch>();

  // 🔽 ADDED: Router Hooks
  const navigate = useNavigate();
  const isCreateRoute = useMatch("/vendors/create");
  const isEditRoute = useMatch("/vendors/:vendorId/edit");

  // 🔽 DERIVED STATE
  const isEditMode = !!isEditRoute;
  const vendorToEdit = isEditMode
    ? vendors.find((v) => v.id === isEditRoute.params.vendorId)
    : null;

  const handleShowCreateForm = () => {
    navigate("/vendors/create");
  };

  const handleCancelForm = () => {
    navigate("/vendors");
  };

  // ✅ ADDED FIX: Real-time sidebar refresh after creating vendor
  const handleCreateSubmit = async (newVendor: Vendor) => {
    setVendors((prev) => [newVendor, ...prev]); // add instantly
    setSelectedVendorId(newVendor.id);
    await refreshVendors(); // fetch fresh data
    setSelectedVendorId(newVendor.id); // keep selected vendor highlighted
    navigate("/vendors");
  };

  // ✅ ADDED: refresh vendors helper (keeps sidebar in sync after create/edit)
  const refreshVendors = async () => {
    try {
      const res = await vendorService.fetchVendors();
      setVendors(() => [...res]); //  force re-render with new array reference
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch vendors on mount
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorService.fetchVendors();
      // console.log("📦 Vendor API response:", res);
      setVendors(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVendors();
  }, []);

  // ✅ UPDATED FILTER LOGIC (location-based filter)
  const filteredVendors = useMemo(() => {
    let list = vendors;

    // 🔹 LOCATION FILTER
    const selectedLocationIds = activeFilters["location"] || [];
    if (selectedLocationIds.length > 0) {
      list = list.filter((vendor: any) => {
        const vendorLocIds = (vendor.locations || []).map((loc: any) =>
          typeof loc === "string" ? loc : loc?.id || ""
        );
        return vendorLocIds.some((id: string) =>
          selectedLocationIds.includes(id)
        );
      });
    }

    // 🔹 SEARCH FILTER
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(query) ||
          vendor.category?.toLowerCase().includes(query) ||
          vendor.services?.some((s) => s.toLowerCase().includes(query))
      );
    }

    return list;
  }, [vendors, searchQuery, activeFilters]);

  // ✅ KEEP vendor details visible even if filtered out
  const selectedVendor = useMemo(() => {
    const vendor = vendors.find((v) => v.id === selectedVendorId);
    return vendor || null;
  }, [vendors, selectedVendorId]);

  // ✅ Ensure at least one selected
  useEffect(() => {
    if (vendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(vendors[0].id);
    }
  }, [vendors, selectedVendorId]);

  // console.log(selectedVendor, "selectedVendor");

  // ✅ MODIFIED: submit handler for update
  const handleUpdateSubmit = async (formData: any) => {
    if (!vendorToEdit) return;
    try {
      // ✅ NEW: if formData is FormData, send it directly (don’t try to read properties)
      if (formData instanceof FormData) {
        await dispatch(
          updateVendor({
            id: vendorToEdit.id,
            data: formData,
          })
        ).unwrap();

        // ✅ refresh sidebar list after update
        await refreshVendors();

        navigate("/vendors");
        return; // ensure we don't run the JSON path below
      }

      // 🔽 ORIGINAL JSON PATH (left intact, not removed)
      await dispatch(
        updateVendor({
          id: vendorToEdit.id,
          data: {
            name: formData.name,
            description: formData.description,
            color: formData.color,
            contacts: formData.contacts || {},
          },
        })
      ).unwrap();

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorToEdit.id
            ? {
                ...v,
                name: formData.name,
                description: formData.description,
                color: formData.color,
                contacts: formData.contacts || v.contacts,
              }
            : v
        )
      );

      navigate("/vendors");
    } catch (e) {
      console.error("Update vendor failed:", e);
    }
  };

  // ✅ Check if vendor is visible in filtered list (for dimming)
  const isVendorVisible = filteredVendors.some(
    (v) => v.id === selectedVendorId
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {VendorHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        handleShowCreateForm,
        setIsSettingModalOpen,
        setShowSettings,
        setActiveFilters,
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden bg-muted/20">
        {viewMode === "panel" ? (
          <>
            <VendorSidebar
              vendors={filteredVendors}
              selectedVendorId={selectedVendorId}
              setSelectedVendorId={setSelectedVendorId}
              loading={loading}
            />
            <section className="flex-1 overflow-auto">
              {isCreateRoute || isEditRoute ? (
                <VendorForm
                  initialData={vendorToEdit}
                  onSubmit={
                    isEditMode ? handleUpdateSubmit : handleCreateSubmit
                  }
                  onCancel={handleCancelForm}
                  setVendors={setVendors}
                  setSelectedVendorId={setSelectedVendorId}
                  // ✅ ADDED: now VendorForm tells parent when new vendor created
                  onSuccess={async (newVendor) => {
                    setVendors((prev) => [newVendor, ...prev]); // instant UI
                    await refreshVendors(); // sync with backend
                    setSelectedVendorId(newVendor.id);
                  }}
                />
              ) : selectedVendor ? (
                <div
                  className={`transition-opacity duration-200 ${
                    !isVendorVisible ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <VendorDetails
                    vendor={selectedVendor}
                    onEdit={(v) => navigate(`/vendors/${v.id}/edit`)}
                    onDeleteSuccess={async (deletedId) => {
                      // ✅ ADDED REAL-TIME DELETE UPDATE
                      setVendors((prev) =>
                        prev.filter((v) => v.id !== deletedId)
                      );
                      await refreshVendors();
                      setSelectedVendorId("");
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Select a vendor to view details.
                </div>
              )}
            </section>
          </>
        ) : (
          <VendorTable
            vendors={filteredVendors}
            selectedVendorId={selectedVendorId}
            setIsSettingModalOpen={setIsSettingModalOpen}
            isSettingModalOpen={isSettingModalOpen}
            fetchVendors={fetchVendors}
          />
        )}
      </div>
    </div>
  );
}
