import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { FetchMetersParams } from "../../store/meters/meters.types"; // ✅ Imported Types
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
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ Debounce
  
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // ✅ FILTER PARAMETERS STATE
  const [filterParams, setFilterParams] = useState<FetchMetersParams>({
    page: 1, 
    limit: 50 
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isCreateRoute = useMatch("/meters/create");
  const isEditRoute = useMatch("/meters/:meterId/edit");

  const isEditMode = !!isEditRoute;
  const meterToEdit = isEditMode
    ? meterData.find((m) => m.id === isEditRoute?.params.meterId)
    : null;

  // ✅ DEBOUNCE EFFECT
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleShowNewMeterForm = () => {
    navigate("/meters/create");
  };

  const handleCancelForm = () => {
    navigate("/meters");
  };

  const handleCreateForm = async () => {
    console.log("Meter operation complete!");
    navigate("/meters");
    await fetchMeters();
  };

  // ✅ FETCH METERS (Memoized with Filters)
  const fetchMeters = useCallback(async () => {
    setLoading(true);
    // Keep selected if possible, else logic below handles it
    let res: any;

    try {
      if (showDeleted) {
        res = await meterService.fetchDeleteMeter();
      } else {
        // ✅ USE API PAYLOAD WITH FILTERS
        // Note: API uses 'name' for search
        const apiPayload = {
          ...filterParams,
          name: debouncedSearch || undefined 
        };

        // console.log("🔥 Meters API Call:", apiPayload);
        res = await meterService.fetchMeters(apiPayload);
      }

      // Keep existing sort or rely on backend
      const sortedData = [...res].sort(
        (a, b) =>
          new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
      );

      setMeterData(sortedData);

      // Only select first if nothing selected
      if (!selectedMeter && sortedData.length > 0) {
        setSelectedMeter(sortedData[0]);
      }
    } catch (err) {
      console.error(err);
      setMeterData([]);
    } finally {
      setLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch]); // Removed 'selectedMeter' to prevent loop

  // Initial Fetch
  useEffect(() => {
    fetchMeters();
  }, [fetchMeters, viewMode]); 

  // ✅ HANDLER: Filter Change
  const handleFilterChange = useCallback((newParams: Partial<FetchMetersParams>) => {
    setFilterParams((prev) => {
      const merged = { ...prev, ...newParams };
      if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
      return merged;
    });
  }, []);

  useEffect(() => {
    if (isDropdownOpen && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isDropdownOpen]);

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

  const handleDeleteMeter = (id) => {
    dispatch(deleteMeter(id))
      .unwrap()
      .then(() => {
        toast.success("Meter Deleted Successfully!");
        const indexToDelete = meterData.findIndex((meter) => meter.id === id);
        if (selectedMeter?.id === id && indexToDelete !== -1) {
          if (meterData.length === 1) {
            setSelectedMeter(null);
          } else if (indexToDelete === meterData.length - 1) {
            setSelectedMeter(meterData[indexToDelete - 1]);
          } else {
            setSelectedMeter(meterData[indexToDelete + 1]);
          }
        }
        setMeterData((prev) => prev.filter((meter) => meter.id !== id));
      })
      .catch((error) => {
        toast.error(error.message || "Failed to delete Meter");
      });
  };

  // console.log(showDeleted, "showDeleted");

  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="flex flex-col h-full">
        {MetersHeaderComponent(
          viewMode,
          setViewMode,
          searchQuery,
          setSearchQuery,
          handleShowNewMeterForm,
          setShowSettings,
          setIsSettingsModalOpen,
          setShowDeleted,
          handleFilterChange // ✅ Pass Filter Handler
        )}

        {viewMode === "table" ? (
          <>
            <MeterTable
              meter={meterData}
              selectedMeter={selectedMeter}
              setIsSettingsModalOpen={setIsSettingsModalOpen}
              isSettingsModalOpen={isSettingsModalOpen}
              fetchMeters={fetchMeters}
              showDeleted={showDeleted}
              setShowDeleted={setShowDeleted}
            />
          </>
        ) : (
          <>
            <div className="flex flex-1 overflow-hidden">
              <MetersList
                filteredMeters={meterData} // Use fetched data directly (filtering is now backend)
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
              />
            )}
          </>
        )}
      </div>
    </>
  );
}