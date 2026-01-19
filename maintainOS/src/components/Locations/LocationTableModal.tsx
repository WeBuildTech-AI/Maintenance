"use client";
import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import LocationDetails from "./LocationDetails";
import { NewLocationForm } from "./NewLocationForm/NewLocationForm";
import { deleteLocation } from "../../store/locations";
import type { AppDispatch, RootState } from "../../store";

interface LocationTableModalProps {
  data: any; // Full location object
  onClose: () => void;
  fetchData: () => void;
  showDeleted: boolean;
}

const LocationTableModal: React.FC<LocationTableModalProps> = ({
  onClose,
  data,
  fetchData,
  showDeleted,
}) => {
  // ✅ Switch between View and Edit Mode internally
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ Local state to hold the latest data inside the modal
  const [currentData, setCurrentData] = useState(data);

  const modalRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  // ✅ Sync state if the prop 'data' changes (e.g. if parent re-renders)
  useEffect(() => {
    // Only update if IDs match to avoid overwriting edits with stale props
    if (data?.id === currentData?.id) {
        setCurrentData((prev: any) => ({ ...prev, ...data }));
    } else {
        setCurrentData(data);
    }
  }, [data]);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // ✅ Internal Delete Logic for Modal
  const handleDeleteLocation = async (id: string) => {
    try {
      await dispatch(deleteLocation(id)).unwrap();
      toast.success("Location deleted successfully!");
      onClose(); // Close modal immediately after delete
      fetchData(); // Refresh Parent Table
    } catch (err) {
      console.error("Error deleting location:", err);
      toast.error("Failed to delete location.");
    }
  };

  // ✅ Reset Edit State whenever a new Location is opened
  useEffect(() => {
    setIsEditing(false);
  }, [data?.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex w-full items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-md w-full max-w-4xl h-full flex flex-col overflow-auto bg-white animate-in fade-in zoom-in-95 duration-200"
        onClick={handleContentClick}
        ref={modalRef}
      >
        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50">
          <h2 className="text-lg font-semibold capitalize text-gray-800">
            {isEditing ? "Edit Location" : "Location Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 cursor-pointer rounded-full transition-colors text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* --- Content Body --- */}
        <div className="flex-1 overflow-y-auto relative">
          {isEditing ? (
            // 📝 EDIT MODE (Form with Prefill Data)
            <div className="p-4">
              <NewLocationForm
                // ⭐ CRITICAL: Key forces re-render so prefill works immediately
                key={currentData?.id || "edit-form"} 
                isEdit={true}
                editData={currentData} // ✅ Passing LOCAL state data
                
                fetchLocations={fetchData}
                fetchLocationById={() => {}}
                
                // ✅ Cancel brings back to Details View
                onCancel={() => setIsEditing(false)}
                
                // ✅ Success refreshes data locally AND globally
                onSuccess={(updatedLocation: any) => {
                  // 🔥 FIXED: Merge updated fields with existing full object
                  setCurrentData((prev: any) => ({ ...prev, ...updatedLocation })); 
                  
                  fetchData(); // Refresh Table Data in background
                  setIsEditing(false); // Go back to details
                }}
                
                onCreate={() => {}} // Not used in Edit mode
                initialParentId={undefined}
                isSubLocation={false}
                setSelectedLocation={() => {}}
              />
            </div>
          ) : (
            // 👀 VIEW MODE (Details)
            <LocationDetails
              selectedLocation={currentData} // ✅ Showing LOCAL state data
            
              onEdit={() => setIsEditing(true)}
              handleDeleteLocation={handleDeleteLocation}
              handleShowNewSubLocationForm={() => {}} 
              user={user}
              showDeleted={showDeleted}
              fetchLocation={fetchData}
              onClose={onClose}
              setShowSubLocation={() => {}}
              onSubLocationClick={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationTableModal;