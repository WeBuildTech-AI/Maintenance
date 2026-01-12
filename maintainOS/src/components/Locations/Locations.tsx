"use client";

import {
  ChevronDown,
  MapPin,
  Check,
  ChevronUp,
  Layers,
  Building2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { NewLocationForm } from "./NewLocationForm/NewLocationForm";
import { deleteLocation, locationService } from "../../store/locations";
import type { LocationResponse } from "../../store/locations";
import { FetchLocationsParams } from "../../store/locations/locations.types";
import type { ViewMode } from "../purchase-orders/po.types";
import { LocationHeaderComponent } from "./LocationsHeader";
import Loader from "../Loader/Loader";
import { LocationTable } from "./LocationTable";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate,
  useMatch,
  useParams,
  useSearchParams,
  useLocation, 
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LocationDetails from "./LocationDetails";
import SubLocation from "./SubLocation";

export function Locations() {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ 1. URL Search Params Setup
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation(); 

  // ✅ 2. Initialize State
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") || ""
  );

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("locationViewMode");
    return (savedMode as ViewMode) || "panel";
  });

  // ✅ SERVER-SIDE PAGINATION STATE
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 50; 

  const [filterParams, setFilterParams] = useState<FetchLocationsParams>({
    page: currentPage,
    limit: itemsPerPage,
  });

  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResponse | null>(null);

  const [activeSubLocation, setActiveSubLocation] = useState<any>(null);

  // ✅ Get Location ID from URL Params
  const { locationId } = useParams();

  const [showSettings, setShowSettings] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);

  // Sorting State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortType, setSortType] = useState("Last Updated");
  const [sortOrder, setSortOrder] = useState("dsc");
  const [openSection, setOpenSection] = useState<string | null>("Name");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [showDeleted, setShowDeleted] = useState(false);
  const [showSubLocation, setShowSubLocation] = useState(false);

  const navigate = useNavigate();
  const isCreateRoute = useMatch("/locations/create");
  const isEditRoute = useMatch("/locations/:locationId/edit");
  const isCreateSubLocationRoute = useMatch(
    "/locations/:parentId/create-sublocation"
  );

  const isEditMode = !!isEditRoute;
  const parentIdFromUrl = isCreateSubLocationRoute?.params.parentId;

  // ✅ HELPER: Recursive Search
  const findLocationDeep = (
    data: LocationResponse[],
    id: string
  ): LocationResponse | undefined => {
    for (const item of data) {
      if (item.id === id) return item;
      if (item.children && item.children.length > 0) {
        const found = findLocationDeep(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  useEffect(() => {
    if (viewMode === "table") {
      localStorage.setItem("locationViewMode", "table");
    } else {
      localStorage.removeItem("locationViewMode");
    }
  }, [viewMode]);

  // ✅ Edit Logic
  const locationToEdit = useMemo(() => {
    if (!isEditMode || !isEditRoute?.params.locationId) return null;
    const targetId = isEditRoute.params.locationId;
    const foundInList = findLocationDeep(locations, targetId);
    if (foundInList) return foundInList;
    if (selectedLocation?.id === targetId) return selectedLocation;
    return null;
  }, [isEditMode, isEditRoute, locations, selectedLocation]);

  // ✅ Sync State TO URL
  useEffect(() => {
    const params: any = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filterParams.page && filterParams.page > 1) {
      params.page = filterParams.page.toString();
    }

    const currentSearch = searchParams.get("search") || "";
    const currentPageStr = searchParams.get("page") || "";
    
    if (currentSearch !== (params.search || "") || currentPageStr !== (params.page || "")) {
        setSearchParams(params, { replace: true });
    }
  }, [debouncedSearch, filterParams.page, setSearchParams, searchParams]);

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get("page")) || 1;
    if (pageFromUrl !== filterParams.page) {
      setFilterParams(prev => ({ ...prev, page: pageFromUrl }));
    }
  }, [searchParams]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLocationById = useCallback(
    async (id: string) => {
      if (!id) return;
      setDetailsLoading(true);
      try {
        const res = await locationService.fetchLocationById(id);
        setSelectedLocation(res);
        setLocations((prev) => {
          const exists = prev.find((l) => l.id === id);
          return exists ? prev : [res, ...prev];
        });
      } catch (err) {
        console.error("Failed to fetch location by ID:", err);
      } finally {
        setDetailsLoading(false);
      }
    },
    [] 
  );

  // ✅ Main List Fetch
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      let res: any;
      if (showDeleted) {
        res = await locationService.fetchDeleteLocation();
      } else {
        const apiPayload = {
          ...filterParams,
          search: debouncedSearch || undefined,
        };
        res = await locationService.fetchLocations(apiPayload);
      }
      
      const reversedLocations = [...res].reverse();
      
      setLocations((prevLocations) => {
          if (selectedLocation && !reversedLocations.find(l => l.id === selectedLocation.id)) {
              return [selectedLocation, ...reversedLocations];
          }
          return reversedLocations;
      });

    } catch (err) {
      console.error(err);
      setError("Failed to fetch locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch]); 

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // 🔥🔥🔥 ULTRA-STRICT REDIRECT LOGIC v2.0 🔥🔥🔥
  useEffect(() => {
    // 1. Check if we are on the EXACT Root path
    // If URL has any ID, this will be FALSE.
    const isExactlyRoot = location.pathname === "/locations" || location.pathname === "/locations/";

    // 2. Extract ID from URL manually (Safety net for slow useParams)
    const pathParts = location.pathname.split('/').filter(Boolean);
    let urlIdFromPath = null;
    
    // If path is like /locations/ID, part[0] is locations, part[1] is ID
    if (pathParts.length >= 2 && pathParts[0] === 'locations') {
        const segment = pathParts[1];
        if (segment !== 'create' && segment !== 'edit') {
            urlIdFromPath = segment;
        }
    }

    // 3. IGNORE Special Routes
    if (isCreateRoute || isCreateSubLocationRoute || isEditRoute) return;

    // 🛑 Case 1: URL HAS AN ID (e.g., from Asset click)
    // DO NOT REDIRECT. Just load the data.
    if (urlIdFromPath) {
       if (selectedLocation?.id !== urlIdFromPath) {
           const found = findLocationDeep(locations, urlIdFromPath);
           if (found) {
               setSelectedLocation(found);
           } else {
               if (!detailsLoading) fetchLocationById(urlIdFromPath);
           }
       }
       return; // Stop here.
    }

    // 🛑 Case 2: URL IS EXACTLY ROOT (Default View)
    // Only redirect if we are SURE we are on the root path and no ID exists.
    if (isExactlyRoot && !loading && locations.length > 0 && !selectedLocation) {
        const firstLocation = locations[0];
        setSelectedLocation(firstLocation);
        navigate(`/locations/${firstLocation.id}`, { replace: true });
    }

  }, [
    location.pathname, // ✅ Re-run immediately on URL change
    locations,
    isCreateRoute,
    isCreateSubLocationRoute, 
    isEditRoute,
    fetchLocationById,
    navigate,
    selectedLocation,
    loading,
    detailsLoading
  ]);

  const handleShowNewLocationForm = () => navigate("/locations/create");

  const handleCancelForm = () => {
    if (selectedLocation) navigate(`/locations/${selectedLocation.id}`);
    else navigate("/locations");
  };

  const handleRootLocationCreate = (newLocation: LocationResponse) => {
    const updatedLocations = [newLocation, ...locations];
    setLocations(updatedLocations);
    setSelectedLocation(newLocation);
    navigate(`/locations/${newLocation.id}`);
  };

  const handleSubLocationCreated = (newSubLocation: LocationResponse) => {
    const parentId = newSubLocation.parentId;
    if (!parentId) return;
    const updatedLocations = locations.map((loc) => {
      if (loc.id === parentId) {
        return { ...loc, children: [...(loc.children || []), newSubLocation] };
      }
      return loc;
    });
    setLocations(updatedLocations);
    const updatedParent = updatedLocations.find((loc) => loc.id === parentId);
    if (updatedParent) setSelectedLocation(updatedParent);
    toast.success("Sub-location added successfully!");
    navigate(`/locations/${parentId}`);
  };

  const handleFormSuccess = (locationData: LocationResponse) => {
    fetchLocations();
    setSelectedLocation(locationData);
    navigate(`/locations/${locationData.id}`);
  };

  const handleFilterChange = useCallback(
    (newParams: Partial<FetchLocationsParams>) => {
      setFilterParams((prev) => {
        const merged = { ...prev, ...newParams };
        if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
        return merged;
      });
    },
    []
  );

  // ✅ Sorting Logic
  const sortedLocations = useMemo(() => {
    let items = [...locations];
    items.sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
        case "Name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "Creation Date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "Last Updated":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return items;
  }, [locations, sortType, sortOrder]);

  // ✅ Server-Side Pagination Handlers
  const handlePrevPage = () => {
    if (filterParams.page && filterParams.page > 1) {
      setFilterParams((prev) => ({ ...prev, page: Number(prev.page) - 1 }));
    }
  };

  const handleNextPage = () => {
    if (locations.length > 0) { 
       setFilterParams((prev) => ({ ...prev, page: Number(prev.page || 1) + 1 }));
    }
  };

  // Dropdown positioning
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
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalRef]);

  const handleDeleteLocation = (id: string) => {
    dispatch(deleteLocation(id))
      .unwrap()
      .then(() => {
        const newLocationsList = locations.filter((loc) => loc.id !== id);
        setLocations(newLocationsList);
        if (newLocationsList.length === 0) {
          setSelectedLocation(null);
          navigate("/locations");
        } else {
          const nextLoc = newLocationsList[0];
          setSelectedLocation(nextLoc);
          navigate(`/locations/${nextLoc.id}`);
        }
        toast.success("Location deleted successfully!");
      })
      .catch((error) => {
        toast.error("Failed to delete the location.");
      });
  };

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // -------------------- JSX --------------------
  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="flex h-full flex-col bg-background">
        {LocationHeaderComponent(
          viewMode,
          setViewMode,
          searchQuery,
          setSearchQuery,
          handleShowNewLocationForm,
          setShowSettings,
          setIsSettingsModalOpen,
          setShowDeleted,
          handleFilterChange
        )}

        {viewMode === "table" ? (
          <LocationTable
            location={sortedLocations}
            selectedLocation={selectedLocation}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
            isSettingsModalOpen={isSettingsModalOpen}
            fetchLocations={fetchLocations}
            showDeleted={showDeleted}
            setShowDeleted={setShowDeleted}
          />
        ) : (
          // 🟦 PANEL VIEW (Split Screen)
          <div className="flex flex-1 min-h-0 h-full">
            {/* --- LEFT LIST PANEL --- */}
            <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0 bg-white">
              {/* 1. Sort Header */}
              <div
                ref={headerRef}
                className="px-4 py-3 border-b bg-white z-40 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-1 text-sm text-gray-700">
                  <span className="font-medium text-gray-500">Sort By:</span>
                  <button
                    onClick={() => setIsDropdownOpen((p) => !p)}
                    className="flex items-center gap-1 text-blue-600 font-medium focus:outline-none hover:text-blue-700"
                  >
                    {sortType} : {sortOrder === "asc" ? "Asc" : "Desc"}
                    {isDropdownOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Sort Dropdown */}
              {isDropdownOpen && (
                <div
                  ref={modalRef}
                  className="fixed z-[9999] text-sm rounded-lg border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100 p-1"
                  style={{
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    transform: "translateX(-50%)",
                    width: "240px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    {[
                      {
                        label: "Creation Date",
                        options: ["Oldest First", "Newest First"],
                      },
                      {
                        label: "Last Updated",
                        options: ["Least Recent First", "Most Recent First"],
                      },
                      {
                        label: "Name",
                        options: ["Ascending Order", "Descending Order"],
                      },
                    ].map((section) => (
                      <div key={section.label}>
                        <button
                          onClick={() =>
                            setOpenSection(
                              openSection === section.label
                                ? null
                                : section.label
                            )
                          }
                          className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100 rounded-md"
                        >
                          <span>{section.label}</span>
                          {openSection === section.label ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                        {openSection === section.label && (
                          <div className="pl-4 pr-2 bg-gray-50 py-1 space-y-1">
                            {section.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => {
                                  setSortType(section.label);
                                  setSortOrder(
                                    opt.includes("Asc") ||
                                      opt.includes("Oldest") ||
                                      opt.includes("Least")
                                      ? "asc"
                                      : "desc"
                                  );
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full text-left text-xs px-2 py-1.5 hover:bg-white rounded text-gray-600"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Scrollable List with INLINE CARD UI */}
              <div className="flex-1 overflow-auto bg-white p-3 space-y-2">
                {loading && locations.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader />
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-2">
                      No locations found on Page {filterParams.page}.
                    </p>
                    <Button
                      onClick={handleShowNewLocationForm}
                      variant="outline"
                      size="sm"
                    >
                      Create first location
                    </Button>
                  </div>
                ) : (
                  <>
                    {sortedLocations.map((item) => {
                      const isSelected =
                        item.id === selectedLocation?.id ||
                        item.id === locationId;
                      const hasPhoto = item?.photoUrls?.length > 0;
                      const subLocationCount = item.children?.length || 0;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedLocation(item);
                            navigate(`/locations/${item.id}`);
                          }}
                          className={`cursor-pointer border rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? "border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400"
                              : "border-gray-200 bg-white hover:border-yellow-200"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon/Image Wrapper */}
                            <div
                              className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border overflow-hidden ${
                                isSelected
                                  ? "bg-white border-yellow-200 text-yellow-600"
                                  : "bg-gray-50 border-gray-100 text-gray-500"
                              }`}
                            >
                              {hasPhoto ? (
                                <img
                                  src={`data:${item.photoUrls[0].mimetype};base64,${item.photoUrls[0].base64}`}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold uppercase">
                                  {renderInitials(item.name) || (
                                    <Building2 size={18} />
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight capitalize">
                                  {item.name}
                                </h3>
                                {subLocationCount > 0 && (
                                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                    <Layers size={10} />
                                    {subLocationCount} Sub-locs
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                <MapPin
                                  size={12}
                                  className="flex-shrink-0 text-gray-400"
                                />
                                <span className="truncate capitalize max-w-[200px]">
                                  {item.address || "No address provided"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* 3. SERVER SIDE Pagination Footer */}
              <div className="flex items-center justify-end p-3 border-t border-gray-200 bg-white">
                <div className="inline-flex items-center gap-3 border border-yellow-400 rounded-full px-3 py-1 shadow-sm bg-white">
                  <span className="text-xs font-medium text-gray-700">
                     Page {filterParams.page}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={!filterParams.page || filterParams.page <= 1}
                      className="text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="rotate-90" size={16} />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={locations.length < itemsPerPage}
                      className="text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="-rotate-90" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- RIGHT DETAIL PANEL --- */}
            <div className="flex-1 bg-card mr-3 ml-1 mb-2 border border-border min-h-0 flex flex-col">
              <div className="flex-1 h-full overflow-hidden">
                {isCreateRoute || isEditRoute || isCreateSubLocationRoute ? (
                  <NewLocationForm
                    onCancel={handleCancelForm}
                    onCreate={
                      isCreateSubLocationRoute
                        ? handleSubLocationCreated
                        : handleRootLocationCreate
                    }
                    setSelectedLocation={setSelectedLocation}
                    onSuccess={handleFormSuccess}
                    fetchLocations={fetchLocations}
                    isEdit={isEditMode}
                    editData={locationToEdit}
                    initialParentId={parentIdFromUrl}
                    isSubLocation={!!isCreateSubLocationRoute}
                    fetchLocationById={() => {}}
                  />
                ) : showSubLocation ? (
                  <SubLocation
                    selectedLocation={activeSubLocation}
                    onClose={() => setShowSubLocation(false)}
                    parentName={selectedLocation?.name}
                  />
                ) : selectedLocation ? (
                  <LocationDetails
                    selectedLocation={selectedLocation}
                    onEdit={(v) => navigate(`/locations/${v.id}/edit`)}
                    handleDeleteLocation={handleDeleteLocation}
                    handleShowNewSubLocationForm={() => {
                      navigate(
                        `/locations/${selectedLocation.id}/create-sublocation`
                      );
                    }}
                    user={user}
                    restoreData={""}
                    fetchLocation={fetchLocations}
                    onClose={() => setSelectedLocation(null)}
                    setShowSubLocation={setShowSubLocation}
                    onSubLocationClick={(subLoc) => {
                      setActiveSubLocation(subLoc);
                      setShowSubLocation(true);
                    }}
                  />
                ) : (
                  /* Empty State */
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <p className="text-muted-foreground mb-2">
                        Select a Location to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}