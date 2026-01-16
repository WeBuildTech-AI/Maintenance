
// PartDetails.tsx
"use client";

import {
  Building2,
  CalendarDays,
  Check,
  Edit,
  Link as LinkIcon,
  MapPin,
  MoreHorizontal,
  Package2,
  Plus,
  UserCircle2,
  Maximize2,
  Minimize2,
  History as HistoryIcon,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import DeletePartModal from "./DeletePartModal";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { createPart, deletePart, fetchPartLogs } from "../../../store/parts/parts.thunks";
import toast from "react-hot-toast";
import { PartImages } from "./PartImages";
import { PartFiles } from "./PartFiles";
import { partService } from "../../../store/parts";

import PartOptionsDropdown from "./PartOptionsDropdown";
import RestockModal from "./RestockModal";
import { NewPartForm } from "../NewPartForm/NewPartForm";
import api from "../../../store/auth/auth.service";
import { Tooltip } from "../../ui/tooltip";
import { format, subDays } from "date-fns";
import { WorkOrderHistoryChart } from "../../utils/WorkOrderHistoryChart";
import { formatINR } from "../../utils/dollar_rupee_convert";

type DateRange = { startDate: string; endDate: string };

// ✅ HELPER: Convert Raw JSON to Readable Changes
const getReadableChanges = (oldVal: string | null, newVal: string | null) => {
  try {
    if (!oldVal || !newVal) return [];

    // 1. Parse JSON safely
    const oldObj = typeof oldVal === "string" ? JSON.parse(oldVal) : oldVal;
    const newObj = typeof newVal === "string" ? JSON.parse(newVal) : newVal;

    const changes: { key: string; from: any; to: any }[] = [];

    // 2. Fields to Ignore (Internal/System fields)
    const ignoreFields = [
      "id",
      "organizationId",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
      "isDeleted",
      "workOrderIds",
      "partImages",
      "partDocs", // usually handled separately
    ];

    // 3. Compare Keys
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

    allKeys.forEach((key) => {
      if (ignoreFields.includes(key)) return;

      const val1 = oldObj[key];
      const val2 = newObj[key];

      // Deep compare for arrays/objects simplified
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({
          key: formatKey(key),
          from: formatValue(key, val1),
          to: formatValue(key, val2),
        });
      }
    });

    return changes;
  } catch (err) {
    console.error("❌ Error parsing log diff:", err);
    return [];
  }
};

// Format Key (camelCase -> Title Case)
const formatKey = (key: string) => {
  const result = key.replace(/([A-Z])/g, " $1").trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// Format Value (Currency, Arrays, Nulls)
const formatValue = (key: string, value: any) => {
  if (value === null || value === undefined || value === "") return "Empty";
  if (key.toLowerCase().includes("cost") && typeof value === "number") {
    return `$${value.toFixed(2)}`;
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "Empty List" : `${value.length} items`;
  }
  if (typeof value === "object") return "Object";
  return String(value);
};

export function PartDetails({
  item,
  stockStatus,
  onClose,
  restoreData,
  onEdit,
  onDeleteSuccess,
  fetchPartData,
}: {
  item: any;
  restoreData: string;
  onClose: () => void;
  stockStatus?: { ok: boolean; delta: number } | null;
  onEdit: () => void;
  onDeleteSuccess: (id: string) => void;
  fetchPartData: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");

  const [partData, setPartData] = useState<any>(item);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // User Names Cache
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const [chartDateRanges, setChartDateRanges] = useState<
    Record<string, DateRange>
  >({
    "work-order-history": {
      startDate: format(subDays(new Date(), 7), "MM/dd/yyyy"),
      endDate: format(new Date(), "MM/dd/yyyy"),
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ DEBUGGING SELECTOR
  const logs = useSelector((state: RootState) => {
    // console.log("🔄 Redux State Check:", state.parts); 
    return state.parts?.logs || [];
  });

  // console.log("📊 Current Logs in Component:", logs);

  const organizationId = useSelector(
    (state: RootState) => state.auth?.user?.organizationId
  );

  useEffect(() => {
    setPartData(item);
    setIsEditing(false);
  }, [item]);

  // ✅ Fetch Logs & Resolve Author Names
  useEffect(() => {
    if (activeTab === "history" && partData?.id) {
      console.log("🚀 Dispatching fetchPartLogs for:", partData.id);
      dispatch(fetchPartLogs(partData.id));
    }
  }, [activeTab, partData.id, dispatch]);

  // ✅ Fetch User Names for Logs
  useEffect(() => {
    if (logs.length > 0) {
      const uniqueAuthors = Array.from(new Set(logs.map((l: any) => l.authorId).filter(Boolean)));
      
      uniqueAuthors.forEach(async (id: any) => {
        if (!userNames[id]) {
          try {
            const res = await api.get(`/users/${id}`);
            if (res.data?.fullName) {
              setUserNames((prev) => ({ ...prev, [id]: res.data.fullName }));
            }
          } catch (e) {
            console.error("Failed to fetch user:", id);
          }
        }
      });
    }
  }, [logs]);

  const refreshLocalData = async () => {
    if (!partData?.id) return;
    try {
      const freshData = await partService.fetchPartById(partData.id);
      setPartData(freshData);
      if (fetchPartData) fetchPartData();
    } catch (error) {
      console.error("Failed to refresh part details:", error);
    }
  };

  // Helper to get Creator/Updater names for the Part itself
  useEffect(() => {
    const fetchPartUsers = async () => {
      if (partData.createdBy && !userNames[partData.createdBy]) {
         try {
            const res = await api.get(`/users/${partData.createdBy}`);
            setUserNames(prev => ({...prev, [partData.createdBy]: res.data?.fullName || partData.createdBy}));
         } catch {}
      }
      if (partData.updatedBy && !userNames[partData.updatedBy]) {
         try {
            const res = await api.get(`/users/${partData.updatedBy}`);
            setUserNames(prev => ({...prev, [partData.updatedBy]: res.data?.fullName || partData.updatedBy}));
         } catch {}
      }
    };
    fetchPartUsers();
  }, [partData.createdBy, partData.updatedBy]);

  useEffect(() => {
    if (isEditing && partData?.id) {
      setLoading(true);
      partService
        .fetchPartById(partData.id)
        .then((fullData) => {
          setEditItem({
            ...fullData,
            _original: fullData,
            pictures: fullData.photos || [],
            files: fullData.files || [],
            partsType: fullData.partsType || [],
            assetIds: fullData.assetIds || [],
            teamsInCharge: fullData.teamsInCharge || [],
            vendorIds: fullData.vendorIds || [],
            vendors: fullData.vendors || [],
          });
        })
        .catch((err) => {
          console.error("Failed to fetch full part details:", err);
          toast.error("Could not load part details for editing");
          setIsEditing(false);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditing, partData]);

  const handleDuplicatePart = async () => {
    const loadingToast = toast.loading("Duplicating part...");
    try {
      const payload: any = {
        organizationId: organizationId || "",
        name: `Copy - ${partData.name}`,
        description: partData.description || "",
        unitCost: partData.unitCost ? Number(partData.unitCost) : 0,
        qrCode: "",
        partsType: Array.isArray(partData.partsType)
          ? partData.partsType.map((t: any) =>
              typeof t === "string" ? t : t.name || t
            )
          : [],
        assetIds: partData.assets?.map((a: any) => a.id) || partData.assetIds || [],
        teamsInCharge: partData.teams?.map((t: any) => t.id) || partData.teamsInCharge || [],
        vendorIds: partData.vendors?.map((v: any) => v.id || v.vendorId) || partData.vendorIds || [],
        partImages: partData.partImages || [],
        partDocs: partData.partDocs || [],
        locations: [],
      };

      if (partData.locations && partData.locations.length > 0) {
        payload.locations = partData.locations.map((loc: any) => ({
          locationId: loc.locationId || loc.id,
          area: loc.area || "",
          unitsInStock: Number(loc.unitsInStock ?? 0),
          minimumInStock: Number(loc.minimumInStock ?? 0),
        }));
      }

      const result = await dispatch(createPart(payload)).unwrap();
      toast.success("Part duplicated successfully!", { id: loadingToast });
      setIsDropdownOpen(false);
      if (fetchPartData) fetchPartData();
      navigate(`/inventory/${result.id}`);
    } catch (error: any) {
      console.error("❌ Duplicate failed:", error);
      toast.error(error?.message || "Failed to duplicate part", {
        id: loadingToast,
      });
    }
  };

  const handleCopyClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDeletePart = async () => {
    try {
      setLoading(true);
      await dispatch(deletePart(partData.id)).unwrap();
      toast.success("Part deleted successfully!");
      setShowDeleteModal(false);
      if (onDeleteSuccess) onDeleteSuccess(partData.id);
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error || "Failed to delete part");
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePartData = async (id: string) => {
    try {
      await partService.restorePartData(id);
      if (onClose) onClose();
      refreshLocalData();
      toast.success("Successfully Restored the Data");
    } catch (err) {
      toast.error("Failed to Restore the Data");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setIsDropdownOpen(false);
  };

  const handleUseInNewWorkOrder = () => {
    navigate("/work-orders/create", {
      state: {
        prefilledPart: {
          id: partData.id,
          name: partData.name,
          unitCost: partData.unitCost,
        },
      },
    });
  };

  const filters = {
    partIds: partData.id,
  };

  const handleDateRangeChange = (id: string, start: Date, end: Date) => {
    setChartDateRanges((prev) => ({
      ...prev,
      [id]: {
        startDate: format(start, "MM/dd/yyyy"),
        endDate: format(end, "MM/dd/yyyy"),
      },
    }));
  };

  const availableUnits =
    partData.unitsInStock ?? partData.locations?.[0]?.unitsInStock ?? 0;
  const minUnits =
    partData.minInStock ?? partData.locations?.[0]?.minimumInStock ?? 0;
  const partType = Array.isArray(partData.partsType)
    ? partData.partsType[0]?.name || partData.partsType[0] || "N/A"
    : partData.partsType?.name || "N/A";

  if (isEditing) {
    if (loading || !editItem) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading full details...</p>
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col h-full bg-white relative animate-in fade-in zoom-in-95 duration-200 ${
          isExpanded
            ? "fixed inset-2 z-[99999] shadow-2xl rounded-lg border border-gray-300"
            : ""
        }`}
      >
        <div className="flex-1 overflow-hidden pt-2">
          <NewPartForm
            newItem={editItem}
            setNewItem={setEditItem}
            addVendorRow={() =>
              setEditItem((prev: any) => ({
                ...prev,
                vendors: [
                  ...(prev.vendors || []),
                  { vendorId: "", orderingPartNumber: "" },
                ],
              }))
            }
            removeVendorRow={(idx: number) =>
              setEditItem((prev: any) => ({
                ...prev,
                vendors: (prev.vendors || []).filter(
                  (_: any, i: number) => i !== idx
                ),
              }))
            }
            onCancel={() => setIsEditing(false)}
            onCreate={() => {
              setIsEditing(false);
              refreshLocalData();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full bg-white shadow-sm border relative transition-all duration-200 
        ${
          isExpanded
            ? "fixed inset-2 z-[99999] rounded-lg shadow-2xl w-auto h-auto"
            : ""
        }`}
    >
      <div className="flex justify-between items-start p-6 relative">
        <div>
          <h2 className="text-2xl font-normal">{partData.name}</h2>
          <p className="text-base text-gray-700 mt-2">
            {availableUnits} units in stock
          </p>
        </div>

        <div className="flex items-center gap-2 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 hidden sm:flex"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>

          <Tooltip text="Copy Link">
            <Button
              variant="ghost"
              size="icon"
              className="text-yellow-500 hover:bg-transparent"
              onClick={handleCopyClick}
              disabled={isCopied}
            >
              {isCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <LinkIcon className="h-5 w-5" />
              )}
            </Button>
          </Tooltip>

          <Button
            className="bg-white text-yellow-600 hover:bg-yellow-50 border-2 border-yellow-400 rounded-md px-4 py-2 font-medium"
            onClick={() => setShowRestockModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Restock
          </Button>

          <Button
            onClick={() => setIsEditing(true)}
            className="bg-white text-yellow-600 hover:bg-yellow-50 border-2 border-yellow-400 rounded-md px-4 py-2 font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <div className="relative">
            <Button
              ref={buttonRef}
              variant="ghost"
              size="icon"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`text-gray-600 hover:bg-transparent ${
                isDropdownOpen ? "bg-gray-100" : ""
              }`}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>

            {restoreData ? (
              isDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: "0px",
                    left: "auto",
                    top: "100%",
                    marginTop: "8px",
                    width: "192px",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    zIndex: 50,
                  }}
                >
                  <ul className="text-gray-800 text-sm">
                    <li
                      onClick={handleDeleteClick}
                      className="px-4 py-2 text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      Delete Permanently
                    </li>
                    <li
                      className="px-4 py-2 text-green-600 hover:bg-green-50 cursor-pointer"
                      onClick={() => handleRestorePartData(partData.id)}
                    >
                      Restore
                    </li>
                  </ul>
                </div>
              )
            ) : (
              <PartOptionsDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                triggerRef={buttonRef}
                onOrder={() => toast("Order clicked")}
                onCopy={handleDuplicatePart}
                onExportQR={() => toast("Export QR clicked")}
                onDelete={handleDeleteClick}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex text-base border-b border-gray-300">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex-1 text-center py-3 border-b-[3px] -mb-px transition-colors ${
            activeTab === "details"
              ? "border-yellow-500 text-yellow-600 font-medium"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 text-center py-3 border-b-[3px] -mb-px transition-colors ${
            activeTab === "history"
              ? "border-yellow-500 text-yellow-600 font-medium"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {activeTab === "details" ? (
          <>
            <div className="grid grid-cols-3 gap-8 mb-8 pb-8">
              <div>
                <h4 className="text-sm text-gray-600 mb-2">Minimum in Stock</h4>
                <p className="text-base font-normal">{minUnits} units</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 mb-2">Unit Cost</h4>
                <p className="text-base font-normal">
                  {formatINR(partData.unitCost || 0)}
                </p>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 mb-2">Part Type</h4>
                <p className="text-base font-normal text-yellow-500">
                  {partType}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-sm text-gray-600 mb-2">Available Quantity</h4>
              <p className="text-base font-normal">{availableUnits} units</p>
            </div>

            <hr className="border-t border-gray-200 my-4" />

            {/* Location Table */}
            <div className="mt-4 mb-8">
              <h4 className="font-medium text-gray-800 mb-3">Location</h4>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Location</th>
                      <th className="py-3 px-4 text-left font-medium">Area</th>
                      <th className="py-3 px-4 text-left font-medium">Units</th>
                      <th className="py-3 px-4 text-left font-medium">Minimum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {partData.locations?.length ? (
                      partData.locations.map((loc: any, i: number) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            const targetId = loc.locationId || loc.id;
                            if (targetId) navigate(`/locations/${targetId}`);
                          }}
                        >
                          <td className="py-3 px-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
                            <span className="text-gray-800 group-hover:text-blue-600 group-hover:underline">
                              {loc.name || loc.locationName || "Warehouse"}
                            </span>
                          </td>
                          <td className="py-3 px-4">{loc.area || "-"}</td>
                          <td className="py-3 px-4">{loc.unitsInStock ?? 0}</td>
                          <td className="py-3 px-4">{loc.minimumInStock ?? 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center text-gray-500 py-3">
                          No location data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <PartImages part={partData} />
            <PartFiles part={partData} />

            <hr className="border-t border-gray-200 my-4" />

            {/* Description */}
            <div className="py-4">
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 text-base leading-relaxed">
                {partData.description || "No description available"}
              </p>
            </div>

            <hr className="border-t border-gray-200 mt-4" />

            {/* QR & Assets */}
            <div className="grid grid-cols-2 gap-6 mb-8 mt-4 pb-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {(partData.qrCode && partData.qrCode.split("/").pop()) || "N/A"}
                </p>
                <div className="bg-white rounded-md shadow-sm flex items-center border p-2 w-fit">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${partData.qrCode}`}
                    alt="QR Code"
                    className="rounded-md w-24 h-24"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Assets ({partData.assets?.length || 0})
                </h4>
                {partData.assets?.length > 0 ? (
                  partData.assets.map((a: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-700 mb-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors group"
                      onClick={() => {
                        if (a.id) navigate(`/assets?assetId=${a.id}`);
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                        <Package2 className="w-5 h-5 text-yellow-500" />
                      </div>
                      <span className="text-gray-800 font-normal group-hover:text-blue-600 group-hover:underline">
                        {a.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No assets linked</p>
                )}
              </div>
            </div>

            <hr className="border-t border-gray-200 mt-2" />

            {/* Vendors */}
            <div className="pb-6 mb-8 mt-4 border-b">
              <h4 className="font-medium text-gray-800 mb-3">Vendors</h4>
              {partData.vendors?.length > 0 ? (
                partData.vendors.map((v: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (v.id || v.vendorId) {
                        navigate(`/vendors/${v.id || v.vendorId}`);
                      }
                    }}
                    className="flex items-center gap-2 text-gray-700 mb-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm group-hover:ring-2 group-hover:ring-green-200">
                      {v.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-600 font-medium group-hover:text-blue-600 group-hover:underline">
                      {v.name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No vendors linked</p>
              )}
            </div>

            {/* Teams */}
            <div className="pb-6 mb-8 mt-4 border-b">
              <h4 className="font-medium text-gray-800 mb-3">Teams</h4>
              {partData.teams?.length > 0 ? (
                partData.teams.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-gray-700 mb-1 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors group"
                    onClick={() => {
                      if (t.id) navigate(`/teams/${t.id}`);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                      {t.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-600 group-hover:text-blue-600 group-hover:underline">
                      {t.name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No teams linked</p>
              )}
            </div>

            <WorkOrderHistoryChart
              id="work-order-history"
              title="Work Order History"
              workOrderHistory={partData?.workOrders}
              filters={filters}
              dateRange={chartDateRanges["work-order-history"]}
              onDateRangeChange={handleDateRangeChange}
              groupByField="createdAt"
              lineName="Created"
              lineColor="#0091ff"
            />
          </>
        ) : (
          <div className="space-y-6 mt-4">
            {/* ✅ LOGS SECTION */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                 <HistoryIcon className="w-5 h-5 text-gray-500" />
                 Activity Log
              </h4>

              {logs && logs.length > 0 ? (
                 logs.map((log: any) => {
                    const changes = getReadableChanges(log.oldValue, log.newValue);
                    const authorName = userNames[log.authorId] || "Unknown User";

                    return (
                      <div key={log.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col gap-2">
                         <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                               <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  {log.activityType === "PART_CREATED" ? <Plus className="w-4 h-4 text-green-600"/> : <Activity className="w-4 h-4 text-blue-600"/>}
                                  {log.responseLog || log.activityType}
                               </span>
                               <span className="text-xs text-gray-500 mt-1">
                                  by <span className="font-medium text-gray-700">{authorName}</span> • {new Date(log.createdAt).toLocaleString()}
                               </span>
                            </div>
                         </div>

                         {/* ✅ Changes List */}
                         {changes.length > 0 ? (
                           <div className="mt-2 bg-gray-50 rounded border p-3 text-xs text-gray-700 space-y-1.5">
                             {changes.map((c, i) => (
                               <div key={i} className="flex items-center gap-2">
                                 <span className="font-semibold text-gray-600 uppercase tracking-wide text-[10px] w-24">{c.key}:</span>
                                 <span className="text-red-500 line-through">{String(c.from)}</span>
                                 <ArrowRight className="w-3 h-3 text-gray-400" />
                                 <span className="text-green-600 font-bold">{String(c.to)}</span>
                               </div>
                             ))}
                           </div>
                         ) : (
                           /* Fallback for updates with no visible field changes */
                           <div className="mt-1 text-xs text-gray-400 italic px-1">
                             No content changes recorded.
                           </div>
                         )}
                      </div>
                    );
                 })
              ) : (
                 <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-lg">
                   <p className="text-gray-500 text-sm">No history logs found.</p>
                 </div>
              )}
            </div>

            <div className="space-y-3 pt-6 border-t mt-6">
              <h4 className="font-medium text-gray-900">Record Stats</h4>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <UserCircle2 className="w-4 h-4 text-yellow-500" />
                <span>
                  Created{" "}
                  {userNames[partData.createdBy] ? (
                    <span
                      className="text-blue-600 hover:underline cursor-pointer ml-1"
                      onClick={() =>
                        navigate(`/users/profile/${partData.createdBy}`)
                      }
                    >
                      by {userNames[partData.createdBy]}
                    </span>
                  ) : (
                    "by Unknown"
                  )}
                </span>
                <CalendarDays className="w-4 h-4 text-gray-500 ml-1" />
                <span>
                  {partData.createdAt
                    ? new Date(partData.createdAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <UserCircle2 className="w-4 h-4 text-yellow-500" />
                <span>
                  Last Updated{" "}
                  {userNames[partData.updatedBy] ? (
                    <span
                      className="text-blue-600 hover:underline cursor-pointer ml-1"
                      onClick={() =>
                        navigate(`/users/profile/${partData.updatedBy}`)
                      }
                    >
                      by {userNames[partData.updatedBy]}
                    </span>
                  ) : (
                    ""
                  )}
                </span>
                <CalendarDays className="w-4 h-4 text-gray-500 ml-1" />
                <span>
                  {partData.updatedAt
                    ? new Date(partData.updatedAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
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
          onClick={handleUseInNewWorkOrder}
          variant="outline"
          className="text-yellow-600 border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap"
        >
          <Building2 className="w-5 h-5 mr-2" />
          Use in New Work Order
        </Button>
      </div>

      {showDeleteModal && (
        <DeletePartModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeletePart}
        />
      )}

      {showRestockModal && (
        <RestockModal
          isOpen={showRestockModal}
          onClose={() => setShowRestockModal(false)}
          part={partData}
          onConfirm={() => {
            setShowRestockModal(false);
            refreshLocalData();
          }}
        />
      )}
    </div>
  );
}