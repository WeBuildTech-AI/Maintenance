import toast from "react-hot-toast";
import type { ContactFormData } from "./NewContactModal";

/**
 * Single universal API: always uses PUT (update)
 * If backend detects no contact, it will create it.
 */
export async function saveContact({
  contact,
  vendorId,
  contactId,
}: {
  contact: ContactFormData;
  vendorId?: string;
  contactId?: string;
}) {
  try {
    if (!vendorId) throw new Error("Vendor ID missing for contact update");

    const targetId = contactId || "new"; // fallback ID for backend to handle creation
    const endpoint = `/api/v1/vendors/${vendorId}/contacts/${targetId}`;

    console.log("📡 Updating/creating contact via PUT:", endpoint);

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to save contact");
    }

    toast.success("Contact saved successfully ✅");

    console.groupCollapsed("📤 Contact API Payload");
    console.log(contact);
    console.log("📥 Response:", data);
    console.groupEnd();

    return data;
  } catch (error: any) {
    console.error("❌ saveContact error:", error);
    toast.error(error?.message || "Error while saving contact ❌");
    throw error;
  }
}
