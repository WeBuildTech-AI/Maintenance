import React, { useEffect, useRef, useState } from "react";
import { MeterDetail } from "./MeterDetail/MeterDetail";
import { MetersEmptyState } from "./MetersEmptyState";
import { MetersHeaderComponent } from "./MetersHeader";
import { MetersList } from "./MetersList/MetersList";
import { NewMeterForm } from "./NewMeterForm/NewMeterForm";
import { MeterTable } from "./MeterTable";
import {
  deleteMeter,
  meterService,
  type MeterResponse,
} from "../../store/meters";
import type { ViewMode } from "../purchase-orders/po.types";

import { useNavigate, useMatch } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import Loader from "../Loader/Loader";
import { ReadingHistory } from "./MeterDetail/ReadingHistory";
import RecordReadingModal from "./MeterDetail/RecordReadingModal";

export function Meters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [meterData, setMeterData] = useState<MeterResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReadingMeter, setShowReadingMeter] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [selectedMeter, setSelectedMeter] = useState<
    (typeof meterData)[0] | null
  >(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortType, setSortType] = useState("Name"); // "Name", "Status", or "Last Reading"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [openSection, setOpenSection] = useState("Name");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  // const modalRef = useRef(null);

  const dispatch = useDispatch<AppDispatch>();

  // 🔽 Router hooks to manage /create and /:id/edit
  const navigate = useNavigate();
  const isCreateRoute = useMatch("/meters/create");
  const isEditRoute = useMatch("/meters/:meterId/edit");

  // 🔽 Derived State: Determine if we are in edit mode and fetch the data if needed
  const isEditMode = !!isEditRoute;
  const meterToEdit = isEditMode
    ? meterData.find((m) => m.id === isEditRoute?.params.meterId)
    : null;

  const handleShowNewMeterForm = () => {
    navigate("/meters/create");
  };

  const handleCancelForm = () => {
    navigate("/meters");
  };

  // 🔍 Derived: Filtered meter list based on search
  const filteredMeters = meterData.filter((meter) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true; // show all if search empty

    // Choose what fields to search on
    return meter.name?.toLowerCase().includes(q);
  });

  const handleCreateForm = async () => {
    // Your create/update meter logic will go here
    console.log("Meter operation complete!");
    navigate("/meters");
    await fetchMeters();
  };

  const fetchMeters = async () => {
    setLoading(true);
    try {
      const res = await meterService.fetchMeters(10, 1, 0);

      const sortedData = [...res].sort(
        (a, b) =>
          new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
      );

      setMeterData(sortedData);

      // ✅ Only set selectedMeter AFTER data is fetched successfully
      if (sortedData.length > 0) {
        setSelectedMeter(sortedData[0]); // or whatever default you want
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // NEW: useEffect for sorting and filtering the meters

  // NEW: useEffect to position the custom dropdown
  useEffect(() => {
    if (isDropdownOpen && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isDropdownOpen]);

  // NEW: useEffect to close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  // handle

  // 2. Call the new function inside your useEffect
  useEffect(() => {
    fetchMeters();
  }, []); // This still runs only once on mount

  const handleDeleteMeter = (id) => {
    dispatch(deleteMeter(id))
      .unwrap()
      .then(() => {
        toast.success("Meter Deleted Successfully!");

        // ✨ Naya logic, aapke location wale code jaisa ✨

        // Step 1: Delete hone wale item ka index find karo
        const indexToDelete = meterData.findIndex((meter) => meter.id === id);

        // Step 2: Naya meter sirf tab select karo jab deleted meter hi active/selected tha
        if (selectedMeter?.id === id && indexToDelete !== -1) {
          // Case 1: Agar list mein sirf ek hi item tha
          if (meterData.length === 1) {
            setSelectedMeter(null);
          }
          // Case 2: Agar aakhri item delete hua hai, toh pichla wala select karo
          else if (indexToDelete === meterData.length - 1) {
            setSelectedMeter(meterData[indexToDelete - 1]);
          }
          // Case 3: Baaki sab cases mein (pehla ya beech ka), agla wala select karo
          else {
            setSelectedMeter(meterData[indexToDelete + 1]);
          }
        }

        // Step 3: Frontend ki list ko manually update karo
        // Yeh maan kar ki aapke paas setFilteredMeters state setter hai
        setMeterData((prev) => prev.filter((meter) => meter.id !== id));

        // Optional: Agar aapko delete ke baad page navigate karna hai
        // navigate("/meters");
      })
      .catch((error) => {
        toast.error(error.message || "Failed to delete Meter");
      });
  };

  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="flex flex-col h-full">
        {/* Header */}
        {MetersHeaderComponent(
          viewMode,
          setViewMode,
          searchQuery,
          setSearchQuery,
          handleShowNewMeterForm,
          setShowSettings,
          setIsSettingsModalOpen,
          // setSelectedMeter
        )}

        {viewMode === "table" ? (
          <>
            <MeterTable meter={meterData} selectedMeter={selectedMeter} setIsSettingsModalOpen={setIsSettingsModalOpen} isSettingsModalOpen={isSettingsModalOpen}  />
          </>
        ) : (
          <>
            <div className="flex flex-1 overflow-hidden">
              <MetersList
                // filteredMeters={filteredMeters}
                filteredMeters={filteredMeters}
                selectedMeter={selectedMeter}
                setSelectedMeter={setSelectedMeter}
                loading={loading}
                handleShowNewMeterForm={handleShowNewMeterForm}
                handleCreateForm={handleCreateForm}
                handleCancelForm={handleCancelForm}
                setShowReadingMeter={setShowReadingMeter}
              />

              <div className="flex-1 bg-card">
                {isCreateRoute || isEditRoute ? (
                  <NewMeterForm
                    onCancel={handleCancelForm}
                    onCreate={handleCreateForm}
                    // Pass the derived meter data for editing
                    editingMeter={meterToEdit}
                  />
                ) : selectedMeter ? (
                  loading ? (
                    <div className="flex justify-center item-center h-full">
                      <Loader />
                    </div>
                  ) : selectedMeter ? (
                    showReadingMeter === true ? (
                      <ReadingHistory
                        selectedMeter={selectedMeter || []}
                        onBack={() => setShowReadingMeter(!showReadingMeter)}
                        setIsRecordModalOpen={setIsRecordModalOpen}
                      />
                    ) : (
                      <MeterDetail
                        selectedMeter={selectedMeter}
                        fetchMeters={fetchMeters}
                        handleDeleteMeter={handleDeleteMeter}
                        setShowReadingMeter={setShowReadingMeter}
                        setIsRecordModalOpen={setIsRecordModalOpen}
                      />
                    )
                  ) : null
                ) : (
                  <MetersEmptyState />
                )}
              </div>
            </div>
            {isRecordModalOpen && (
              <RecordReadingModal
                modalRef={modalRef}
                selectedMeter={selectedMeter}
                onClose={() => setIsRecordModalOpen(false)}
                fetchMeters={fetchMeters}
                // onConfirm={handleRecordReadingConfirm}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
