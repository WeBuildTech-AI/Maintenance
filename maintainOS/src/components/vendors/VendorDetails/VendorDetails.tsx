"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { deleteVendor, updateVendor } from "../../../store/vendors";
import {
  NewContactModal,
  type ContactFormData,
} from "../VendorsForm/NewContactModal";
import { type Vendor } from "../vendors.types";

import { VendorForm } from "../VendorsForm/VendorForm";

import { Briefcase, AlertTriangle, Factory, Truck } from "lucide-react";

import VendorHeader from "./VendorHeader";
import VendorContactList from "./VendorContactList";
import VendorPartsSection from "./VendorPartsSection";
import VendorLocationsSection from "./VendorLocationsSection";
import VendorFooter from "./VendorFooter";
import DeleteModal from "./DeleteModal";
import { VendorImages } from "./VendorImages";
import { VendorFiles } from "./VendorFiles";
import VendorAssetsSection from "./VendorAssetsSection";
import { format, subDays } from "date-fns";

import { WorkOrderHistoryChart } from "../../utils/WorkOrderHistoryChart";

interface VendorDetailsProps {
  vendor?: any;
  onEdit?: (vendor: Vendor) => void;
  onDeleteSuccess?: (id: string) => void;
  restoreData: string;
  onClose: () => void;
  fetchVendors: () => void;
}

type DateRange = { startDate: string; endDate: string };

export default function VendorDetails({
  vendor,
  onEdit,
  onDeleteSuccess,
  restoreData,
  onClose,
  fetchVendors,
}: VendorDetailsProps) {
  
  // =========================================================================
  // ✅ 1. ALL HOOKS MUST BE DECLARED AT THE TOP (Before any return)
  // =========================================================================
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // State: Edit Mode
  const [isEditing, setIsEditing] = useState(false);

  // State: Contacts (Handle null vendor safely inside initializer)
  const [contacts, setContacts] = useState<any[]>(() => {
    if (!vendor) return [];
    try {
      if (Array.isArray(vendor.contacts)) return vendor.contacts;
      if (typeof vendor.contacts === "string")
        return JSON.parse(vendor.contacts) || [];
      if (vendor.contacts && typeof vendor.contacts === "object")
        return [vendor.contacts];
      return [];
    } catch {
      return [];
    }
  });

  // State: Modals & UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactFormData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteContactEmail, setDeleteContactEmail] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement | null>(null);

  // State: Chart Date Ranges
  const [chartDateRanges, setChartDateRanges] = useState<Record<string, DateRange>>({
    "work-order-history": {
      startDate: format(subDays(new Date(), 7), "MM/dd/yyyy"),
      endDate: format(new Date(), "MM/dd/yyyy"),
    },
  });

  // Effect: Reset editing when vendor changes
  useEffect(() => {
    setIsEditing(false);
  }, [vendor?.id]);

  // Effect: Update contacts when vendor prop changes
  useEffect(() => {
    if (vendor?.contacts) {
      if (Array.isArray(vendor.contacts)) setContacts(vendor.contacts);
    }
  }, [vendor]);

  // Effect: Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showDeleteConfirm &&
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDeleteConfirm]);

  // =========================================================================
  // ✅ 2. CONDITIONAL RETURNS (Only AFTER all hooks are declared)
  // =========================================================================

  if (!vendor) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a vendor to view details.
      </div>
    );
  }

  // --- Handlers ---
  const openDeleteModal = (email: string) => {
    setDeleteContactEmail(email);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteContact = () => {
    if (deleteContactEmail) {
      setContacts((prev) => prev.filter((c) => c.email !== deleteContactEmail));
      toast.success("Contact deleted!");
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteVendor = (id: string) => {
    dispatch(deleteVendor(id))
      .unwrap()
      .then(() => {
        toast.success("Vendor deleted successfully!");
        if (onDeleteSuccess) onDeleteSuccess(id);
      })
      .catch(() => toast.error("Failed to delete vendor."));
  };

  // ✅ UPDATED: Pass vendor details in state
  const handleUseInWorkOrder = () => {
    navigate("/work-orders/create", {
      state: {
        preselectedVendor: {
          id: vendor.id,
          name: vendor.companyName || vendor.name || "Unknown Vendor",
        },
      },
    });
  };

  const handleDateRangeChange = (id: string, start: Date, end: Date) => {
    setChartDateRanges((prev) => ({
      ...prev,
      [id]: {
        startDate: format(start, "MM/dd/yyyy"),
        endDate: format(end, "MM/dd/yyyy"),
      },
    }));
  };

  // --- Render Helpers ---
  const getVendorTypeListItemStyles = (type?: string) => {
    const t = type?.toLowerCase();
    if (t === "manufacturer") {
      return {
        iconContainer: "border-emerald-100 bg-emerald-50",
        iconColor: "text-emerald-600",
        icon: <Factory className="h-5 w-5" />,
        label: "Manufacturer",
      };
    }
    if (t === "distributor") {
      return {
        iconContainer: "border-blue-100 bg-blue-50",
        iconColor: "text-blue-600",
        icon: <Truck className="h-5 w-5" />,
        label: "Distributor",
      };
    }
    return {
      iconContainer: "border-gray-200 bg-gray-100",
      iconColor: "text-gray-500",
      icon: <Briefcase className="h-5 w-5" />,
      label: type ? type.charAt(0).toUpperCase() + type.slice(1) : "Standard",
    };
  };

  const vendorTypeStyle = getVendorTypeListItemStyles(vendor.vendorType);
  const filters = { vendorIds: vendor.id };

  // =========================================================================
  // ✅ 3. RENDER (Edit Mode vs View Mode)
  // =========================================================================

  if (isEditing) {
    return (
      <div className="flex h-full flex-col bg-white rounded-lg border overflow-hidden">
        <div className="flex-1 overflow-hidden relative bg-gray-50 flex flex-col">
            <VendorForm
            initialData={vendor}
            onCancel={() => setIsEditing(false)} // Go back to details
            onSubmit={(data: FormData) => {
                return dispatch(updateVendor({ id: vendor.id, data })).unwrap();
            }}
            onSuccess={() => {
                fetchVendors();
                setIsEditing(false); // Switch back to details view
            }}
            />
        </div>
      </div>
    );
  }

  // --- VIEW MODE ---
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border relative bg-white">
      {/* Header */}
      <div className="flex-none z-20 border-b bg-white shadow-sm">
        <VendorHeader
          vendor={vendor}
          onEdit={() => setIsEditing(true)} 
          handleDeleteVendor={handleDeleteVendor}
          restoreData={restoreData}
          onClose={onClose}
          fetchVendors={fetchVendors}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-8 py-8 px-6 bg-white">
        {/* Deleted Warning */}
        {vendor.isDeleted && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <span>
              This vendor is currently marked as deleted. Restore to edit.
            </span>
          </div>
        )}

        {/* General Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Vendor Type
            </h3>
            <div className="flex items-center gap-3 bg-gray-50 rounded-md p-3">
              <div
                className={`flex items-center justify-center h-10 w-10 rounded-full border ${vendorTypeStyle.iconContainer}`}
              >
                <span className={vendorTypeStyle.iconColor}>
                  {vendorTypeStyle.icon}
                </span>
              </div>
              <span className="text-gray-900 text-sm font-medium">
                {vendorTypeStyle.label}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Description
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {vendor.description || "No description available."}
            </p>
          </div>
        </div>

        {/* Sections */}
        <VendorContactList
          contacts={contacts}
          setEditingContact={setEditingContact}
          setIsModalOpen={setIsModalOpen}
          openDeleteModal={openDeleteModal}
        />
        <VendorAssetsSection vendor={vendor} />
        <VendorLocationsSection vendor={vendor} />
        <VendorPartsSection vendor={vendor} />

        <WorkOrderHistoryChart
          id="work-order-history"
          title="Work Order History"
          workOrderHistory={vendor?.workOrderIds}
          filters={filters}
          dateRange={chartDateRanges["work-order-history"]} 
          onDateRangeChange={handleDateRangeChange} 
          groupByField="createdAt"
          lineName="Created"
          lineColor="#0091ff"
        />

        <VendorImages vendor={vendor} />
        <VendorFiles vendor={vendor} />
        <VendorFooter user={user} vendor={vendor} />

        <div style={{ height: 60 }} />
      </div>

      {/* Floating Action Button */}
      <VendorFooter.Button onClick={handleUseInWorkOrder} />

      {/* --- Modals --- */}
      <NewContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingContact}
        vendorId={vendor.id}
        onSave={async (newContact) => {
          try {
            if (editingContact) {
              setContacts((prev) =>
                prev.map((c) =>
                  c.email === editingContact.email ? newContact : c
                )
              );
              toast.success("Contact updated!");
            } else {
              setContacts((prev) => [...prev, newContact]);
              toast.success("New contact added!");
            }
            fetchVendors();
            setIsModalOpen(false);
          } catch (error) {
            console.error(error);
          }
        }}
      />

      {showDeleteConfirm && (
        <DeleteModal
          modalRef={modalRef}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteContact}
        />
      )}
    </div>
  );
}