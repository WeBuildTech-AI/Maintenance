"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { deleteVendor } from "../../../store/vendors";
import {
  NewContactModal,
  type ContactFormData,
} from "../VendorsForm/NewContactModal";
import { type Vendor } from "../vendors.types";

import VendorHeader from "./VendorHeader";
import VendorContactList from "./VendorContactList";
import VendorPartsSection from "./VendorPartsSection";
import VendorLocationsSection from "./VendorLocationsSection";
import VendorFooter from "./VendorFooter";
import DeleteModal from "./DeleteModal";
import { VendorImages } from "./VendorImages";
import { VendorFiles } from "./VendorFiles";

interface VendorDetailsProps {
  vendor?: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDeleteSuccess?: (id: string) => void;
}

export default function VendorDetails({
  vendor,
  onEdit,
  onDeleteSuccess,
}: VendorDetailsProps) {
  if (!vendor) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a vendor to view details.
      </div>
    );
  }

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [contacts, setContacts] = useState<any[]>(() => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] =
    useState<ContactFormData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteContactEmail, setDeleteContactEmail] = useState<string | null>(
    null
  );
  const modalRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      <VendorHeader
        vendor={vendor}
        onEdit={onEdit}
        handleDeleteVendor={handleDeleteVendor}
      />

      <div className="min-h-0 flex-1 overflow-y-auto space-y-8 py-8 px-6 bg-white">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Description</h3>
          <p className="text-sm text-gray-600">
            {vendor.description || "No description available."}
          </p>
        </div>

        <VendorContactList
          contacts={vendor.contacts}
          setEditingContact={setEditingContact}
          setIsModalOpen={setIsModalOpen}
          openDeleteModal={openDeleteModal}
        />

        <VendorPartsSection vendor={vendor} />
        <VendorImages vendor={vendor} />
        <VendorLocationsSection vendor={vendor} />
        <VendorFiles vendor={vendor} />
        <VendorFooter user={user} vendor={vendor} />
      </div>

      <VendorFooter.Button />

      {/* ✅ Pass vendor.id here */}
      <NewContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingContact}
        vendorId={vendor.id}
        onSave={async (newContact) => {
          try {
            if (editingContact) {
              setContacts((prev) =>
                prev.map((c) => (c.email === editingContact.email ? newContact : c))
              );
              toast.success("Contact updated!");
            } else {
              setContacts((prev) => [...prev, newContact]);
              toast.success("New contact added!");
            }

            // ✅ NEW — refresh vendor details from backend instantly
            const updatedVendor = await vendorService.fetchVendorById(vendor.id);
            if (updatedVendor) {
              // Replace current vendor’s contact list right away
              vendor.contacts = updatedVendor.contacts;
              setContacts(
                Array.isArray(updatedVendor.contacts)
                  ? updatedVendor.contacts
                  : [updatedVendor.contacts]
              );
            }

            setIsModalOpen(false);
          } catch (error) {
            console.error("❌ Error refreshing vendor:", error);
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
