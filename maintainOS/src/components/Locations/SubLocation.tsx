import React, { useState, useRef } from "react";
import { formatDate } from "../utils/Date";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  ArrowLeft,
  Users,
  Briefcase,
  Box,
  ClipboardList,
  Building2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import api from "../../store/auth/auth.service";
import toast from "react-hot-toast";
import DeleteModal from "./DeleteModal";

interface LocationDetailsProps {
  onClose: () => void;
  selectedLocation: any;
  parentName?: string;
  onDelete?: () => void;
}

const SubLocation: React.FC<LocationDetailsProps> = ({
  onClose,
  selectedLocation,
  parentName = "General",
  onDelete,
}) => {
  const navigate = useNavigate();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!selectedLocation) return null;
  const user = useSelector((state: RootState) => state.auth.user);

  const handleUseInWorkOrder = () => {
    navigate("/work-orders/create", {
      state: { 
        preselectedLocation: selectedLocation 
      },
    });
  };

  const handleDeleteSubLocation = async () => {
    try {
      await api.delete("/locations/batch-delete", {
        data: { ids: [selectedLocation.id] },
      });
      toast.success("Sub-location deleted successfully!");
      setOpenDeleteModal(false);
      if (onDelete) {
        onDelete();
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete the sub-location.");
    }
  };

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
    <div className="w-full h-full bg-white flex flex-col relative">
      {/* --- Top Bar --- */}
      <div className="flex-none flex items-center justify-between px-4 py-4 border-b bg-white z-10">
        <div className="flex items-center gap-3">
          <button
            className="text-gray-700 hover:text-gray-900 transition-colors"
            onClick={onClose}
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-xl font-semibold capitalize text-gray-800">
            {selectedLocation.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50 text-sm font-medium"
            onClick={() => navigate(`/locations/${selectedLocation.id}/edit`)}
          >
            Edit
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={() => setOpenDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- Content --- */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Parent Info */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-600 uppercase font-bold tracking-wide mb-1">
            Parent Location
          </p>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-blue-500" />
            <span className="text-gray-800 font-medium capitalize">
              {selectedLocation.parentLocationId?.name || parentName}
            </span>
          </div>
        </div>

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
                <Users size={16} className="text-blue-600" /> Teams
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedLocation.teams.map((team: any) => (
                  <span
                    key={team.id}
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
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
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                    className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
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
                  onClick={() => navigate(`/assets/${asset.id}`)}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
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
                    onClick={() => navigate(`/work-orders/${wo.id}`)}
                    className="p-3 border rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-800">
                        {wo.title}
                      </h4>
                      <StatusBadge status={wo.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <hr className="my-8" />

        {/* Created By Info */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Created By</span>
          <span className="font-medium capitalize text-orange-600">
            {user?.fullName}
          </span>
          <span>on {formatDate(selectedLocation.createdAt)}</span>
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
          onConfirm={handleDeleteSubLocation}
        />
      )}
    </div>
  );
};

export default SubLocation;
