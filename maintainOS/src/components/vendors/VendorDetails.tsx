"use client";
import { Button } from "../ui/button";
import {
  MoreHorizontal,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Cog,
  Globe,
  Users,
  Copy,
  X,
} from "lucide-react";
import { type Vendor } from "./vendors.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { deleteVendor } from "../../store/vendors";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useState } from "react";
import { NewContactModal, type ContactFormData } from "../vendors/VendorsForm/NewContactModal";

export function VendorDetails({
  vendor,
  onEdit,
}: {
  vendor?: Vendor;
  onEdit: (vendor: Vendor) => void;
}) {
  if (!vendor) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a vendor to view details.
      </div>
    );
  }

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [contacts, setContacts] = useState(vendor.contacts || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactFormData | null>(null);

  // ✅ Added delete modal states — no other code removed
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteContactEmail, setDeleteContactEmail] = useState<string | null>(null);

  const openDeleteModal = (email: string) => {
    setDeleteContactEmail(email);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteContact = () => {
    if (deleteContactEmail) {
      setContacts((prev) => prev.filter((c: any) => c.email !== deleteContactEmail));
      toast.success("Contact deleted!");
      setShowDeleteConfirm(false);
      setDeleteContactEmail(null);
    }
  };

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const handleDeleteVendor = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      dispatch(deleteVendor(id))
        .unwrap()
        .then(() => {
          toast.success("Vendor deleted successfully!");
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          alert("Failed to delete the vendor.");
        });
    }
  };

  const handleDeleteContact = (email: string) => {
    if (window.confirm("Delete this contact?")) {
      setContacts((prev) => prev.filter((c: any) => c.email !== email));
      toast.success("Contact deleted!");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      {/* Fixed Header */}
      <div className="flex-none border-b px-6 py-4 bg-white z-30 sticky top-0">
        <div className="flex items-center justify-between">
          {/* Left - Vendor Name */}
          <h2 className="text-lg font-semibold text-gray-900">
            {vendor.name || "Unnamed Vendor"}
          </h2>

          {/* Right - Buttons */}
          <div className="flex items-center gap-2 text-blue-600">
            {/* Copy Icon */}
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/vendors/${vendor.id}`;
                navigator.clipboard.writeText(url);
                toast.success("Vendor link copied!");
              }}
              className="p-2 hover:text-blue-800 flex items-center justify-center"
              title="Copy Vendor Link"
            >
              <Copy className="w-3 h-3" />
            </button>

            {/* New Purchase Order */}
            <button
              type="button"
              className="flex items-center gap-1 border border-blue-600 text-blue-600 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-blue-50"
            >
              + New Purchase Order
            </button>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => vendor && onEdit(vendor)}
              className="flex items-center gap-1 border border-blue-600 text-blue-600 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-blue-50"
            >
              Edit
            </button>

            {/* Dots Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-1">
                <DropdownMenuItem onClick={() => handleDeleteVendor(vendor.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 overflow-y-auto space-y-8 py-8 px-6 bg-white">
        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Description</h3>
          <p className="text-sm text-gray-600">{vendor.description || "No description available."}</p>
        </div>

        {/* Contact List */}
        <div>
          <h3 className="text-sm pt-6 mt-6 border-t border-gray-200 font-semibold text-gray-900 mb-3">
            Contact List
          </h3>

          {contacts && contacts.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-3">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-700 text-xs  uppercase ">
                  <tr>
                    <th className="px-6 py-3 text-left whitespace-nowrap">FULL NAME</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">ROLE</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">EMAIL</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">PHONE NUMBER</th>
                    <th className="px-6 py-3 text-right w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      {/* Full Name + Avatar */}
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{
                              backgroundColor: contact.color || "#EC4899",
                            }}
                          >
                            {contact.fullName
                              ? contact.fullName
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()
                              : "U"}
                          </div>
                          <span className="text-gray-900 text-sm">
                            {contact.fullName || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-3 text-gray-800 font-normal whitespace-nowrap">
                        {contact.role || "-"}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3 text-blue-600 font-medium whitespace-nowrap">
                        <a href={`mailto:${contact.email}`} className="hover:underline break-all">
                          {contact.email || "-"}
                        </a>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-3 text-blue-600 font-medium whitespace-nowrap">
                        <a href={`tel:${contact.phone}`} className="hover:underline">
                          {contact.phone || "-"}
                        </a>
                      </td>

                      {/* Edit/Delete Buttons */}
                      <td className="px-6 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingContact(contact);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {/* 🔹 Only this click updated to open modal */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(contact.email)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setEditingContact(null);
              setIsModalOpen(true);
            }}
            className="text-blue-600 font-normal hover:no-underline pl-0 h-auto"
          >
            <Plus className="h-4 w-4 mr-1" /> New Contact
          </Button>
        </div>

        {/* Parts */}
        <div>
          <h3 className="text-sm pt-6 mt-6 border-t border-gray-200 font-semibold text-gray-900 mb-3">
            Parts ({vendor.parts?.length || 0})
          </h3>
          <div className="space-y-3">
            {vendor.parts && vendor.parts.length > 0 ? (
              vendor.parts.map((part: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-gray-900 text-sm">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Cog className="h-4 w-4" />
                  </span>
                  {part}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No parts listed.</p>
            )}
          </div>
        </div>

        {/* Locations */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Locations ({vendor.locations?.length || 0})
          </h3>

          {vendor.locations && vendor.locations.length > 0 ? (
            <div className="space-y-3">
              {vendor.locations.map((loc: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full border border-blue-100 bg-blue-50">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-blue-600 text-sm font-medium cursor-pointer hover:underline">
                    {typeof loc === "string" ? loc : loc.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No locations found.</p>
          )}
        </div>

        {/* Vendor Type */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Vendor Type</h3>
          <p className="text-sm text-gray-800">Manufacturer</p>
        </div>

        {/* Attached Files */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Attached Files</h3>
          <div className="flex items-center gap-3 bg-gray-50 rounded-md p-3 w-fit">
            <div className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
              DOCX
            </div>
            <p className="text-sm text-gray-800">summaryweek.docx</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-6 border-t border-gray-200 flex flex-col items-start gap-4 pb-20">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Created By</span>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-gray-900">
                {user?.fullName || "User"}
              </span>
            </div>
            <span>on</span>
            <span className="text-gray-900">
              {vendor.createdAt
                ? new Date(vendor.createdAt).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  }) +
                  ", " +
                  new Date(vendor.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          borderTop: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          padding: "1rem 1.5rem",
        }}
      >
        <Button
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2 rounded-full px-6 h-10 font-semibold shadow-sm"
        >
          <Users className="h-4 w-4" />
          Use in New Work Order
        </Button>
      </div>

      {/* Contact Modal */}
      <NewContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingContact}
        onSave={(newContact) => {
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
          setIsModalOpen(false);
        }}
      />

      {/* ✅ Delete Confirmation Modal added */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Delete Contact</h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this contact? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteContact}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
