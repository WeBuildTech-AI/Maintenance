"use client";

import { ChevronDown, MapPin, Check, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { NewLocationForm } from "./NewLocationForm/NewLocationForm";
import { deleteLocation, locationService } from "../../store/locations";
import type { LocationResponse } from "../../store/locations";
import type { ViewMode } from "../purchase-orders/po.types";
import { LocationHeaderComponent } from "./LocationsHeader";
import Loader from "../Loader/Loader";

import { LocationTable } from "./LocationTable";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useMatch } from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";
import LocationDetails from "./LocationDetails";

export function Locations() {
  const hasFetched = useRef(false);
  const dispatch = useDispatch<AppDispatch>();
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<
    LocationResponse[]
  >([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortType, setSortType] = useState("Last Updated");
  const [sortOrder, setSortOrder] = useState("dsc");
  const [openSection, setOpenSection] = useState<string | null>("Name");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showDeleted, setShowDeleted] = useState(false);

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

  const handleShowNewLocationForm = () => {
    navigate("/locations/create");
  };

  const handleCancelForm = () => {
    navigate("/locations");
  };

  const handleShowNewSubLocationForm = () => {
    if (selectedLocation) {
      navigate(`/locations/${selectedLocation.id}/create-sublocation`);
    }
  };

  const handleRootLocationCreate = (newLocation: LocationResponse) => {
    const updatedLocations = [newLocation, ...locations];
    setLocations(updatedLocations);
    setFilteredLocations(updatedLocations);
    setSelectedLocation(newLocation);
    navigate("/locations");
  };

  const handleSubLocationCreated = (newSubLocation: LocationResponse) => {
    const parentId = newSubLocation.parentId;
    if (!parentId) return; // Safety check

    // Find the parent in the state and add the new sub-location to its children
    const updatedLocations = locations.map((loc) => {
      if (loc.id === parentId) {
        // Create a new children array with the new sub-location
        const updatedChildren = [...(loc.children || []), newSubLocation];
        return { ...loc, children: updatedChildren };
      }
      return loc;
    });

    setLocations(updatedLocations);

    // Find the updated parent to set it as the selected location
    const updatedParent = updatedLocations.find((loc) => loc.id === parentId);
    if (updatedParent) {
      setSelectedLocation(updatedParent);
    }

    toast.success("Sub-location added successfully!");
    navigate(`/locations/${parentId}`); // Navigate back to the parent's detail view
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
    navigate("/locations");
  };

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  console.log("showDeleted", showDeleted);

  const fetchLocations = useCallback(
    async (currentPage = 1) => {
      setLoading(true);

      // Clear selected when loading first page
      if (currentPage === 1) {
        setSelectedLocation(null);
      }

      let res; // ⭐ FIX: Declare here

      try {
        if (showDeleted) {
          res = await locationService.fetchDeleteLocation();
        } else {
          res = await locationService.fetchLocations(
            limit,
            currentPage,
            (currentPage - 1) * limit
          );
        }

        // First page logic
        if (currentPage === 1) {
          const reversedLocations = [...res].reverse();
          setLocations(reversedLocations);

          // Auto-select first item only on page 1
          if (reversedLocations.length > 0) {
            setSelectedLocation(reversedLocations[0]);
          }
        } else {
          // Next pages → append
          setLocations((prev) => [...prev, ...res]);
        }

        // Check pagination end
        if (!res || res.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch locations");
        setLocations([]);
      } finally {
        setLoading(false);
        hasFetched.current = true;
      }
    },
    [showDeleted, limit]
  );

  useEffect(() => {
    if (hasFetched.current) return;
    fetchLocations();
  }, []);

  // NEW: Combined filtering and sorting into a single useEffect for efficiency
  useEffect(() => {
    if (!locations.length) return;

    // 1. Filter by search query
    const lowerQuery = searchQuery.toLowerCase();
    const searchedLocations = searchQuery.trim()
      ? locations.filter((loc) => loc.name.toLowerCase().includes(lowerQuery))
      : [...locations];

    // 2. Sort the filtered results
    searchedLocations.sort((a, b) => {
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

    setFilteredLocations(searchedLocations);
  }, [searchQuery, locations, sortType, sortOrder]);

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

  // show the name in sortbar
  const sortLabel = useMemo(() => {
    switch (sortType) {
      case "Last Updated":
        return sortOrder === "desc"
          ? "Most Recent First"
          : "Least Recent First";
      case "Creation Date":
        return sortOrder === "desc" ? "Newest First" : "Oldest First";
      case "Name":
        return sortOrder === "asc" ? "Ascending Order" : "Descending Order";
      default:
        return "Sort By"; // Fallback text
    }
  }, [sortType, sortOrder]);

  // NEW: useEffect to close dropdown on outside click
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);
  const handleDeleteLocation = (id: string) => {
    // Step 1: Find the index of the item in the VISIBLE list (filteredLocations)
    const currentVisibleIndex = filteredLocations.findIndex(
      (loc) => loc.id === id
    );

    dispatch(deleteLocation(id))
      .unwrap()
      .then(() => {
        // Step 2: Update the main source of truth.
        // The useEffect will automatically update the filtered list later.
        const newLocationsList = locations.filter((loc) => loc.id !== id);
        setLocations(newLocationsList);

        // Step 3: Predict what the new visible list will be after the delete
        const newFilteredList = filteredLocations.filter(
          (loc) => loc.id !== id
        );

        // Step 4: Smartly decide which item to select next
        if (newFilteredList.length === 0) {
          // If the visible list is now empty, select nothing
          setSelectedLocation(null);
        } else {
          // Calculate the new index, ensuring it's not out of bounds
          const newIndexToSelect = Math.min(
            currentVisibleIndex,
            newFilteredList.length - 1
          );
          // Select the correct next item from the updated visible list
          setSelectedLocation(newFilteredList[newIndexToSelect]);
        }

        toast.success("Location deleted successfully!");
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        toast.error("Failed to delete the location.");
      });

    // Step 1: Find the index of the item being deleted from the currently visible list
    const currentIndex = locations.findIndex((loc) => loc.id === id);

    if (window.confirm("Are you sure you want to delete this location?")) {
      dispatch(deleteLocation(id))
        .unwrap()
        .then(() => {
          // Step 2: Create a new list without the deleted item
          const newLocationList = locations.filter((loc) => loc.id !== id);

          // Step 3: Update local state immediately
          setLocations(newLocationList);

          // Step 4: Handle selection logic
          if (newLocationList.length === 0) {
            // If the list becomes empty, deselect everything
            setSelectedLocation(null);
          } else {
            // Make sure we don’t go out of range (especially if deleting last element)
            const newIndexToSelect = Math.min(
              currentIndex,
              newLocationList.length - 1
            );

            const newSortedList = locations.filter((a) => a.id !== id);
            // Step 5: Select the next valid item from the updated list
            setSelectedLocation(newSortedList[newIndexToSelect]);
          }

          toast.success("Location deleted successfully!");
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          toast.error("Failed to delete the location.");
        });
    }
  };

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const fetchLocationById = async (id?: string) => {
    if (!id) {
      await fetchLocations();
      return;
    }

    try {
      const res = await locationService.fetchLocationById(id);
      setSelectedLocation(res);

      // Also update the location in the locations array
      setLocations((prev) => prev.map((loc) => (loc.id === id ? res : loc)));
    } catch (err) {
      console.error("Failed to fetch location by ID:", err);
      toast.error("Failed to refresh location data");
    }
  };

  // -------------------- JSX Rendering --------------------

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
          handleShowNewLocationForm, // 👈 New URL-driven handler
          setShowSettings,
          setIsSettingsModalOpen,
          setShowDeleted
        )}

        {viewMode === "table" ? (
          <>
            <LocationTable
              location={locations}
              selectedLocation={selectedLocation}
              setIsSettingsModalOpen={setIsSettingsModalOpen}
              isSettingsModalOpen={isSettingsModalOpen}
              fetchLocations={fetchLocations}
              showDeleted={showDeleted}
            />
          </>
        ) : (
          <>
            <div className="flex gap-2 flex-1 overflow-hidden mt-3 min-h-0">
              <div className="border ml-3 mr-1 w-96 flex flex-col">
                {/* --- REPLACED: Old sort dropdown is replaced with your new custom one --- */}
                <div
                  ref={headerRef}
                  className="flex items-center justify-between px-5 py-3 border-b bg-white relative z-10" // Reduced z-index
                >
                  <div className="flex items-center ml-3 gap-2 text-sm text-gray-700 font-medium">
                    <span>Sort By:</span>
                    <button
                      onClick={() => setIsDropdownOpen((p) => !p)}
                      className="flex items-center gap-1 text-sm text-orange-600 font-semibold focus:outline-none"
                    >
                      {sortType}: {sortLabel}
                      {isDropdownOpen ? (
                        <ChevronUp className="w-4 h-4 mt-1 text-orange-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 mt-1 text-orange-600" />
                      )}
                    </button>
                  </div>
                </div>

                {isDropdownOpen && (
                  <div
                    ref={modalRef}
                    className="fixed z-50 text-sm rounded-md border border-gray-200 bg-white shadow-lg animate-fade-in p-2"
                    style={{
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      transform: "translateX(-50%)",
                      width: "300px",
                      maxWidth: "90vw",
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
                            className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-md ${
                              sortType === section.label
                                ? "text-orange-600 font-medium bg-gray-50"
                                : "text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            <span>{section.label}</span>
                            {openSection === section.label ? (
                              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>

                          {openSection === section.label && (
                            <div className="flex flex-col bg-gray-50 border-t border-gray-100 py-1">
                              {section.options.map((opt) => {
                                const isSelected =
                                  (section.label === sortType &&
                                    sortOrder === "asc" &&
                                    (opt.includes("Asc") ||
                                      opt.includes("Oldest") ||
                                      opt.includes("Least"))) ||
                                  (section.label === sortType &&
                                    sortOrder === "desc" &&
                                    (opt.includes("Desc") ||
                                      opt.includes("Newest") ||
                                      opt.includes("Most")));

                                return (
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
                                      setIsDropdownOpen(false); // Close dropdown on selection
                                    }}
                                    className={`flex items-center justify-between px-6 py-2 text-left text-sm transition rounded-md ${
                                      isSelected
                                        ? "text-orange-600  bg-white"
                                        : "text-gray-700 hover:text-blue-300 hover:bg-white"
                                    }`}
                                  >
                                    {opt}
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-orange-600" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* --- END REPLACEMENT --- */}

                {/* Locations List */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {loading && page === 1 ? (
                    <Loader />
                  ) : filteredLocations && filteredLocations.length > 0 ? (
                    <>
                      {filteredLocations.map((items) => (
                        <Card
                          key={items.id}
                          onClick={() => {
                            setSelectedLocation(items);
                            navigate(`/locations/${items.id}`);
                          }}
                          className={`border-b cursor-pointer border-border transition hover:bg-muted/40 ${
                            items?.id === selectedLocation?.id
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
                                          alt={items?.name || "Location Image"}
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
                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm truncate max-w-[200px] capitalize">
                                        {items.address}
                                      </span>
                                    </div>
                                  )}
                                  {items.children &&
                                    items.children.length > 0 && (
                                      <button
                                        // onClick={() => alert("sidit")}
                                        className="text-sm text-orange-600 cursor-pointer"
                                      >
                                        <p>
                                          Sub Location: {items.children.length}
                                        </p>
                                      </button>
                                    )}
                                </div>
                                <div>
                                  {/* {items.children.l && ( */}
                                  {/* )} */}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {!loading && hasMore && (
                        <div className="text-center py-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const nextPage = page + 1;
                              setPage(nextPage);
                              fetchLocations(nextPage);
                            }}
                            className="text-primary border-primary hover:bg-primary/10"
                          >
                            Load More
                          </Button>
                        </div>
                      )}
                      {loading && page > 1 && (
                        <div className="text-center py-4">
                          <Loader />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        Start adding Location on MaintainOS
                      </p>
                      <Button
                        onClick={handleShowNewLocationForm}
                        className="text-primary p-0 bg-white cursor-pointer"
                      >
                        Create the first Location
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Card (Detail / Form View) - No Changes Below This Line */}
              <Card className="flex flex-col h-full mr-2 flex-1 ">
                <CardContent className="flex-1 min-h-0">
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
                      fetchLocationById={fetchLocationById}
                    />
                  ) : selectedLocation ? (
                    <LocationDetails
                      selectedLocation={selectedLocation}
                      onEdit={(v) => navigate(`/vendors/${v.id}/edit`)}
                      handleDeleteLocation={handleDeleteLocation}
                      handleShowNewSubLocationForm={
                        handleShowNewSubLocationForm
                      }
                      user={user}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          Select a Location to view details
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or create a new Location to get started
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
