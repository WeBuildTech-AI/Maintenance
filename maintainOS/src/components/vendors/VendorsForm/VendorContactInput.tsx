import { useState, useEffect } from "react";
import { Edit3, Trash2, Plus, X } from "lucide-react";
import { Button } from "../../ui/button";
import { NewContactModal, type ContactFormData } from "./NewContactModal";

interface VendorContactInputProps {
  initialContacts?: ContactFormData[]; // ✅ Added for Edit Mode
  onContactsChange?: (contacts: ContactFormData[]) => void;
}

export function VendorContactInput({ initialContacts = [], onContactsChange }: VendorContactInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState<ContactFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ✅ Sync initial data when editing (Allow empty array)
  useEffect(() => {
    if (initialContacts) {
      setContacts(initialContacts);
    }
  }, [initialContacts]);

  const syncUp = (next: ContactFormData[]) => {
    setContacts(next);
    if (onContactsChange) onContactsChange(next);
  };

  const handleSaveContact = (newContact: ContactFormData) => {
    const normalized: any = {
      fullName: newContact.fullName || "",
      role: newContact.role || "",
      email: newContact.email || "",
      phoneNumber: newContact.phoneNumber || (newContact as any).phone || "",
      phoneExtension: newContact.phoneExtension || "",
      contactColor:
        newContact.contactColor || (newContact as any).contactColour || "#EC4899",
    };

    // ✅ PRESERVE ID if it's an edit
    if (editingIndex !== null) {
      const original = contacts[editingIndex];
      if ((original as any).id) normalized.id = (original as any).id;
      if ((original as any)._id) normalized._id = (original as any)._id;

      const next = contacts.map((c, i) => (i === editingIndex ? normalized : c));
      syncUp(next);
      setEditingIndex(null);
    } else {
      const next = [...contacts, normalized];
      syncUp(next);
    }
  };

  const handleEditContact = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteContact = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const next = contacts.filter((_, i) => i !== deleteIndex);
      syncUp(next);
      setDeleteIndex(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
    setShowDeleteConfirm(false);
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <>
      <div className="px-6 pt-6">
        <h3 className="text-sm pt-2 font-semibold text-gray-900 mb-3">
          Contact List
        </h3>

        {contacts.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mt-4 mb-6">
            <div
              className={`overflow-x-auto`}
            >
              <style>{`
                div::-webkit-scrollbar { height: 6px; }
                div::-webkit-scrollbar-thumb {
                  background: linear-gradient(to right, #fde047, #facc15);
                  border-radius: 9999px;
                }
                div::-webkit-scrollbar-track {
                  background: #fefce8;
                  border-radius: 9999px;
                }
              `}</style>

              <table className="min-w-full text-sm border-collapse table-fixed">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    {/* ✅ Assigned Widths to prevent awkward spacing */}
                    <th className="px-6 py-3 text-left font-medium w-1/4">FULL NAME</th>
                    <th className="px-6 py-3 text-left font-medium w-1/6">ROLE</th>
                    <th className="px-6 py-3 text-left font-medium w-1/3">EMAIL</th>
                    <th className="px-6 py-3 text-left font-medium w-1/6">PHONE NUMBER</th>
                    {/* ✅ Fixed Actions Column Width & Reduced Padding */}
                    <th className="pl-6 pr-4 py-3 text-right font-medium w-[1%] whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {contacts.map((c, index) => {
                    const initials = getInitials(c.fullName || "");
                    const color = c.contactColor || "#EC4899";
                    const phone = c.phoneNumber || "";
                    const extension = c.phoneExtension?.replace(/^x?/, "") || "";

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-3 whitespace-nowrap truncate">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex items-center justify-center text-white font-medium text-sm rounded-full h-8 w-8 flex-shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              {initials}
                            </div>
                            <span className="text-gray-900 text-sm font-medium capitalize truncate">
                              {c.fullName || "-"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-3 text-gray-800 font-normal whitespace-nowrap truncate">
                          {c.role || "-"}
                        </td>

                        <td className="px-6 py-3 text-blue-600 font-medium break-all truncate">
                          {c.email ? (
                            <a href={`mailto:${c.email}`} className="hover:underline">
                              {c.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* 📞 Phone Number + Extension */}
                        <td className="px-6 py-3 text-blue-600 font-medium whitespace-nowrap truncate">
                          {phone ? (
                            <div className="flex flex-col leading-tight">
                              <a href={`tel:${phone}`} className="hover:underline text-blue-600 font-medium">
                                {phone}
                              </a>
                              {extension && (
                                <span className="text-gray-500 text-xs mt-0.5">
                                  x{extension}
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* ✏️🗑️ Actions - Fixed Alignment */}
                        <td className="pl-6 pr-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button" // ✅ Prevent submit
                              onClick={() => handleEditContact(index)}
                              className="text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button" // ✅ Prevent submit
                              onClick={() => handleDeleteContact(index)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ➕ New Contact Button */}
        {/* ✅ CRITICAL FIX: added type="button" to prevent form submission */}
        <Button
          type="button" 
          variant="link"
          size="sm"
          onClick={() => {
            setEditingIndex(null);
            setIsModalOpen(true);
          }}
          className="text-blue-600 font-normal hover:no-underline pl-0 h-auto"
        >
          <Plus className="h-4 w-4 mr-1" /> New Contact
        </Button>
      </div>

      {/* 🧩 Contact Modal */}
      <NewContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        onSave={handleSaveContact}
        initialData={editingIndex !== null ? contacts[editingIndex] : null}
      />

      {/* 🗑️ Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Delete Contact</h2>
              <button onClick={cancelDelete} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this contact? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button" // ✅ Prevent submit
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button" // ✅ Prevent submit
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-300 border border-gray-300 rounded-md hover:bg-red-600 hover:text-white transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}