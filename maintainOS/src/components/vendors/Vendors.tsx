import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useMatch, useNavigate } from "react-router-dom"; 
import type { AppDispatch } from "../../store";
import { updateVendor, vendorService } from "../../store/vendors";
import { FetchVendorsParams } from "../../store/vendors/vendors.types";
import type { ViewMode } from "../purchase-orders/po.types";

import { VendorHeaderComponent } from "./VendorHeader";
import { VendorForm } from "./VendorsForm/VendorForm";
import { VendorSidebar } from "./VendorSidebar";
import { VendorTable } from "./VendorTable";
import VendorDetails from "./VendorDetails/VendorDetails";
import { Vendor } from "../../store/vendors/vendors.types";

export function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | undefined>();
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Filter Params
  const [filterParams, setFilterParams] = useState<FetchVendorsParams>({
    page: 1, 
    limit: 50 
  });

  const dispatch = useDispatch<AppDispatch>();

  // 🔽 Router Hooks
  const navigate = useNavigate();
  const isCreateRoute = useMatch("/vendors/create");
  const isEditRoute = useMatch("/vendors/:vendorId/edit");
  
  // ✅ FIX: Capture the ID from the URL for View Mode
  const isViewRoute = useMatch("/vendors/:id");

  // 🔽 DERIVED STATE
  const isEditMode = !!isEditRoute;
  const vendorToEdit = isEditMode
    ? vendors.find((v) => v.id === isEditRoute.params.vendorId)
    : null;

  // ✅ DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleShowCreateForm = () => {
    navigate("/vendors/create");
  };

  const handleCancelForm = () => {
    navigate("/vendors");
  };

  // ✅ FETCH VENDORS
  const fetchVendorsData = useCallback(async () => {
    setLoading(true);
    let res: any;
    try {
      if (showDeleted) {
        res = await vendorService.fetchDeleteVendor();
      } else {
        const apiPayload = {
          ...filterParams,
          search: debouncedSearch || undefined 
        };
        res = await vendorService.fetchVendors(apiPayload);
      }
      setVendors(res || []);
    } catch (err) {
      console.error(err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch]);

  // Initial Fetch
  useEffect(() => {
    fetchVendorsData();
  }, [fetchVendorsData]);

  // ✅ HANDLER: Filter Change
  const handleFilterChange = useCallback((newParams: Partial<FetchVendorsParams>) => {
    setFilterParams((prev) => {
      const merged = { ...prev, ...newParams };
      if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
      return merged;
    });
  }, []);

  const refreshVendors = async () => {
     await fetchVendorsData();
  };

  // ✅ SELECTION SYNC LOGIC (The Fix)
  useEffect(() => {
    const urlId = isViewRoute?.params?.id;

    // 1. If URL has an ID (and it's not "create" page), FORCE that selection
    if (urlId && urlId !== "create") {
      if (selectedVendorId !== urlId) {
        setSelectedVendorId(urlId);
      }
    } 
    // 2. If NO URL ID, default to first vendor (Standard Panel Behavior)
    else if (vendors.length > 0 && !selectedVendorId && !isCreateRoute && !isEditRoute) {
      setSelectedVendorId(vendors[0].id);
    }
  }, [isViewRoute, vendors, selectedVendorId, isCreateRoute, isEditRoute]);


  // ✅ CREATE SUBMIT
  const handleCreateSubmit = async (newVendor: Vendor) => {
    setVendors((prev) => [newVendor, ...prev]); 
    setSelectedVendorId(newVendor.id);
    await refreshVendors(); 
    setSelectedVendorId(newVendor.id); 
    navigate(`/vendors/${newVendor.id}`); // Ensure URL updates
  };

  // ✅ UPDATE SUBMIT
  const handleUpdateSubmit = async (formData: any) => {
    if (!vendorToEdit) return;
    try {
      if (formData instanceof FormData) {
        await dispatch(
          updateVendor({
            id: vendorToEdit.id,
            data: formData,
          })
        ).unwrap();
        await refreshVendors();
        navigate(`/vendors/${vendorToEdit.id}`);
        return; 
      }

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
            ? { ...v, ...formData, contacts: formData.contacts || v.contacts }
            : v
        )
      );

      navigate(`/vendors/${vendorToEdit.id}`);
    } catch (e) {
      console.error("Update vendor failed:", e);
    }
  };

  const selectedVendor = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId) || null;
  }, [vendors, selectedVendorId]);

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
        setShowDeleted,
        setShowSettings,
        handleFilterChange
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden bg-muted/20">
        {viewMode === "panel" ? (
          <>
            <VendorSidebar
              vendors={vendors}
              selectedVendorId={selectedVendorId || ""}
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
                  onSuccess={async (newVendor) => {
                    setVendors((prev) => [newVendor, ...prev]); 
                    await refreshVendors(); 
                    setSelectedVendorId(newVendor.id);
                  }}
                />
              ) : selectedVendor ? (
                <div className="transition-opacity duration-200 h-full">
                  <VendorDetails
                    vendor={selectedVendor}
                    onEdit={(v) => navigate(`/vendors/${v.id}/edit`)}
                    onDeleteSuccess={async (deletedId) => {
                      setVendors((prev) =>
                        prev.filter((v) => v.id !== deletedId)
                      );
                      await refreshVendors();
                      setSelectedVendorId(undefined);
                      navigate("/vendors");
                    }}
                    fetchVendors={refreshVendors} // Added missing prop
                    restoreData={showDeleted ? "true" : ""} // Added Logic for restore
                    onClose={() => {}} // Placeholder if needed
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {loading ? "Loading..." : "Select a vendor to view details."}
                </div>
              )}
            </section>
          </>
        ) : (
          <VendorTable
            vendors={vendors}
            selectedVendorId={selectedVendorId}
            setIsSettingModalOpen={setIsSettingModalOpen}
            isSettingModalOpen={isSettingModalOpen}
            fetchVendors={fetchVendorsData}
            setShowDeleted={setShowDeleted}
            showDeleted={showDeleted}
            // Passing Pagination Props
            currentPage={filterParams.page || 1}
            itemsPerPage={filterParams.limit || 50}
            totalItems={vendors.length} // Note: Ideally API should return total count
            onParamsChange={handleFilterChange}
          />
        )}
      </div>
    </div>
  );
}