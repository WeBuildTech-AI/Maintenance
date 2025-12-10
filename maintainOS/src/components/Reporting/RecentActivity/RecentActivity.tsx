import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchWorkOrders, fetchWorkOrderLogs } from "../../../store/workOrders";
import type { WorkOrderLog, WorkOrderResponse } from "../../../store/workOrders/workOrders.types";
import { formatDistanceToNow, format } from "date-fns";
import { userService } from "../../../store/users/users.service";
import type { UserResponse } from "../../../store/users/users.types";
import { vendorService } from "../../../store/vendors/vendors.service";
import type { Vendor } from "../../../store/vendors/vendors.types";
import { categoryService } from "../../../store/categories/categories.service";
import type { CategoryResponse } from "../../../store/categories/categories.types";
import { partService } from "../../../store/parts/parts.service";
import type { PartResponse } from "../../../store/parts/parts.types";
import { assetService } from "../../../store/assets/assets.service";
import type { AssetResponse } from "../../../store/assets/assets.types";
import { locationService } from "../../../store/locations/locations.service";
import type { LocationResponse } from "../../../store/locations/locations.types";

export function RecentActivity() {
  const dispatch = useAppDispatch();
  const { workOrders } = useAppSelector((state) => state.workOrders);
  const [allLogs, setAllLogs] = useState<WorkOrderLog[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchWorkOrders());
    // Fetch all entities for name resolution
    const loadEntities = async () => {
      try {
        const [usersData, vendorsData, categoriesData, partsData, assetsData, locationsData] = await Promise.all([
          userService.fetchUsers(),
          vendorService.fetchVendors(),
          categoryService.fetchCategories(),
          partService.fetchParts(),
          assetService.fetchAssets(),
          locationService.fetchLocations(),
        ]);
        setUsers(usersData);
        setVendors(vendorsData);
        setCategories(categoriesData);
        setParts(partsData);
        setAssets(assetsData);
        setLocations(locationsData);
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      }
    };
    loadEntities();
  }, [dispatch]);

  useEffect(() => {
    // Once we have work orders, fetch logs for each
    const fetchAllLogs = async () => {
      if (workOrders.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const logsPromises = workOrders.map((wo: WorkOrderResponse) =>
        dispatch(fetchWorkOrderLogs(wo.id)).unwrap()
      );

      try {
        const logsArrays = await Promise.all(logsPromises);
        const combinedLogs = logsArrays.flat();
        // Sort all logs by time (newest first)
        combinedLogs.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllLogs(combinedLogs);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllLogs();
  }, [workOrders, dispatch]);

  const getActivityColor = (activityType: string, newValue?: string | null) => {
    // Special case: completed work order should be green
    if (activityType === "STATUS_UPDATED" && newValue === "done") {
      return "bg-green-50";
    }
    
    switch (activityType) {
      case "STATUS_UPDATED":
        return "bg-blue-50";
      case "CREATED":
        return "bg-green-50";
      case "ASSIGNED":
        return "bg-purple-50";
      case "COMMENT_ADDED":
        return "bg-gray-50";
      case "COMPLETED":
        return "bg-emerald-50";
      default:
        return "bg-gray-50";
    }
  };

  const formatStatusValue = (status: string) => {
    // Convert status to uppercase and replace underscores with spaces
    return status.replace(/_/g, " ").toUpperCase();
  };

  const formatPriorityValue = (priority: string) => {
    // Capitalize first letter
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getUserNameById = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    return user?.fullName || userId;
  };

  const getVendorNameById = (vendorId: string): string => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor?.name || vendorId;
  };

  const getCategoryNameById = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getPartNameById = (partId: string): string => {
    const part = parts.find((p) => p.id === partId);
    return part?.name || partId;
  };

  const getAssetNameById = (assetId: string): string => {
    const asset = assets.find((a) => a.id === assetId);
    return asset?.name || assetId;
  };

  const getLocationNameById = (locationId: string): string => {
    const location = locations.find((l) => l.id === locationId);
    return location?.name || locationId;
  };

  const formatActivityMessage = (log: WorkOrderLog) => {
    const { activityType, oldValue, newValue, responseLog } = log;
    
    // STATUS_UPDATED
    if (activityType === "STATUS_UPDATED" && oldValue && newValue) {
      if (newValue === "done") {
        return <span>Completed the work order.</span>;
      }
      
      return (
        <span>
          Changed status from{" "}
          <span className="font-medium text-gray-700">{formatStatusValue(oldValue)}</span> to{" "}
          <span className="font-medium text-gray-700">{formatStatusValue(newValue)}</span>
        </span>
      );
    }

    // ASSIGNED - Show assignee name if available
    if (activityType === "ASSIGNED" || activityType === "ASSIGNEE_ADDED") {
      if (newValue) {
        try {
          const parsed = JSON.parse(newValue);
          if (parsed.fullName || parsed.name) {
            return (
              <span>
                Added assignee{" "}
                <span className="font-medium text-gray-700">{parsed.fullName || parsed.name}</span>
              </span>
            );
          }
        } catch {
          const userName = getUserNameById(newValue);
          return (
            <span>
              Added assignee{" "}
              <span className="font-medium text-gray-700">{userName}</span>
            </span>
          );
        }
      }
      return <span>Added assignee</span>;
    }

    // ASSIGNEE_REMOVED - Show removed assignee name
    if (activityType === "ASSIGNEE_REMOVED") {
      if (oldValue) {
        try {
          const parsed = JSON.parse(oldValue);
          if (parsed.fullName || parsed.name) {
            return (
              <span>
                Removed assignee{" "}
                <span className="font-medium text-gray-700">{parsed.fullName || parsed.name}</span>
              </span>
            );
          }
        } catch {
          const userName = getUserNameById(oldValue);
          return (
            <span>
              Removed assignee{" "}
              <span className="font-medium text-gray-700">{userName}</span>
            </span>
          );
        }
      }
      return <span>Removed assignee</span>;
    }

    // VENDOR_ADDED
    if (activityType === "VENDOR_ADDED" && newValue) {
      const vendorName = getVendorNameById(newValue);
      return (
        <span>
          Added vendor{" "}
          <span className="font-medium text-gray-700">{vendorName}</span>
        </span>
      );
    }

    // CATEGORY_ADDED
    if (activityType === "CATEGORY_ADDED" && newValue) {
      const categoryName = getCategoryNameById(newValue);
      return (
        <span>
          Added category{" "}
          <span className="font-medium text-gray-700">{categoryName}</span>
        </span>
      );
    }

    // PART_ADDED
    if (activityType === "PART_ADDED" && newValue) {
      const partName = getPartNameById(newValue);
      return (
        <span>
          Added part{" "}
          <span className="font-medium text-gray-700">{partName}</span>
        </span>
      );
    }

    // ASSET_ADDED
    if (activityType === "ASSET_ADDED" && newValue) {
      const assetName = getAssetNameById(newValue);
      return (
        <span>
          Added asset{" "}
          <span className="font-medium text-gray-700">{assetName}</span>
        </span>
      );
    }

    // LOCATION_ADDED
    if (activityType === "LOCATION_ADDED" && newValue) {
      const locationName = getLocationNameById(newValue);
      return (
        <span>
          Added location{" "}
          <span className="font-medium text-gray-700">{locationName}</span>
        </span>
      );
    }

    // PRIORITY_UPDATED - Always show old and new values
    if (activityType === "PRIORITY_UPDATED") {
      if (oldValue && newValue) {
        return (
          <span>
            Changed priority from{" "}
            <span className="font-medium text-gray-700">{formatPriorityValue(oldValue)}</span> to{" "}
            <span className="font-medium text-gray-700">{formatPriorityValue(newValue)}</span>
          </span>
        );
      } else if (newValue) {
        return (
          <span>
            Set priority to{" "}
            <span className="font-medium text-gray-700">{formatPriorityValue(newValue)}</span>
          </span>
        );
      }
      return <span>Changed priority</span>;
    }

    // DUE_DATE_UPDATED
    if (activityType === "DUE_DATE_UPDATED" && newValue) {
      if (oldValue) {
        return (
          <span>
            Changed due date from{" "}
            <span className="font-medium text-gray-700">{formatDate(oldValue)}</span> to{" "}
            <span className="font-medium text-gray-700">{formatDate(newValue)}</span>
          </span>
        );
      }
      return (
        <span>
          Set due date to{" "}
          <span className="font-medium text-gray-700">{formatDate(newValue)}</span>
        </span>
      );
    }

    // CREATED
    if (activityType === "CREATED") {
      return <span>Created work order</span>;
    }

    // COMMENT_ADDED
    if (activityType === "COMMENT_ADDED") {
      return <span>Added a comment</span>;
    }

    // DESCRIPTION_UPDATED
    if (activityType === "DESCRIPTION_UPDATED") {
      return <span>Updated description</span>;
    }

    // TITLE_UPDATED
    if (activityType === "TITLE_UPDATED" && newValue) {
      return (
        <span>
          Changed title to{" "}
          <span className="font-medium text-gray-700">{newValue}</span>
        </span>
      );
    }
    
    // Default: use responseLog or generic message
    return responseLog || "Activity logged";
  };

  // Group consecutive logs from the same work order
  const groupedByConsecutive: WorkOrderLog[][] = [];
  allLogs.forEach((log, index) => {
    if (index === 0) {
      groupedByConsecutive.push([log]);
    } else {
      const lastGroup = groupedByConsecutive[groupedByConsecutive.length - 1];
      const lastLog = lastGroup[lastGroup.length - 1];
      
      // If this log is from the same work order as the last one, add to the same group
      if (log.workOrderId === lastLog.workOrderId) {
        lastGroup.push(log);
      } else {
        // Otherwise, start a new group
        groupedByConsecutive.push([log]);
      }
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading activity logs...</div>
      </div>
    );
  }

  if (allLogs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">No recent activity found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedByConsecutive.map((logGroup, groupIndex) => {
        const firstLog = logGroup[0];
        return (
          <div key={`group-${groupIndex}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Work Order Header */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                In Work Order{" "}
                <a
                  href={`#${firstLog.workOrderId}`}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {firstLog.workOrder?.title || "Unknown Work Order"}
                </a>
              </h3>
            </div>

            {/* Activity Logs - Multiple logs if consecutive */}
            <div className="divide-y divide-gray-100">
              {logGroup.map((log) => (
                <div
                  key={log.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${getActivityColor(
                    log.activityType,
                    log.newValue
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {log.author?.fullName?.charAt(0) || "U"}
                      </div>
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">
                          {log.author?.fullName || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-700">
                        {formatActivityMessage(log)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
