import { ClipboardList } from "lucide-react";
import { type Vendor } from "../vendors.types";

interface VendorWorkOrdersSectionProps {
  vendor: Vendor;
}

export default function VendorWorkOrdersSection({ vendor }: VendorWorkOrdersSectionProps) {
  const workOrders = vendor.workOrderIds || [];

  return (
    <div className="pt-6 mt-6 border-t border-gray-200">
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        Active Work Orders ({workOrders.length})
      </h3>

      {workOrders.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {workOrders.map((woId, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium"
            >
              <ClipboardList className="h-3 w-3" />
              <span>Reference #{woId.substring(0, 8)}...</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No active work orders.</p>
      )}
    </div>
  );
}