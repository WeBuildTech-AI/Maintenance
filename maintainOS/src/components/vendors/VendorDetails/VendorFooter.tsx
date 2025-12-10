import { Globe, Users } from "lucide-react";
import { Button } from "../../ui/button";

interface VendorFooterProps {
  user: any;
  vendor: any;
}

export default function VendorFooter({ user, vendor }: VendorFooterProps) {
  // 1. Format Date: "09/23/2025, 4:25 PM"
  const formattedDate = vendor.createdAt
    ? new Date(vendor.createdAt).toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

  // 2. Determine Creator Name
  const creatorName = vendor.createdBy || user?.fullName || "System";

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 pb-24">
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <span>Created By</span>
        
        {/* Globe Icon */}
        <Globe className="h-4 w-4 text-blue-500" />
        
        {/* Name */}
        <span className="font-medium text-gray-900 capitalize">
          {creatorName}
        </span>
        
        <span>on</span>
        
        {/* Date */}
        <span className="text-gray-900">
          {formattedDate}
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