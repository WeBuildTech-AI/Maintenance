import { Edit3, Trash2, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { type ContactFormData } from "../VendorsForm/NewContactModal";

interface VendorContactListProps {
  contacts: any[];
  setEditingContact: (contact: ContactFormData | null) => void;
  setIsModalOpen: (value: boolean) => void;
  openDeleteModal: (email: string) => void;
}

export default function VendorContactList({
  contacts,
  setEditingContact,
  setIsModalOpen,
  openDeleteModal,
}: VendorContactListProps) {
  return (
    <div>
      <h3 className="text-sm pt-6 mt-6 border-t border-gray-200 font-semibold text-gray-900 mb-3">
        Contact List
      </h3>

      {contacts && contacts.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mt-4 mb-6">
          <div
            className="overflow-x-auto"
            style={{ scrollbarWidth: "thin", WebkitScrollbarWidth: "thin" }}
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

            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">FULL NAME</th>
                  <th className="px-6 py-3 text-left font-medium">ROLE</th>
                  <th className="px-6 py-3 text-left font-medium">EMAIL</th>
                  <th className="px-6 py-3 text-left font-medium">
                    PHONE NUMBER
                  </th>
                  <th className="px-6 py-3 text-right font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((contact, index) => {
                  const initials = contact.fullName
                    ? contact.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "U";
                  const color =
                    contact.color || contact.contactColour || "#EC4899";
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center text-white font-medium text-sm rounded-full h-8 w-8 flex-shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {initials}
                          </div>
                          <span className="text-gray-900 text-sm font-medium capitalize">
                            {contact.fullName || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-800 font-normal whitespace-nowrap">
                        {contact.role || "-"}
                      </td>
                      <td className="px-6 py-3 text-blue-600 font-medium break-all">
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:underline"
                        >
                          {contact.email || "-"}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-blue-600 font-medium whitespace-nowrap">
                        <a
                          href={`tel:${contact.phone || contact.phoneNumber}`}
                          className="hover:underline"
                        >
                          {contact.phone || contact.phoneNumber || "-"}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingContact(contact);
                              setIsModalOpen(true);
                            }}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(contact.email)}
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
  );
}
