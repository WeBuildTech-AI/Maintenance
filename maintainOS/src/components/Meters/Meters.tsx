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
import { type FetchMetersParams } from "../../store/meters/meters.types";
import type { ViewMode } from "../purchase-orders/po.types";
import { useNavigate, useMatch, useSearchParams } from "react-router-dom"; // ✅ Imported useSearchParams
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import Loader from "../Loader/Loader";
import { ReadingHistory } from "./MeterDetail/ReadingHistory";
import RecordReadingModal from "./MeterDetail/RecordReadingModal";

export function Meters() {
  // ✅ 1. URL Search Params Setup
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ 2. Initialize State from URL (Refresh hone par yahan se value uthayega)
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") || ""
  );

  const [showSettings, setShowSettings] = useState(false);

  // const [viewMode, setViewMode] = useState<ViewMode>(() => {
  //   return (searchParams.get("viewMode") as ViewMode) || "panel";
  // });

  const [meterData, setMeterData] = useState<MeterResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [showReadingMeter, setShowReadingMeter] = useState(() => {
    return searchParams.get("reading") === "true";
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("meterViewMode");
    return (savedMode as ViewMode) || "panel";
  });
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // FILTER PARAMETERS STATE (Page Number URL se read karega)
  const [filterParams, setFilterParams] = useState<FetchMetersParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: 50,
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isCreateRoute = useMatch("/meters/create");
  const isEditRoute = useMatch("/meters/:meterId/edit");

  const isEditMode = !!isEditRoute;
  const meterToEdit = isEditMode
    ? meterData.find((m) => m.id === isEditRoute?.params.meterId)
    : null;

  useEffect(() => {
    if (viewMode === "table") {
      localStorage.setItem("meterViewMode", "table");
    } else {
      localStorage.removeItem("meterViewMode");
    }
  }, [viewMode]);

  useEffect(() => {
    const params: any = {};

    if (debouncedSearch) params.search = debouncedSearch;

    if (viewMode === "panel" && selectedMeter?.id) {
      params.meterId = selectedMeter.id;
    }

    // Only add reading if true AND in panel mode
    if (viewMode === "panel" && showReadingMeter) {
      params.reading = "true";
    }

    setSearchParams(params, { replace: true });
  }, [
    viewMode,
    // filterParams.page, // Uncomment if you use page in URL
    debouncedSearch,
    showReadingMeter,
    selectedMeter?.id,
  ]);

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
  const fetchMeters = useCallback(async () => {
    setLoading(true);

    try {
      let res: any;

      if (showDeleted) {
        res = await meterService.fetchDeleteMeter();
      } else {
        const apiPayload = {
          ...filterParams,
          name: debouncedSearch || undefined,
        };
        res = await meterService.fetchMeters(apiPayload);
      }

      const safeData = Array.isArray(res) ? res : [];

      const sortedData = [...safeData].sort(
        (a, b) =>
          new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
      );

      // ✅ ONLY update list
      setMeterData(sortedData);
    } catch (err) {
      console.error(err);
      setMeterData([]);
    } finally {
      setLoading(false); // 🔥 THIS is the signal
    }
  }, [showDeleted, filterParams, debouncedSearch]);

  useEffect(() => {
    // Do nothing while API is loading
    if (loading) return;

    // No data
    if (!meterData || meterData.length === 0) {
      setSelectedMeter(null);
      return;
    }

    const urlMeterId = searchParams.get("meterId");

    // 1️⃣ URL has priority
    if (urlMeterId) {
      const found = meterData.find((m) => String(m.id) === String(urlMeterId));
      if (found) {
        setSelectedMeter(found);
        return;
      }
    }

    // 2️⃣ Keep previous selection if exists
    setSelectedMeter((prev) => {
      if (!prev) return meterData[0];

      const updated = meterData.find((m) => m.id === prev.id);
      return updated || meterData[0];
    });
  }, [loading, meterData, searchParams]);

  // Initial Fetch
  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  // ✅ HANDLER: Filter Change

  const totalItems = meterData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedMeters = meterData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterParams, showDeleted]);

  const handleFilterChange = useCallback(
    (newParams: Partial<FetchMetersParams>) => {
      setFilterParams((prev) => {
        const merged = { ...prev, ...newParams };
        if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
        return merged;
      });
    },
    []
  );

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
          handleFilterChange
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
                filteredMeters={paginatedMeters}
                selectedMeter={selectedMeter}
                setSelectedMeter={setSelectedMeter}
                loading={loading}
                handleShowNewMeterForm={handleShowNewMeterForm}
                handleCreateForm={handleCreateForm}
                handleCancelForm={handleCancelForm}
                setShowReadingMeter={setShowReadingMeter}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
              />

              <div className="flex-1 bg-card mb-2">
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
