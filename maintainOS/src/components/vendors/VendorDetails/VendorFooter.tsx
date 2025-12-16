import { Globe, Users, PenLine } from "lucide-react";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { vendorService } from "../../../store/vendors/vendors.service";

interface VendorFooterProps {
  user: any;
  vendor: any;
}

export default function VendorFooter({ user, vendor }: VendorFooterProps) {
  // Initialize with "Loading..." or fallback to system if empty
  const [creatorName, setCreatorName] = useState<string>("Loading...");
  const [updaterName, setUpdaterName] = useState<string>("Loading...");

  // 1. Format Date Helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formattedCreated = formatDate(vendor.createdAt);
  const formattedUpdated = formatDate(vendor.updatedAt);

  // 2. Fetch User Names logic
  useEffect(() => {
    let isMounted = true;

    const fetchNames = async () => {
      // --- Resolve Creator ---
      if (vendor.createdBy) {
        // Optimization: if ID matches logged-in user, use that directly
        if (user?.id === vendor.createdBy) {
          if (isMounted) setCreatorName(user.fullName || "Me");
        } else {
          // Otherwise fetch from API
          try {
            const u = await vendorService.fetchUser(vendor.createdBy);
            if (isMounted) setCreatorName(u.fullName || "Unknown User");
          } catch (err) {
            console.error("Error fetching creator:", err);
            if (isMounted) setCreatorName("Unknown");
          }
        }
      } else {
        if (isMounted) setCreatorName("System");
      }

      // --- Resolve Updater ---
      if (vendor.updatedBy) {
        if (user?.id === vendor.updatedBy) {
          if (isMounted) setUpdaterName(user.fullName || "Me");
        } else {
          try {
            const u = await vendorService.fetchUser(vendor.updatedBy);
            if (isMounted) setUpdaterName(u.fullName || "Unknown User");
          } catch (err) {
            console.error("Error fetching updater:", err);
            if (isMounted) setUpdaterName("Unknown");
          }
        }
      } else {
        if (isMounted) setUpdaterName("System");
      }
    };

    fetchNames();

    return () => { isMounted = false; };
  }, [vendor.createdBy, vendor.updatedBy, user]);

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 pb-24 flex flex-col gap-3">

      {/* Row 1: Created By */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="w-20 text-gray-500">Created By</span>

        {/* Globe Icon */}
        <Globe className="h-4 w-4 text-blue-500" />

        {/* Name */}
        <span className="font-medium text-gray-900 capitalize">
          {creatorName}
        </span>

        <span>on</span>

        {/* Date */}
        <span className="text-gray-900">
          {formattedCreated}
        </span>
      </div>

      {/* Row 2: Updated By */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="w-20 text-gray-500">Updated By</span>
        {/* Globe Icon */}
        <Globe className="h-4 w-4 text-blue-500" />

        {/* Name */}
        <span className="font-medium text-gray-900 capitalize">
          {updaterName}
        </span>

        <span>on</span>

        {/* Date */}
        <span className="text-gray-900">
          {formattedUpdated}
        </span>
      </div>

    </div>
  );
}

// Sticky Button Component
VendorFooter.Button = function VendorFooterButton({ onClick }: { onClick?: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
      }}
    >
      <Button
        variant="outline"
        onClick={onClick}
        className="text-yellow-600 border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap flex items-center gap-2"
      >
        <Users className="w-5 h-5" />
        Use in New Work Order
      </Button>
    </div>
  );
};