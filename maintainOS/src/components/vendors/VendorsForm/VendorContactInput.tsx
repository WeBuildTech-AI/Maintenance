import { useState } from "react";
import { Edit2, Trash2, X } from "lucide-react";
import { NewContactModal, type ContactFormData } from "./NewContactModal";

interface VendorContactInputProps {
  contact?: any;
  setContact?: any;
  showInputs?: boolean;
  setShowInputs?: any;
  // ✅ NEW: parent ko contacts bhejne ke liye
  onContactsChange?: (contacts: ContactFormData[]) => void;
}

export function VendorContactInput({
  contact,
  setContact,
  showInputs,
  setShowInputs,
  onContactsChange,
}: VendorContactInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState<ContactFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const syncUp = (next: ContactFormData[]) => {
    setContacts(next);
    // ✅ lift to parent
    if (onContactsChange) onContactsChange(next);
  };

  const handleSaveContact = (newContact: ContactFormData) => {
    if (editingIndex !== null) {
      const next = contacts.map((c, i) => (i === editingIndex ? newContact : c));
      syncUp(next);
      setEditingIndex(null);
    } else {
      const next = [...contacts, newContact];
      syncUp(next);
    }
    console.log("Contact saved:", newContact);
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

  const getInitials = (fullName: string) =>
    fullName.trim().charAt(0).toUpperCase() || "C";

  return (
    <>
      <div className="px-6 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Contact List
        </label>

        {contacts.length > 0 && (
          <div className="mt-4 mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Full Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contactItem, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
                            style={{
                              backgroundColor: contactItem.color,
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                            }}
                          >
                            {getInitials(contactItem.fullName)}
                          </div>
                          <span className="text-sm text-gray-900">
                            {contactItem.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {contactItem.role}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                        {contactItem.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                        <div className="flex flex-col leading-tight">
                          <span>{contactItem.phone}</span>
                          {contactItem.phoneExtension && (
                            <span className="text-gray-500 text-xs mt-0.5">
                              {contactItem.phoneExtension && ` x${contactItem.phoneExtension}`}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditContact(index)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteContact(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ✅ Styled same as "Attach files" button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 border border-blue-300 text-blue-600 font-medium text-sm px-4 py-2 rounded-md hover:bg-blue-50 transition-all duration-200"
        >
          + New Contact
        </button>
      </div>

      {/* Contact Modal */}
      <NewContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        onSave={handleSaveContact}
        initialData={editingIndex !== null ? contacts[editingIndex] : null}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Delete Contact
              </h2>
              <button
                onClick={cancelDelete}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this contact? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
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
