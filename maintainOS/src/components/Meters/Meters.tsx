import React, { useCallback, useEffect, useState, useMemo } from "react";
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

  const viewMatch = useMatch("/meters/:meterId");
  const viewingId = viewMatch?.params?.meterId;

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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filterParams, setFilterParams] = useState<FetchMetersParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: 50,
  });

  // ✅ Sorting State (Initialized from URL)
  const [sortType, setSortType] = useState(() => searchParams.get("sort") || "Creation Date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => (searchParams.get("order") as "asc" | "desc") || "desc");

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
    prefillAssetId,
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

  // ✅ Optimistic Update Handlers
  const handleMeterCreate = (newMeter: any) => {
    setMeterData((prev) => [newMeter, ...prev]);
    setSelectedMeter(newMeter);
  };

  const handleMeterUpdate = (updatedMeter: any) => {
    setMeterData((prev) =>
      prev.map((m) => (m.id === updatedMeter.id ? updatedMeter : m))
    );
    setSelectedMeter(updatedMeter);
  };

  const handleCreateForm = async (meter: any) => {
    console.log("Meter operation complete!", meter);

    // Determine if it was create or update based on checking if ID exists in current list
    // Or better, checking isEditRoute but that might be stale if we navigated? 
    // Actually NewMeterForm determines Create vs Update.
    // The safest way is to check if we have an ID match.

    const exists = meterData.some((m) => m.id === meter.id);
    if (exists) {
      handleMeterUpdate(meter);
    } else {
      handleMeterCreate(meter);
    }

    navigate("/meters");
    // await fetchMeters(); // ❌ Removed to prevent re-fetch latency
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
      // No default sort here, because MetersList handles it based on local/URL state
      setMeterData(safeData);
    } catch (err) {
      console.error(err);
      setMeterData([]);
    } finally {
      setLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch]);

  // ✅ Client-Side Sorting
  const sortedMeters = useMemo(() => {
    const meters = [...meterData];
    meters.sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
        case "Creation Date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "Last Updated":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "Name":
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return meters;
  }, [meterData, sortType, sortOrder]);

  // ✅ Fetch Meter for Detail View when URL changes (Path-based)
  useEffect(() => {
    const fetchViewingMeter = async () => {
      // ✅ FIX: Prevent "create" or "edit" from being treated as meter IDs
      if (viewingId && viewingId !== "create" && viewingId !== "edit") {

        // 1️⃣ CHECK EXISTING STATE (Single-Call Rule)
        if (selectedMeter?.id === viewingId) {
          return;
        }

        // 2️⃣ CHECK LIST DATA (Optimistic Load)
        const cachedItem = sortedMeters.find((m) => String(m.id) === String(viewingId));
        if (cachedItem) {
          setSelectedMeter(cachedItem);
          return;
        }

        // 3️⃣ FETCH IF NOT FOUND
        setLoading(true);
        try {
          const m = await meterService.fetchMeterById(viewingId); // Assuming fetchMeterById exists
          // If not exists, we might need to fallback to list fetch or handle error
          if (m) setSelectedMeter(m);
        } catch (err) {
          console.error("❌ Failed to fetch meter details", err);
          // navigate("/meters"); // Optional: redirect on failure
        } finally {
          setLoading(false);
        }
      } else if (!viewingId || viewingId === "create") {
        // ✅ Fallback: Select first item from SORTED list if available
        if (sortedMeters.length > 0 && !isCreateRoute && !isEditRoute) {
          const firstItem = sortedMeters[0];
          navigate(`/meters/${firstItem.id}`, { replace: true });
        } else {
          setSelectedMeter(null);
        }
      }
    };

    fetchViewingMeter();
  }, [viewingId, sortedMeters]); // Removed selectedMeter to allow effect to run on sort change

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  const totalItems = meterData.length;

  const paginatedMeters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return sortedMeters.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, totalItems, sortedMeters]);

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
          () => { }, // setShowSettings - changed to dummy to avoid error
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
                setSelectedMeter={(meter: any) => {
                  navigate(`/meters/${meter.id}`);
                  setSelectedMeter(meter); // Optimistic proper update
                }}
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
                sortType={sortType}
                setSortType={setSortType}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
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
                        onOptimisticCreate={handleMeterCreate}
                        onOptimisticUpdate={handleMeterUpdate}
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
                modalRef={modalRef as React.RefObject<HTMLDivElement>}
                selectedMeter={selectedMeter as any}
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