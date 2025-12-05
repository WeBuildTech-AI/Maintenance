import React from "react";
import { formatDate } from "../utils/Date";
import { useNavigate } from "react-router-dom";

interface LocationDetailsProps {
  onClose: () => void;
  selectedLocation: any;
  parentName?: string;
}

const SubLocation: React.FC<LocationDetailsProps> = ({
  onClose,
  selectedLocation, // Ye wo location object hai jispar aapne click kiya
  parentName = "General",
}) => {
  const navigate = useNavigate();

  if (!selectedLocation) return null;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col relative">
      {/* --- Top Bar --- */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <button className="text-gray-700 text-xl" onClick={onClose}>
            &#8592;
          </button>

          {/* ✅ FIX: Yahan Sub-Location ka naam aayega */}
          <h1 className="text-2xl font-semibold capitalize">
            {selectedLocation.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded hover:bg-gray-200"
            title="Copy Link"
            onClick={() => {
              const url = `${window.location.origin}/locations/${selectedLocation.id}`;
              navigator.clipboard.writeText(url);
              alert("Link copied!");
            }}
          >
            🔗
          </button>

          <button
            className="px-3 py-1 border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={() => navigate(`/locations/${selectedLocation.id}/edit`)}
          >
            Edit
          </button>

          <button className="p-2 rounded hover:bg-gray-100">⋮</button>
        </div>
      </div>

      {/* --- Content --- */}
      <div className="px-6 py-6 flex-1">
        {/* Parent Location Section */}
        <div>
          <p className="text-gray-500 font-medium">Parent Location</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="text-blue-500 text-2xl">📍</div>
            <span className="text-gray-700 text-lg capitalize">
              {/* Yahan Parent ka naam dikhega */}
              {selectedLocation.parentLocationId?.name || parentName}
            </span>
          </div>
        </div>

        <hr className="my-8" />

        {/* Created By Info */}
        <div className="flex items-center gap-2 text-gray-700">
          <span>Created By</span>
          <span className="text-xl">⚽</span>
          <span className="font-medium capitalize">
            {selectedLocation.createdBy?.fullName ||
              selectedLocation.createdById ||
              "Unknown"}
          </span>
          <span className="text-gray-500">
            on {formatDate(selectedLocation.createdAt)}
          </span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="w-full flex justify-center pb-6">
        <button className="px-6 py-3 bg-white border border-blue-500 text-blue-600 rounded-full shadow-sm hover:bg-blue-50 flex items-center gap-2">
          🗂 Use in New Work Order
        </button>
      </div>
    </div>
  );
};

export default SubLocation;
