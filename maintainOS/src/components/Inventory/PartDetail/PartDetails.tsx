import {
  Building2,
  CalendarDays,
  Check,
  Edit,
  Link as LinkIcon,
  MapPin,
  MoreVertical,
  Package2,
  Plus,
  UserCircle2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import DeletePartModal from "./DeletePartModal";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { deletePart } from "../../../store/parts/parts.thunks";
import toast from "react-hot-toast";

export function PartDetails({
  item,
  stockStatus,
  onEdit,
  onDeleteSuccess, // ✅ added prop
}: {
  item: any;
  stockStatus?: { ok: boolean; delta: number } | null;
  onEdit: () => void;
  onDeleteSuccess: (id: string) => void; // ✅ added type
}) {
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

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
      await dispatch(deletePart(item.id)).unwrap();
      toast.success("Part deleted successfully!");
      setShowDeleteModal(false);

      // ✅ instantly update list
      onDeleteSuccess(item.id);

      // ✅ navigate back to inventory
      navigate("/inventory");
    } catch (error: any) {
      console.error("❌ Delete failed:", error);
      toast.error(error || "Failed to delete part");
    } finally {
      setLoading(false);
    }
  };

  // ✅ instant navigation + send data to edit route (prefill)
  const handleEditPart = () => {
    setEditLoading(true);
    navigate(`/inventory/${item.id}/edit`, {
      state: { partData: item },
    });
    // small timeout just to show the overlay while the route mounts
    setTimeout(() => setEditLoading(false), 800);
  };

  // ✅ Fallback handling for units and part type
  const availableUnits = item.unitsInStock ?? item.locations?.[0]?.unitsInStock ?? 0;
  const minUnits = item.minInStock ?? item.locations?.[0]?.minimumInStock ?? 0;
  const partType =
    Array.isArray(item.partsType)
      ? item.partsType[0]?.name || item.partsType[0] || "N/A"
      : item.partsType?.name || "N/A";

  return (
    <div className="flex flex-col h-full bg-white shadow-sm border relative">
      {editLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-yellow-600 font-medium text-sm">Opening edit form...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start p-6 relative">
        <div>
          <h2 className="text-2xl font-normal">{item.name}</h2>
          <p className="text-base text-gray-700 mt-2">
            {availableUnits} units in stock
          </p>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Copy link */}
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

          {/* Restock */}
          <Button
            className="bg-white text-yellow-600 hover:bg-yellow-50 border-2 border-yellow-400 rounded-md px-4 py-2 font-medium"
            onClick={() => navigate(`/inventory/${item.id}/restock`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Restock
          </Button>

          {/* Edit */}
          <Button
            onClick={handleEditPart}
            className="bg-white text-yellow-600 hover:bg-yellow-50 border-2 border-yellow-400 rounded-md px-4 py-2 font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          {/* Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 hover:bg-transparent"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>

            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                style={{ right: "10px", transform: "translateX(-10%)" }}
              >
                <ul className="text-gray-800 text-sm">
                  <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    Order this Part
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    Copy to New Part
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    Export QR Codes
                  </li>
                  <hr className="my-1 border-yellow-200" />
                  <li
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2 text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    Delete
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {activeTab === "details" ? (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-3 gap-8 mb-8 pb-8">
              <div>
                <h4 className="text-sm text-gray-600 mb-2">Minimum in Stock</h4>
                <p className="text-base font-normal">{minUnits} units</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 mb-2">Unit Cost</h4>
                <p className="text-base font-normal">
                  ${item.unitCost?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 mb-2">Part Type</h4>
                <p className="text-base font-normal text-yellow-500">
                  {partType}
                </p>
              </div>
            </div>

            {/* Available Quantity */}
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
                    {item.locations?.length ? (
                      item.locations.map((loc: any, i: number) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                          <td className="py-3 px-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
                            <span className="text-gray-800">
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

            {/* Images */}
            {item.photos?.length > 0 && (
              <div className="mb-8">
                <h4 className="font-medium text-gray-800 mb-3">Part Images</h4>
                <div
                  className={`grid gap-3 ${
                    item.photos.length === 1
                      ? "grid-cols-1"
                      : item.photos.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                  }`}
                >
                  {item.photos.map((photo: any, i: number) => (
                    <div
                      key={i}
                      className="border rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                      style={{
                        width: "120px",
                        height: "120px",
                        alignSelf: "start",
                      }}
                    >
                      <img
                        src={
                          photo.base64
                            ? `data:${photo.mimetype};base64,${photo.base64}`
                            : photo.url
                        }
                        alt={`Part ${i + 1}`}
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-t border-gray-200 my-4" />

            {/* Description */}
            <div className="py-4">
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 text-base leading-relaxed">
                {item.description || "No description available"}
              </p>
            </div>

            <hr className="border-t border-gray-200 mt-4" />

            {/* QR & Assets */}
            <div className="grid grid-cols-2 gap-6 mb-8 mt-4 pb-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {item.qrCode || "N/A"}
                </p>
                <div className="bg-white rounded-md shadow-sm flex items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${item.qrCode}`}
                    alt="QR Code"
                    className="rounded-md"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Assets ({item.assets?.length || 0})
                </h4>
                {item.assets?.length > 0 ? (
                  item.assets.map((a: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-700 mb-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                        <Package2 className="w-5 h-5 text-yellow-500" />
                      </div>
                      <span className="text-gray-800 font-normal">{a.name}</span>
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
              {item.vendors?.length > 0 ? (
                item.vendors.map((v: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-gray-700 mb-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">
                      {v.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-600">{v.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No vendors linked</p>
              )}
            </div>

            {/* Teams */}
            <div className="pb-6 mb-8 mt-4 border-b">
              <h4 className="font-medium text-gray-800 mb-3">Teams</h4>
              {item.teams?.length > 0 ? (
                item.teams.map((t: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700 mb-1">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                      {t.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-600">{t.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No teams linked</p>
              )}
            </div>

            {/* Created / Updated */}
            <div className="space-y-3 mb-8 mt-4">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <UserCircle2 className="w-4 h-4 text-yellow-500" />
                <span>Created</span>
                <CalendarDays className="w-4 h-4 text-gray-500 ml-1" />
                <span>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <UserCircle2 className="w-4 h-4 text-yellow-500" />
                <span>Last Updated</span>
            
                <CalendarDays className="w-4 h-4 text-gray-500 ml-1" />
                <span>
                  {item.updatedAt
                    ? new Date(item.updatedAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500 italic">History will appear here...</div>
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
          variant="outline"
          className="text-yellow-600 border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap"
        >
          <Building2 className="w-5 h-5 mr-2" />
          Use in New Work Order
        </Button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeletePartModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeletePart}
        />
      )}
    </div>
  );
}
