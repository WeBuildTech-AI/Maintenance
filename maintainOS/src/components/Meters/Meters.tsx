import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
import { useNavigate, useMatch, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import Loader from "../Loader/Loader";
import { ReadingHistory } from "./MeterDetail/ReadingHistory";
import RecordReadingModal from "./MeterDetail/RecordReadingModal";

export function Meters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ Routes check
  const isCreateRoute = useMatch("/meters/create");
  const isEditRoute = useMatch("/meters/:meterId/edit");
  const isFormOpen = !!isCreateRoute || !!isEditRoute;

  // ✅ 1. Asset ID capture logic
  const prefillAssetId = searchParams.get("assetId");

  // ✅ FIX 1: Agar 'assetId' URL me hai, lekin hum '/create' route par nahi hain, toh redirect karo
  useEffect(() => {
    if (prefillAssetId && !isCreateRoute && !isEditRoute) {
      navigate(`/meters/create?assetId=${prefillAssetId}`);
    }
  }, [prefillAssetId, isCreateRoute, isEditRoute, navigate]);

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") || ""
  );

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
  const headerRef = useRef<HTMLDivElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filterParams, setFilterParams] = useState<FetchMetersParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: 50,
  });

  const dispatch = useDispatch<AppDispatch>();

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

  // ✅ FIX 2: URL params update logic fixed
  useEffect(() => {
    const params: any = {};

    if (debouncedSearch) params.search = debouncedSearch;

    // Sirf tabhi meterId set karo jab hum CREATE ya EDIT mode me NA ho
    if (viewMode === "panel" && selectedMeter?.id && !isCreateRoute && !isEditRoute) {
      params.meterId = selectedMeter.id;
    }

    if (viewMode === "panel" && showReadingMeter) {
      params.reading = "true";
    }

    // Asset ID persist rakhna hai agar available hai
    if (prefillAssetId) {
      params.assetId = prefillAssetId;
    }

    setSearchParams(params, { replace: true });
  }, [
    viewMode,
    debouncedSearch,
    showReadingMeter,
    selectedMeter?.id,
    prefillAssetId,
    isCreateRoute, // Check added
    isEditRoute,   // Check added
    setSearchParams,
  ]);

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
    // Clear everything and go to list
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
      setMeterData(sortedData);
    } catch (err) {
      console.error(err);
      setMeterData([]);
    } finally {
      setLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch]);

  useEffect(() => {
    if (loading) return;
    if (!meterData || meterData.length === 0) {
      setSelectedMeter(null);
      return;
    }

    const urlMeterId = searchParams.get("meterId");
    
    // Agar URL me meterId hai, to usse select karo
    if (urlMeterId) {
      const found = meterData.find((m) => String(m.id) === String(urlMeterId));
      if (found) {
        setSelectedMeter(found);
        return;
      }
    }

    // Default fallback
    setSelectedMeter((prev) => {
      if (!prev) return meterData[0];
      const updated = meterData.find((m) => m.id === prev.id);
      return updated || meterData[0];
    });
  }, [loading, meterData, searchParams]);

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  const totalItems = meterData.length;
  
  const paginatedMeters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return meterData.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, totalItems, meterData]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

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
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  const handleDeleteMeter = (id: string) => {
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

        {viewMode === "table" && !isFormOpen ? (
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
                    initialAssetId={prefillAssetId}
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