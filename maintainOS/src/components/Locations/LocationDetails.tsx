import {
  Edit,
  MoreHorizontal,
  Link as LinkIcon,
  Plus,
  MapPin,
  ChevronRight,
} from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router-dom";
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
import type { Location } from "./location.types";


// Props interface
interface LocationDetailsProps {
  selectedLocation: Location;
  handleDeleteLocation: (id: string) => void;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  onEdit?: (location: Location) => void;
  handleShowNewSubLocationForm;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({
  selectedLocation,
  handleDeleteLocation,
  user,
  onEdit,
  handleShowNewSubLocationForm,
}) => {
  const navigate = useNavigate(); 
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-none border-b bg-white px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="capitalize text-xl font-semibold text-gray-800">
            {selectedLocation?.name || "Unnamed Location"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              title="Copy Link"
              onClick={() => {
                const url = `${window.location.origin}/locations/${selectedLocation.id}`;
                navigator.clipboard.writeText(url);
                toast.success("Location link copied!");
              }}
              className="cursor-pointer rounded-md p-2 text-orange-600"
            >
              <LinkIcon size={18} />
            </button>

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
                <DropdownMenuItem
                  // onClick={() => handleDeleteLocation(selectedLocation.id)}
                  onClick={() => setOpenDeleteModal(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow overflow-y-auto p-6">
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

        <LocationImages location={selectedLocation} />

        <LocationFiles location={selectedLocation} />

        {selectedLocation.qrCode && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700">
              QR Code/Barcode
            </h3>
            <h4 className="mt-2 text-sm text-gray-700">
              {selectedLocation.qrCode.split("/").pop() }
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

        <div>
          {/* Check if there are no sub-locations */}
          {Array.isArray(selectedLocation?.children) &&
          selectedLocation.children.length === 0 ? (
            <div className="mb-6 mt-2">
              <h3 className="text-sm font-medium text-gray-700">
                Sub-Locations ({selectedLocation?.children?.length || 0})
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add sub elements inside this Location
              </p>

              <button
                onClick={handleShowNewSubLocationForm}
                className="mt-2 cursor-pointer text-sm text-orange-600 hover:underline"
              >
                Create Sub-Location
              </button>
            </div>
          ) : (
            <div className="bg-white max-h-48 mt-2 p-">
              <div className="max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Sub-Locations ({selectedLocation?.children?.length || 0})
                  </h2>
                  <button
                    onClick={handleShowNewSubLocationForm}
                    className="flex items-center gap-2 text-orange-600 text-sm cursor-pointer font-medium transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </div>
                    Create Sub-Location
                  </button>
                </div>

                {/* Location List */}
                <div className="divide-y divide-gray-200 mb-4">
                  {Array.isArray(selectedLocation?.children) &&
                    selectedLocation.children.map((location) => (
                      <button
                        key={location?.id || Math.random()}
                        // onClick={() => handleLocationClick(location?.name)}
                        className="w-full flex items-center justify-between py-2  hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-orange-600" />
                          <span className="text-gray-900 text-sm">
                            {location?.name || "Unnamed Location"}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* Created/Updated info */}
        <div className="text-sm text-gray-500 mt-2">
          Created By{" "}
          <span className="capitalize font-medium text-gray-700">
            {user?.fullName}
          </span>{" "}
          on {formatDate(selectedLocation.createdAt)}
        </div>
        {selectedLocation.updatedAt !== selectedLocation.createdAt && (
          <div className="mt-2 text-sm text-gray-500">
            Updated By{" "}
            <span className="capitalize font-medium text-gray-700">
              {user?.fullName}
            </span>{" "}
            on {formatDate(selectedLocation.updatedAt)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className=" border-t bg-transparent p-4">
        <div className="flex justify-center">
          <NavLink to="/work-orders">
            <button className="cursor-pointer p-2 rounded-full border border-orange-600 bg-white px-5 py-3 text-sm text-orange-600 shadow-sm transition hover:bg-orange-50">
              Use in New Work Order
            </button>
          </NavLink>
        </div>
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
