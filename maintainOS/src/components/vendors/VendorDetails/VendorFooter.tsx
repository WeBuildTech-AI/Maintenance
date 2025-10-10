import { Users, Globe } from "lucide-react";
import { Button } from "../../ui/button";

interface VendorFooterProps {
  user: any;
  vendor: any;
}

// Footer info section (Created by)
export default function VendorFooter({ user, vendor }: VendorFooterProps) {
  return (
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
  );
}

// ✅ Separate sticky button footer (kept identical)
VendorFooter.Button = function VendorFooterButton() {
  return (
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
  );
};
