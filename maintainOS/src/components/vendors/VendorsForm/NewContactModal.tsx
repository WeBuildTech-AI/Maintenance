import { X } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { vendorService } from "../../../store/vendors/vendors.service";

export interface ContactFormData {
  fullName: string;
  role: string;
  email: string;
  phoneNumber: string;
  phoneExtension: string;
  contactColor: string;
}

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: ContactFormData) => void;
  initialData?: any | null;
  vendorId?: string;
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
  vendorId,
}: NewContactModalProps) {
  const [contact, setContact] = useState<ContactFormData>({
    fullName: "",
    role: "",
    email: "",
    phoneNumber: "",
    phoneExtension: "",
    contactColor: "#EC4899",
  });
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
        contactColor: "#EC4899",
      });
      setShowExtension(false);
    }
  }, [initialData, isOpen]);

  const getInitial = () => contact.fullName.trim().charAt(0).toUpperCase() || "C";

  const handleSave = async () => {
    try {
      let response;

      if (vendorId) {
        // ✅ Save to backend
        response = await vendorService.createVendorContact(vendorId, contact);
        toast.success("Contact saved successfully ✅");

        // ✅ Fetch updated vendor & broadcast event
        const updatedVendor = await vendorService.fetchVendorById(vendorId);
        window.dispatchEvent(
          new CustomEvent("vendor-updated", { detail: updatedVendor })
        );
      } else {
        // 🆕 Just store locally if vendor not yet created
        response = contact;
        toast.success("Contact added (will save when vendor is created)");
      }

      onSave(response);
      onClose();
    } catch (err: any) {
      console.error("❌ Error saving contact:", err);
      toast.error(err?.message || "Error saving contact");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div
        className="w-full bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ maxWidth: "672px", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700">
            {initialData ? "Edit Contact" : "New Contact"}
          </h2>
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Avatar */}
        <div className="overflow-y-auto px-6 py-8" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="flex justify-start mb-8">
            <div
              className="flex items-center justify-center text-white font-light"
              style={{
                backgroundColor: contact.contactColor,
                fontSize: "48px",
                width: "128px",
                height: "128px",
                borderRadius: "50%",
              }}
            >
              {getInitial()}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <input
                type="text"
                value={contact.fullName}
                onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <input
                type="text"
                value={contact.role}
                onChange={(e) => setContact({ ...contact, role: e.target.value })}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number</label>
              <input
                type="tel"
                value={contact.phoneNumber}
                onChange={(e) => setContact({ ...contact, phoneNumber: e.target.value })}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>
          </div>

          {!showExtension && (
            <button
              type="button"
              onClick={() => setShowExtension(true)}
              className="text-blue-600 text-sm font-medium"
            >
              + Add Country Code
            </button>
          )}

          {showExtension && (
            <div className="mt-4 w-1/2">
              <label className="text-sm font-medium mb-2 block">Country Code</label>
              <input
                type="text"
                placeholder="+91"
                value={contact.phoneExtension}
                onChange={(e) => setContact({ ...contact, phoneExtension: e.target.value })}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-base font-semibold mb-4">Contact Color</h3>
            <div className="flex gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setContact({ ...contact, contactColor: color })}
                  style={{
                    backgroundColor: color,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border:
                      contact.contactColor === color
                        ? "2px solid gray"
                        : "2px solid transparent",
                    transform: contact.contactColor === color ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-sm text-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
