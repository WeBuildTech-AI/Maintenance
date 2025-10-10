import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { saveContact } from "./contactService";

export interface ContactFormData {
  fullName: string;
  role: string;
  email: string;
  phoneNumber: string;
  phoneExtension: string;
  contactColour: string;
}

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: ContactFormData) => void;
  initialData?: any | null; // vendor/contact data
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#EC4899",
  "#8B5CF6",
  "#F97316",
];

export function NewContactModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: NewContactModalProps) {
  const [contact, setContact] = useState<ContactFormData>(
    initialData || {
      fullName: "",
      role: "",
      email: "",
      phoneNumber: "",
      phoneExtension: "",
      contactColour: "#EC4899",
    }
  );
  const [showExtension, setShowExtension] = useState(false);

  useEffect(() => {
    if (initialData) {
      setContact(initialData);
      if (initialData.phoneExtension) setShowExtension(true);
    } else {
      setContact({
        fullName: "",
        role: "",
        email: "",
        phoneNumber: "",
        phoneExtension: "",
        contactColour: "#EC4899",
      });
      setShowExtension(false);
    }
  }, [initialData, isOpen]);

  const getInitial = () => {
    return contact.fullName.trim().charAt(0).toUpperCase() || "C";
  };

  const handleSave = async () => {
    try {
      if (initialData?.vendorId) {
        // ✅ Always use PUT API for both new + existing contacts
        await saveContact({
          contact,
          vendorId: initialData.vendorId,
          contactId: initialData?.id || initialData?._id,
        });
      } else {
        console.warn("⚠️ Vendor ID missing — contact will be saved later.");
      }

      onSave(contact);
      onClose();

      // Reset fields
      setContact({
        fullName: "",
        role: "",
        email: "",
        phoneNumber: "",
        phoneExtension: "",
        contactColour: "#EC4899",
      });
      setShowExtension(false);
    } catch (error) {
      console.error("❌ handleSave error:", error);
    }
  };

  const handleCancel = () => {
    setContact({
      fullName: "",
      role: "",
      email: "",
      phoneNumber: "",
      phoneExtension: "",
      contactColour: "#EC4899",
    });
    setShowExtension(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
    >
      <div
        className="w-full bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ maxWidth: "672px", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700">
            {initialData?.id ? "Edit Contact" : "New Contact"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-700 hover:text-gray-700 transition-colors cursor-pointer bg-transparent border-0 p-1 flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="px-6 py-8">
            {/* Avatar */}
            <div className="flex justify-start mb-8">
              <div
                className="flex items-center justify-center text-white font-light"
                style={{
                  backgroundColor: contact.contactColour,
                  fontSize: "48px",
                  width: "128px",
                  height: "128px",
                  borderRadius: "50%",
                }}
              >
                {getInitial()}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-700 mb-4">
                Contact Info
              </h3>
              <div className="grid grid-cols-2 gap-6" style={{ gap: "20px 24px" }}>
                {/* Full Name */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={contact.fullName}
                    onChange={(e) =>
                      setContact((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full rounded border border-blue-500 px-3 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    style={{ padding: "10px 12px" }}
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    placeholder="Role"
                    value={contact.role}
                    onChange={(e) =>
                      setContact((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full rounded border border-gray-200 px-3 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    style={{ padding: "10px 12px" }}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded border border-gray-200 px-3 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    style={{ padding: "10px 12px" }}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number (e.g., 8750118899)"
                    value={contact.phoneNumber}
                    onChange={(e) =>
                      setContact((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    className="w-full rounded border border-gray-200 px-3 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    style={{ padding: "10px 12px" }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: Country code will be added automatically
                  </p>
                </div>
              </div>

              {/* Add Country Code */}
              {!showExtension && (
                <button
                  type="button"
                  onClick={() => setShowExtension(true)}
                  className="mt-4 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  + Add Country Code
                </button>
              )}

              {showExtension && (
                <div className="mt-4" style={{ width: "calc(50% - 12px)" }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., +91"
                    value={contact.phoneExtension}
                    onChange={(e) =>
                      setContact((prev) => ({ ...prev, phoneExtension: e.target.value }))
                    }
                    className="w-full rounded border border-gray-200 px-3 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    style={{ padding: "10px 12px" }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include + sign (e.g., +91, +1)
                  </p>
                </div>
              )}
            </div>

            {/* Contact Color */}
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-4">
                Contact Color
              </h3>
              <div className="flex gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setContact((prev) => ({ ...prev, contactColour: color }))
                    }
                    className="cursor-pointer transition-all"
                    style={{
                      backgroundColor: color,
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border:
                        contact.contactColour === color
                          ? "2px solid gray"
                          : "2px solid transparent",
                      transform:
                        contact.contactColour === color
                          ? "scale(1.1)"
                          : "scale(1)",
                    }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleCancel}
            className="cursor-pointer border-0 bg-transparent px-6 text-sm font-medium text-gray-700 hover:text-gray-700 transition-colors"
            style={{ padding: "10px 24px" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="cursor-pointer rounded border-0 bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            style={{ padding: "10px 24px" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
