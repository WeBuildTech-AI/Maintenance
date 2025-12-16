import {
  Edit,
  MoreHorizontal,
  Link as LinkIcon,
  Plus,
  MapPin,
  ChevronRight,
  Building2,
  Users,
  Briefcase,
  Box,
  Activity,
  ClipboardList,
  Settings2,
} from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import QRCode from "react-qr-code";
import { formatDate } from "../utils/Date";
import DeleteModal from "./DeleteModal";
import { LocationImages } from "./LocationImages";
import { LocationFiles } from "./LocationFiles";
import { Tooltip } from "../ui/tooltip";
import { locationService } from "../../store/locations";

// Props interface
interface LocationDetailsProps {
  selectedLocation: any;
  handleDeleteLocation: (id: string) => void;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  onEdit?: (location: any) => void;
  handleShowNewSubLocationForm: (show: boolean) => void;
  restoreData: string;
  fetchLocation: () => void;
  onClose: () => void;
  setShowSubLocation: (show: boolean) => void;
  onSubLocationClick: (location: any) => void;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({
  selectedLocation,
  handleDeleteLocation,
  user,
  handleShowNewSubLocationForm,
  restoreData,
  fetchLocation,
  onClose,
  onSubLocationClick,
}) => {
  const navigate = useNavigate();
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleRestoreLocationData = async (id: string) => {
    try {
      await locationService.restoreLocationData(id);
      fetchLocation();
      onClose();
      toast.success("Successfully Restored the Location Data");
    } catch (err) {
      toast.error("Failed to Restore the Location Data");
    }
  };

  // ✅ UPDATED: Pass the FULL location object, not just ID
  const handleUseInWorkOrder = () => {
    navigate("/work-orders/create", {
      state: { 
        preselectedLocation: selectedLocation 
      },
    });
  };

  // Helper for Status Badge
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
      online: "bg-green-100 text-green-700 border-green-200",
      offline: "bg-gray-100 text-gray-700 border-gray-200",
      open: "bg-blue-100 text-blue-700 border-blue-200",
      in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
      done: "bg-green-100 text-green-700 border-green-200",
      on_hold: "bg-red-100 text-red-700 border-red-200",
    };
    const style = colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase ${style}`}
      >
        {status?.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="mx-auto flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex-none border-b bg-white px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="capitalize text-xl font-semibold text-gray-800">
            {selectedLocation?.name || "Unnamed Location"}
          </h2>
          <div className="flex items-center gap-2">
            <Tooltip text="Copy Link">
              <button
                title="Copy Link"
                onClick={() => {
                  const url = `${window.location.origin}/locations/${selectedLocation.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Location link copied!");
                }}
                className="cursor-pointer rounded-md p-2 text-orange-600 hover:bg-orange-50"
              >
                <LinkIcon size={18} />
              </button>
            </Tooltip>
            <button
              title="Edit"
              className="flex cursor-pointer items-center gap-1 rounded-md border border-orange-600 px-3 py-1.5 text-orange-600 hover:bg-orange-50"
              onClick={() => {
                navigate(`/locations/${selectedLocation.id}/edit`);
              }}
            >
              <Edit size={16} /> Edit
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-2">
                <DropdownMenuItem onClick={() => setOpenDeleteModal(true)}>
                  Delete
                </DropdownMenuItem>
                {restoreData && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleRestoreLocationData(selectedLocation?.id)
                    }
                  >
                    {restoreData}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow overflow-y-auto p-6 pb-24">
        {selectedLocation.address && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700">Address</h3>
            <p className="mt-1 text-gray-600">{selectedLocation.address}</p>
          </div>
        )}

        {selectedLocation.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <p className="mt-1 text-gray-600">{selectedLocation.description}</p>
          </div>
        )}

        {/* --- TEAMS & VENDORS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {selectedLocation.teams && selectedLocation.teams.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                <Users size={16} className="text-blue-600" /> Teams in Charge
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedLocation.teams.map((team: any) => (
                  <span
                    key={team.id}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
                  >
                    {team.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedLocation.vendors && selectedLocation.vendors.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                <Briefcase size={16} className="text-purple-600" /> Vendors
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedLocation.vendors.map((vendor: any) => (
                  <span
                    key={vendor.id}
                    className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-100"
                  >
                    {vendor.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- ASSETS --- */}
        {selectedLocation.assets && selectedLocation.assets.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
              <Box size={16} className="text-green-600" /> Assets (
              {selectedLocation.assets.length})
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {selectedLocation.assets.map((asset: any) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {asset.name}
                  </span>
                  <StatusBadge status={asset.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- METERS --- */}
        {selectedLocation.meters && selectedLocation.meters.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
              <Activity size={16} className="text-red-500" /> Meters (
              {selectedLocation.meters.length})
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {selectedLocation.meters.map((meter: any) => (
                <div
                  key={meter.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {meter.name}
                  </span>
                  <span className="text-xs text-gray-500 uppercase bg-white border px-2 py-0.5 rounded">
                    {meter.meterType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- WORK ORDERS --- */}
        {selectedLocation.workOrders &&
          selectedLocation.workOrders.length > 0 && (
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                <ClipboardList size={16} className="text-orange-600" /> Work
                Orders ({selectedLocation.workOrders.length})
              </h3>
              <div className="space-y-2">
                {selectedLocation.workOrders.map((wo: any) => (
                  <div
                    key={wo.id}
                    className="p-3 border rounded-lg bg-white hover:shadow-sm transition"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-800">
                        {wo.title}
                      </h4>
                      <StatusBadge status={wo.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>Priority:</span>
                      <span
                        className={`capitalize font-medium ${
                          wo.priority === "high"
                            ? "text-red-600"
                            : wo.priority === "medium"
                            ? "text-yellow-600"
                            : "text-blue-600"
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

 
        <hr className="my-4" />

        <LocationImages location={selectedLocation} />
        <LocationFiles location={selectedLocation} />

        {selectedLocation.qrCode && (
          <div className="mt-6 ">
            <h3 className="text-sm font-medium text-gray-700">
              QR Code/Barcode
            </h3>
            <h4 className="mt-2 text-sm text-gray-700">
              {selectedLocation.qrCode.split("/").pop()}
            </h4>
            <div className="mb-3 mt-2 flex justify-start">
              <div className="w-fit rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                <div className="ro mb-1 flex justify-center">
                  <QRCode value={selectedLocation.qrCode} size={100} />
                </div>
              </div>
            </div>
          </div>
        )}

        <hr className="my-4" />

        <div className="mt-4">
          {/* Sub Locations List */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-900">
              Sub-Locations ({selectedLocation?.children?.length || 0})
            </h2>
            <button
              onClick={() => handleShowNewSubLocationForm(true)}
              className="flex items-center gap-2 text-orange-600 text-sm cursor-pointer font-medium transition-colors"
            >
              <div className="w-4 h-4 rounded-full border-2 border-orange-600 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </div>
              Create Sub-Location
            </button>
          </div>

          <div className="divide-y divide-gray-200 mb-4 bg-gray-50 rounded-lg border">
            {Array.isArray(selectedLocation?.children) &&
              selectedLocation.children.map((location: any) => (
                <button
                  key={location?.id || Math.random()}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-100 transition-colors group"
                  onClick={() => onSubLocationClick(location)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-900 text-sm font-medium">
                      {location?.name || "Unnamed Location"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            {(!selectedLocation?.children ||
              selectedLocation.children.length === 0) && (
              <div className="p-4 text-center text-xs text-gray-500">
                No sub-locations found.
              </div>
            )}
          </div>
        </div>

        <hr className="my-4" />

        {/* Footer Info */}
        <div className="text-sm text-gray-500 mt-2 pb-10">
          Created By{" "}
          <span className="capitalize font-medium text-gray-700">
            {user?.fullName}
          </span>{" "}
          on {formatDate(selectedLocation.createdAt)}
        </div>
      </div>

      {/* --- FLOATING BUTTON --- */}
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
          onClick={handleUseInWorkOrder}
          className="text-yellow-600 border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap cursor-pointer"
        >
          <Building2 className="w-5 h-5 mr-2" />
          Use in New Work Order
        </Button>
      </div>

      {openDeleteModal && (
        <DeleteModal
          modalRef={modalRef}
          onClose={() => setOpenDeleteModal(false)}
          onConfirm={() => {
            handleDeleteLocation(selectedLocation.id);
            setOpenDeleteModal(false);
          }}
        />
      )}
    </div>
  );
};

export default LocationDetails;