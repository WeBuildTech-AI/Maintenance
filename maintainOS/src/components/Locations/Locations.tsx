"use client";

import { ChevronDown, MapPin, Check, ChevronUp } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
// ✅ useSearchParams import kiya gaya hai URL sync ke liye
import {
  useNavigate,
  useMatch,
  useParams,
  useSearchParams,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import LocationDetails from "./LocationDetails";
import SubLocation from "./SubLocation";

export function Locations() {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ 1. URL Search Params Setup
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ 2. Initialize State from URL (Refresh hone par yahan se value uthayega)
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") || ""
  );

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (searchParams.get("viewMode") as ViewMode) || "panel";
  });

  const [filterParams, setFilterParams] = useState<FetchLocationsParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: 50,
  });

  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResponse | null>(null);

  const { locationId } = useParams();

  const [showSettings, setShowSettings] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
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
  const locationToEdit = isEditMode
    ? locations.find((loc) => loc.id === isEditRoute?.params.locationId)
    : null;
  const parentIdFromUrl = isCreateSubLocationRoute?.params.parentId;

  // ✅ 3. Sync State TO URL (State change hone par URL update karega)
  useEffect(() => {
    const params: any = {};

    // if (viewMode) params.viewMode = viewMode;
    if (debouncedSearch) params.search = debouncedSearch;
    if (filterParams.page && filterParams.page > 1)
      params.page = filterParams.page.toString();

    // Existing query params ko maintain karte hue naye set karein
    setSearchParams(params, { replace: true });
  }, [viewMode, debouncedSearch, filterParams.page, setSearchParams]);

  // Debounce Effect
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
        navigate("/locations");
      } finally {
        setDetailsLoading(false);
      }
    },
    [navigate]
  );

  // ✅ Main List Fetch Function (Updated dependencies)
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
      setLocations(reversedLocations);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch]);

  // Initial Fetch
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // ✅ CORE FIX: Selection Logic (Deep Linking + Default Selection)
  // Yeh useEffect ensure karta hai ki agar URL mein ID hai to wahi open ho, chahe refresh karein
  useEffect(() => {
    // 1. Create/Edit Mode check (Skip logic if creating new)
    if (isCreateRoute || isCreateSubLocationRoute) {
      return;
    }

    // 2. URL ID Logic (High Priority)
    if (locationId) {
      // Agar already wahi location selected hai to kuch mat karo
      if (selectedLocation?.id === locationId) return;

      // Check karo ki kya ye ID loaded list mein hai?
      const foundInList = locations.find((l) => l.id === locationId);

      if (foundInList) {
        // List mein mil gaya -> Select kar lo
        setSelectedLocation(foundInList);
      } else {
        // 🔴 List mein nahi mila (Refresh Case) -> API se fetch karo
        // Hum yahan 'loading' ka wait nahi karenge taaki URL wala data turant dikhe.
        fetchLocationById(locationId);
      }
    }
    // 3. Default Selection (Sirf tab jab URL mein koi ID nahi hai)
    else if (!loading && locations.length > 0 && !selectedLocation) {
      const firstLocation = locations[0];
      setSelectedLocation(firstLocation);
      navigate(`/locations/${firstLocation.id}`, { replace: true });
    }
  }, [
    locationId,
    locations,
    // loading, // Loading dependency hata di gayi hai taaki refresh par turant ID check ho
    isCreateRoute,
    isCreateSubLocationRoute,
    fetchLocationById,
    navigate,
    selectedLocation,
  ]);

  // Handlers
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
    const locationIndex = locations.findIndex(
      (loc) => loc.id === locationData.id
    );
    let updatedLocations;
    if (locationIndex > -1) {
      updatedLocations = [...locations];
      updatedLocations[locationIndex] = locationData;
    } else {
      updatedLocations = [locationData, ...locations];
    }
    setLocations(updatedLocations);
    setSelectedLocation(locationData);
    navigate(`/locations/${locationData.id}`);
  };

  // ✅ Updated handleFilterChange to work with State->URL flow
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

  // Dropdown positioning & Clicks
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

  const sortLabel = useMemo(() => {
    if (sortType === "Last Updated")
      return sortOrder === "desc" ? "Most Recent First" : "Least Recent First";
    if (sortType === "Creation Date")
      return sortOrder === "desc" ? "Newest First" : "Oldest First";
    if (sortType === "Name")
      return sortOrder === "asc" ? "Ascending Order" : "Descending Order";
    return "Sort By";
  }, [sortType, sortOrder]);

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
          // Select next available
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
      <div className="flex h-full flex-col">
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
          <>
            <div className="flex gap-2 flex-1 overflow-hidden mt-3 min-h-0">
              <div className="border ml-3 mr-1 w-96 flex flex-col">
                {/* SORT HEADER */}
                <div
                  ref={headerRef}
                  className="flex items-center justify-between px-5 py-3 border-b bg-white relative z-10"
                >
                  <div className="flex items-center ml-3 gap-2 text-sm text-gray-700 font-medium">
                    <span>Sort By:</span>
                    <button
                      onClick={() => setIsDropdownOpen((p) => !p)}
                      className="flex items-center gap-1 text-sm text-orange-600 font-semibold focus:outline-none"
                    >
                      {sortType}: {sortLabel}
                      {isDropdownOpen ? (
                        <ChevronUp className="w-4 h-4 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 mt-1" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    ref={modalRef}
                    className="fixed z-50 text-sm rounded-md border border-gray-200 bg-white shadow-lg p-2"
                    style={{
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      transform: "translateX(-50%)",
                      width: "300px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col divide-y divide-gray-100">
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
                        <div
                          key={section.label}
                          className="flex flex-col mt-1 mb-1"
                        >
                          <button
                            onClick={() =>
                              setOpenSection(
                                openSection === section.label
                                  ? null
                                  : section.label
                              )
                            }
                            className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-md ${
                              sortType === section.label
                                ? "text-orange-600 bg-gray-50"
                                : "text-gray-800"
                            }`}
                          >
                            <span>{section.label}</span>
                            {openSection === section.label ? (
                              <ChevronUp className="w-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5" />
                            )}
                          </button>
                          {openSection === section.label && (
                            <div className="flex flex-col bg-gray-50 border-t border-gray-100 py-1">
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
                                  className={`flex items-center justify-between px-6 py-2 text-left text-sm ${
                                    section.label === sortType &&
                                    ((sortOrder === "asc" &&
                                      (opt.includes("Asc") ||
                                        opt.includes("Oldest") ||
                                        opt.includes("Least"))) ||
                                      (sortOrder === "desc" &&
                                        (opt.includes("Desc") ||
                                          opt.includes("Newest") ||
                                          opt.includes("Most"))))
                                      ? "text-orange-600 bg-white"
                                      : "text-gray-700 hover:bg-white"
                                  }`}
                                >
                                  {opt}
                                  {section.label === sortType &&
                                    ((sortOrder === "asc" &&
                                      (opt.includes("Asc") ||
                                        opt.includes("Oldest") ||
                                        opt.includes("Least"))) ||
                                      (sortOrder === "desc" &&
                                        (opt.includes("Desc") ||
                                          opt.includes("Newest") ||
                                          opt.includes("Most")))) && (
                                      <Check className="w-3.5" />
                                    )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations List */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {loading && filterParams.page === 1 ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader />
                    </div>
                  ) : sortedLocations && sortedLocations.length > 0 ? (
                    <>
                      {sortedLocations.map((items) => (
                        <Card
                          key={items.id}
                          onClick={() => {
                            setSelectedLocation(items);
                            // Navigate to ID on click
                            navigate(`/locations/${items.id}`);
                          }}
                          className={`border-b cursor-pointer border-border transition hover:bg-muted/40 ${
                            items.id === selectedLocation?.id ||
                            items.id === locationId
                              ? "bg-primary/5"
                              : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {items?.photoUrls?.length > 0 ? (
                                        <AvatarImage
                                          className="w-6"
                                          src={`data:${items.photoUrls[0].mimetype};base64,${items.photoUrls[0].base64}`}
                                          alt={items.name}
                                        />
                                      ) : (
                                        renderInitials(items.name)
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div>
                                  <h4 className="font-medium capitalize text-gray-900">
                                    {items.name}
                                  </h4>
                                  {items.address && (
                                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span className="text-sm truncate max-w-[200px] capitalize">
                                        {items.address}
                                      </span>
                                    </div>
                                  )}
                                  {items.children &&
                                    items.children.length > 0 && (
                                      <button className="text-sm text-orange-600">
                                        <p>
                                          Sub Location: {items.children.length}
                                        </p>
                                      </button>
                                    )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-2">
                        Start adding Location on MaintainOS
                      </p>
                      <Button
                        onClick={handleShowNewLocationForm}
                        className="text-primary p-0 bg-white"
                      >
                        Create the first Location
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Card (Detail / Form View) */}
              <Card className="flex flex-col h-full mr-2 flex-1 ">
                <CardContent className="flex-1 min-h-0">
                  {/* 1️⃣ Create / Edit / Create SubLocation Form */}
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
                      fetchLocationById={(id) => fetchLocationById(id || "")}
                    />
                  ) : showSubLocation ? (
                    /* 2️⃣ SHOW SUBLOCATION VIEW WHEN showSubLocation === true */
                    <SubLocation
                      selectedLocation={selectedLocation}
                      onClose={() => setShowSubLocation(false)}
                    />
                  ) : selectedLocation ? (
                    /* 3️⃣ Normal Location Details View */
                    <LocationDetails
                      selectedLocation={selectedLocation}
                      onEdit={(v) => navigate(`/locations/${v.id}/edit`)}
                      handleDeleteLocation={handleDeleteLocation}
                      handleShowNewSubLocationForm={() => {
                        setShowSetLocation(true); // 👈 yeh toggle karega SubLocation view
                      }}
                      user={user}
                      restoreData={""}
                      fetchLocation={fetchLocations}
                      onClose={() => setSelectedLocation(null)}
                      setShowSubLocation={setShowSubLocation}
                    />
                  ) : detailsLoading ? (
                    /* 4️⃣ Loader when fetching */
                    <div className="flex items-center justify-center h-full">
                      <Loader />
                    </div>
                  ) : (
                    /* 5️⃣ Empty State */
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-2">
                          Select a Location to view details
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}
