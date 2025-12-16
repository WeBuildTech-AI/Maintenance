import { type AppDispatch } from "../../../store";
import { createVendor } from "../../../store/vendors";
import toast from "react-hot-toast";

/**
 * Handles both CREATE and UPDATE vendor logic.
 * This keeps VendorForm.tsx clean and reusable.
 */
export async function saveVendor({
  dispatch,
  formData,
  initialData,
  onSubmit,
  onSuccess,
  onCancel,
}: {
  dispatch: AppDispatch;
  formData: FormData;
  initialData?: any;
  onSubmit?: (data: any) => Promise<any> | void; // ✅ Allow Promise return
  onSuccess?: (data: any) => void;
  onCancel: () => void;
}) {
  try {
    if (initialData && onSubmit) {
      // 🟢 UPDATE FLOW
      // ✅ Await the update action so we don't close before it finishes
      await onSubmit(formData);

      toast.success("Vendor updated successfully", {
        style: { background: "#ffffff", color: "#333" },
      });

      // ✅ Call onSuccess so parent re-fetches data immediately
      if (onSuccess) onSuccess(initialData);
    } else {
      // 🟢 CREATE FLOW
      const created = await dispatch(createVendor(formData)).unwrap();
      toast.success("Vendor created successfully", {
        style: { background: "#ffffff", color: "#333" },
      });
      if (onSuccess) onSuccess(created);
    }

    // ✅ Close form on success
    onCancel();
  } catch (err) {
    console.error("🚨 Error saving vendor:", err);
    toast.error("Failed to save vendor", {
      style: { background: "#ffffff", color: "#333" },
    });
  }
}