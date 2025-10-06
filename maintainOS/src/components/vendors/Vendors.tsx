import { useEffect, useMemo, useState } from "react";
import { vendorService } from "../../store/vendors";
import type { ViewMode } from "../purchase-orders/po.types";
import { VendorForm } from "./VendorsForm/VendorForm";
import { VendorHeaderComponent } from "./VendorHeader";
import { mockVendors, type Vendor } from "./vendors.types";
import { VendorSidebar } from "./VendorSidebar";
import { VendorTable } from "./VendorTable";
import { VendorDetails } from "./VendorDetails";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { updateVendor } from "../../store/vendors";
import { useNavigate, useMatch } from "react-router-dom"; // <-- ADDED

export function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(
    mockVendors[0]?.id ?? ""
  );
  // ❌ REMOVED: [isCreatingVendor, setIsCreatingVendor]
  // ❌ REMOVED: [editingVendor, setEditingVendor]
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

  const handleCreateSubmit = (newVendor: Vendor) => {
    setVendors((prev) => [newVendor, ...prev]);
    setSelectedVendorId(newVendor.id);
    navigate("/vendors");
  };

  // Fetch vendors on mount
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await vendorService.fetchVendors(10, 1, 0);
        setVendors(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Filter vendors by search query
  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const query = searchQuery.toLowerCase();
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query) ||
        vendor.services.some((s) => s.toLowerCase().includes(query))
    );
  }, [vendors, searchQuery]);

  // Ensure selectedVendorId is valid
  useEffect(() => {
    if (filteredVendors.length === 0) return;
    if (!filteredVendors.some((v) => v.id === selectedVendorId)) {
      setSelectedVendorId(filteredVendors[0].id);
    }
  }, [filteredVendors, selectedVendorId]);

  const selectedVendor =
    filteredVendors.find((v) => v.id === selectedVendorId) ??
    filteredVendors[0];

  console.log(selectedVendor, "selectedVendor");

  // ✅ MODIFIED: submit handler for update
  const handleUpdateSubmit = async (formData: any) => {
    if (!vendorToEdit) return;
    try {
      await dispatch(
        updateVendor({
          id: vendorToEdit.id,
          data: {
            // map minimal fields you have in the form
            name: formData.name,
            description: formData.description,
            color: formData.color,
            contacts: formData.contacts || formData.contact || {},
            // you can extend this mapping as needed later
          },
        })
      ).unwrap();

      // Optimistically update local list so UI reflects immediately
      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorToEdit.id
            ? {
                ...v,
                name: formData.name,
                description: formData.description,
                color: formData.color,
                contacts: formData.contacts || formData.contact || v.contacts,
              }
            : v
        )
      );

      navigate("/vendors"); // Navigate away after successful update
    } catch (e) {
      console.error("Update vendor failed:", e);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {VendorHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        handleShowCreateForm, // 👈 New URL-driven handler
        setShowSettings
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
              {isCreateRoute || isEditRoute ? ( // 👈 Check both URL routes
                <VendorForm
                  // 🔽 Conditional props based on route
                  initialData={vendorToEdit}
                  onSubmit={isEditMode ? handleUpdateSubmit : handleCreateSubmit}
                  onCancel={handleCancelForm}
                  // These props are no longer required/used here, relying on onSubmit/onCancel
                  setVendors={setVendors}
                  setSelectedVendorId={setSelectedVendorId}
                />
              ) : selectedVendor ? (
                <VendorDetails
                  vendor={selectedVendor}
                  // 🔽 Updated onEdit to navigate to the new parameterized URL
                  onEdit={(v) => navigate(`/vendors/${v.id}/edit`)}
                />
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
          />
        )}
      </div>
    </div>
  );
}