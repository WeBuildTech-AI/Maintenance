import {type  AppDispatch } from "../../../store";
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
  onSubmit?: (data: any) => void;
  onSuccess?: (data: any) => void;
  onCancel: () => void;
}) {
  try {
    if (initialData && onSubmit) {
      // 🟢 UPDATE FLOW
      onSubmit(formData);
      toast.success("Vendor updated successfully", {
        style: { background: "#ffffff", color: "#333" },
      });
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
