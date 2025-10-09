"use client";

import {
  Building,
  ChevronDown,
  Edit,
  Link,
  MapPin,
  MoreHorizontal,
  Plus,
  Turtle,
  Check, // NEW: Added icon
  ChevronUp, // NEW: Added icon
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NewLocationForm } from "./NewLocationForm/NewLocationForm";
import { deleteLocation, locationService } from "../../store/locations";
import type { LocationResponse } from "../../store/locations";
import type { ViewMode } from "../purchase-orders/po.types";
import { LocationHeaderComponent } from "./LocationsHeader";
import Loader from "../Loader/Loader";
import { formatDate } from "../utils/Date";
import { LocationTable } from "./LocationTable";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { sortLocations } from "../utils/Sorted"; // REMOVED: No longer needed
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate, useMatch } from "react-router-dom";
import { SubLocationModal } from "./SubLocationModel";
import toast, { Toaster } from "react-hot-toast";
import QRCode from "react-qr-code";

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
  const [filteredLocations, setFilteredLocations] = useState<
    LocationResponse[]
  >([]);
  // const [sortBy, setSortBy] = useState("Name: Ascending Order"); // REMOVED: Replaced with new state
  const user = useSelector((state: RootState) => state.auth.user);
  const [modalOpen, setModalOpen] = useState(false);

  // --- NEW: State and Refs for the custom sorting dropdown ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortType, setSortType] = useState("Name"); // e.g., "Name", "Creation Date"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [openSection, setOpenSection] = useState<string | null>("Name");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  // --- END NEW ---

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

  const handleCreateForm = (newLocation: LocationResponse) => {
    const updatedLocations = [newLocation, ...locations];
    setLocations(updatedLocations);
    setFilteredLocations(updatedLocations);
    setSelectedLocation(newLocation);
    navigate("/locations");
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

  const fetchLocations = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await locationService.fetchLocations(
        limit,
        currentPage,
        (currentPage - 1) * limit
      );

      if (currentPage === 1) {
        const reversedLocations = [...res].reverse();
        setLocations(reversedLocations);
        if (reversedLocations.length > 0) {
          setSelectedLocation(reversedLocations[0]);
        }
      } else {
        setLocations((prev) => [...prev, ...res]);
      }

      if (res.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch locations");
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    fetchLocations(1);
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
    dispatch(deleteLocation(id))
      .unwrap()
      .then(() => {
        toast.success("Location deleted successfully!");

        const indexToDelete = filteredLocations.findIndex(
          (loc) => loc.id === id
        );

        if (selectedLocation?.id === id && indexToDelete !== -1) {
          if (filteredLocations.length === 1) {
            setSelectedLocation(null);
          } else if (indexToDelete === filteredLocations.length - 1) {
            setSelectedLocation(filteredLocations[indexToDelete - 1]);
          } else {
            setSelectedLocation(filteredLocations[indexToDelete + 1]);
          }
        }
        setLocations((prev) => prev.filter((loc) => loc.id !== id));
        navigate("/locations");
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        alert("Failed to delete the location.");
      });
  };

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

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
          setShowSettings
        )}

        {viewMode === "table" ? (
          <>
            <LocationTable
              location={locations}
              selectedLocation={selectedLocation}
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
                            navigate("/locations");
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
                                  <button
                                    onClick={() => alert("sidit")}
                                    className="text-sm text-orange-600 cursor-pointer"
                                  >
                                    <p>
                                      Sub Location : {items.children.length}{" "}
                                    </p>
                                  </button>
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
                      <p className="text-muted-foreground mb-2">
                        Start adding Location on MaintainOS
                      </p>
                      <Button
                        onClick={handleShowNewLocationForm}
                        className="text-primary p-0 bg-white cursor-pointer"
                      >
                        Create the first asset
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Card (Detail / Form View) - No Changes Below This Line */}
              <Card className="flex flex-col h-full mr-2 flex-1">
                <CardContent className="flex-1 min-h-0">
                  {isCreateRoute || isEditRoute || isCreateSubLocationRoute ? (
                    <NewLocationForm
                      onCancel={handleCancelForm}
                      onCreate={handleCreateForm}
                      setSelectedLocation={setSelectedLocation}
                      onSuccess={handleFormSuccess}
                      isEdit={isEditMode}
                      editData={locationToEdit}
                      initialParentId={parentIdFromUrl}
                    />
                  ) : selectedLocation ? (
                    <div className="mx-auto flex flex-col h-full bg-white">
                      <div className="flex-none border-b bg-white px-6 py-4 z-10">
                        <div className="flex items-center justify-between">
                          <h2 className="capitalize text-xl font-semibold text-gray-800">
                            {selectedLocation?.name || "Unnamed Location"}
                          </h2>
                          <div className="flex items-center gap-2">
                            <button
                              title="Copy Link"
                              onClick={() => {
                                const url = `${window.location.origin}/locations/${selectedLocation?.id}`;
                                navigator.clipboard.writeText(url);
                                toast.success("location link copied!");
                              }}
                              className="cursor-pointer rounded-md p-2 text-orange-600"
                            >
                              <Link size={18} />
                            </button>
                            <button
                              title="Edit"
                              className="flex cursor-pointer items-center gap-1 rounded-md border border-orange-600 px-3 py-1.5 text-orange-600 hover:bg-orange-50"
                              onClick={() => {
                                navigate(
                                  `/locations/${selectedLocation.id}/edit`
                                );
                              }}
                            >
                              <Edit size={16} /> Edit
                            </button>
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="mt-2"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteLocation(selectedLocation?.id)
                                    }
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow overflow-y-auto  p-6">
                        {selectedLocation.address && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700">
                              Address
                            </h3>
                            <p className="mt-1 text-gray-600">
                              {selectedLocation.address ||
                                "No Address available"}
                            </p>
                          </div>
                        )}

                        {selectedLocation.description && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700">
                              Description
                            </h3>
                            <p className="mt-1 text-gray-600">
                              {selectedLocation.description ||
                                "No description available"}
                            </p>
                          </div>
                        )}
                        {selectedLocation?.photoUrls.length > 0 && (
                          <>
                            <div className="mb-6 flex flex-wrap gap-2">
                              {selectedLocation?.photoUrls?.map((item) => (
                                <img
                                  key={item.id}
                                  src={`data:${item.mimetype};base64,${item.base64}`}
                                  alt="Location"
                                  className="h-24 w-24 rounded object-cover"
                                />
                              ))}
                            </div>
                            <hr />
                          </>
                        )}

                        {selectedLocation.qrCode && (
                          <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-700">
                              QR Code/Barcode
                            </h3>
                            {selectedLocation.qrCode && (
                              <>
                                <h4 className="mt-2 text-sm text-gray-700">
                                  {selectedLocation?.qrCode}
                                </h4>
                                <div className="mb-3 mt-2 flex justify-start">
                                  <div className="w-fit rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                                    <div className="ro mb-1 flex justify-center">
                                      <QRCode
                                        value={selectedLocation.qrCode}
                                        size={100}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        <hr className="my-4" />

                        <div className="mb-6 mt-2">
                          <h3 className="text-sm font-medium text-gray-700">
                            Sub-Locations ({selectedLocation?.children.length})
                          </h3>
                          {selectedLocation?.children.length === 0 ? (
                            <>
                              <p className="mt-1 text-sm text-gray-500">
                                Add sub elements inside this Location
                              </p>
                            </>
                          ) : (
                            <></>
                          )}
                          <button
                            onClick={handleShowNewSubLocationForm}
                            className="mt-2 cursor-pointer text-sm text-orange-600 hover:underline"
                          >
                            Create Sub-Location
                          </button>
                        </div>

                        <SubLocationModal
                          isOpen={modalOpen}
                          onClose={() => setModalOpen(false)}
                          onCreate={(name) => {
                            console.log("Sub-location created:", name);
                            setModalOpen(false);
                          }}
                        />

                        <hr className="my-4" />

                        {selectedLocation.createdAt ===
                        selectedLocation.updatedAt ? (
                          <>
                            <div className="text-sm text-gray-500 mt-2">
                              Created By{" "}
                              <span className="capitalize font-medium text-gray-700">
                                {user?.fullName}
                              </span>{" "}
                              on {formatDate(selectedLocation.createdAt)}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-gray-500 mt-2">
                              Created By{" "}
                              <span className="capitalize font-medium text-gray-700">
                                {user?.fullName}
                              </span>{" "}
                              on {formatDate(selectedLocation.createdAt)}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Updated By{" "}
                              <span className="capitalize font-medium text-gray-700">
                                {user?.fullName}
                              </span>{" "}
                              on {formatDate(selectedLocation.updatedAt)}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex-none border-t bg-white p-4">
                        <div className="flex justify-center">
                          <NavLink to="/work-orders">
                            <button className="cursor-pointer rounded-full border border-orange-600 bg-white px-5 py-3 p-2 text-sm text-orange-600 shadow-sm transition hover:bg-orange-50">
                              Use in New Work Order
                            </button>
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      Select a location to view details
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
