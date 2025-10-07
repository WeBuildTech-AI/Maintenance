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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { sortLocations } from "../utils/Sorted";
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
  const [selectedLocation, setSelectedLocation] = useState<
    (typeof locations)[0] | null
  >(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<
    LocationResponse[]
  >([]);
  const [sortBy, setSortBy] = useState("Name: Ascending Order");
  const user = useSelector((state: RootState) => state.auth.user);
  const [modalOpen, setModalOpen] = useState(false);

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

  // ✅ ADD THIS ENTIRE NEW FUNCTION
  const handleShowNewSubLocationForm = () => {
    if (selectedLocation) {
      navigate(`/locations/${selectedLocation.id}/create-sublocation`);
    }
  };

  // 🔄 MODIFIED: This function now accepts the newly created location
  // It updates the state and makes the new location active.
  const handleCreateForm = (newLocation: LocationResponse) => {
    // ✨ NEW: Add the new location to the top of the list for immediate UI update
    const updatedLocations = [newLocation, ...locations];
    setLocations(updatedLocations);
    setFilteredLocations(updatedLocations); // Also update the filtered list

    // ✨ NEW: Select the new location to show its details
    setSelectedLocation(newLocation);

    // This runs AFTER the creation/update API call succeeds inside NewLocationForm
    navigate("/locations");
  };

  // ✅ NEW: A single function to handle both Create and Update success
  const handleFormSuccess = (locationData: LocationResponse) => {
    const locationIndex = locations.findIndex(
      (loc) => loc.id === locationData.id
    );
    let updatedLocations;

    if (locationIndex > -1) {
      // It's an UPDATE. Replace the old item with the new data.
      updatedLocations = [...locations];
      updatedLocations[locationIndex] = locationData;
    } else {
      // It's a CREATE. Add the new item to the beginning of the list.
      updatedLocations = [locationData, ...locations];
    }

    setLocations(updatedLocations);
    setFilteredLocations(updatedLocations);
    setSelectedLocation(locationData);
    navigate("/locations");
  };

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  // 👉 Fetch locations
  const fetchLocations = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await locationService.fetchLocations(
        limit,
        currentPage,
        (currentPage - 1) * limit
      );

      if (currentPage === 1) {
        const reversedLocations = [...res].reverse(); // 🔄 MODIFIED: Store the reversed array
        setLocations(reversedLocations);
        setFilteredLocations(reversedLocations); // 🔄 MODIFIED: Keep filtered and main list in sync

        // ✨ NEW: If there are locations, automatically select the first one on page load.
        if (reversedLocations.length > 0) {
          setSelectedLocation(reversedLocations[0]);
        }
      } else {
        setLocations((prev) => [...prev, ...res]);
        setFilteredLocations((prev) => [...prev, ...res]);
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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(locations);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredLocations(
        locations.filter((loc) => loc.name.toLowerCase().includes(lowerQuery))
      );
    }
  }, [searchQuery, locations]);

  useEffect(() => {
    if (filteredLocations.length) {
      setFilteredLocations(sortLocations(filteredLocations, sortBy));
    }
  }, [sortBy]);

  // Delete Location Functionality
  const handleDeleteLocation = (id: string) => {
    // if (window.confirm("Are you sure you want to delete this location?")) {
    dispatch(deleteLocation(id))
      .unwrap()
      .then(() => {
        toast.success("Location deleted successfully!");

        // ✨ NEW LOGIC STARTS HERE ✨

        // Find the index of the item we are about to delete
        const indexToDelete = filteredLocations.findIndex(
          (loc) => loc.id === id
        );

        // Only run this logic if the deleted item was the one selected
        if (selectedLocation?.id === id && indexToDelete !== -1) {
          // Case 1: If it's the ONLY item in the list, select nothing.
          if (filteredLocations.length === 1) {
            setSelectedLocation(null);
          }
          // Case 2: If we are deleting the LAST item, select the one BEFORE it.
          else if (indexToDelete === filteredLocations.length - 1) {
            setSelectedLocation(filteredLocations[indexToDelete - 1]);
          }
          // Case 3: For any other item (first or middle), select the one AFTER it.
          else {
            setSelectedLocation(filteredLocations[indexToDelete + 1]);
          }
        }

        // Now, update the lists by removing the deleted item
        setLocations((prev) => prev.filter((loc) => loc.id !== id));
        setFilteredLocations((prev) => prev.filter((loc) => loc.id !== id));

        navigate("/locations");
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        alert("Failed to delete the location.");
      });
    // }
  };

  // Funtional to minimize the Name
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
        {/* Header */}
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
              {/* Left Card (Locations List) */}
              <div className="border ml-3 mr-1 w-96 flex flex-col">
                {/* Sort By JSX remains the same */}
                <div className="p-3 border-border flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Sort By:
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary p-2 h-auto"
                        >
                          {sortBy}
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => setSortBy("Name: Ascending Order")}
                        >
                          Name: Ascending Order
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSortBy("Name: Descending Order")}
                        >
                          Name: Descending Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

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
                            navigate("/locations"); // 👈 Navigate away from /create or /edit
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
                        No Locations found
                      </p>
                      <Button
                        // variant="link"
                        onClick={handleShowNewLocationForm}
                        className="text-primary p-0 bg-white cursor-pointer"
                      >
                        Create the first asset
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Card (Detail / Form View) */}
              <Card className="flex flex-col h-full mr-2 overflow-hidden flex-1 mr-2">
                <CardContent className="flex-1 overflow-y-auto min-h-0">
                  {isCreateRoute || isEditRoute || isCreateSubLocationRoute ? ( // 👈 Check for either create or edit URL
                    <NewLocationForm
                      onCancel={handleCancelForm}
                      onCreate={handleCreateForm}
                      setSelectedLocation={setSelectedLocation}
                      onSuccess={handleFormSuccess}
                      // setShowForm is now technically redundant as state is URL driven
                      isEdit={isEditMode} // 👈 Pass derived state
                      editData={locationToEdit} // 👈 Pass derived data
                      initialParentId={parentIdFromUrl}
                    />
                  ) : selectedLocation ? (
                    <div className="max-w-2xl p-4 mx-auto bg-white">
                      {/* Header */}
                      <div className="flex justify-between items-center  mb-3">
                        <h2 className="text-xl font-semibold text-gray-800 capitalize">
                          {selectedLocation?.name}
                        </h2>
                        <div className="flex items-center gap-2">
                          <button
                            title="Copy Link"
                            className="p-2 rounded-md text-orange-600 cursor-pointer"
                          >
                            <Link size={18} />
                          </button>
                          <button
                            title="Edit"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md cursor-pointer text-orange-600 hover:bg-orange-50 border border-orange-600"
                            onClick={() => {
                              // ❌ REMOVED: setIsEdit(true) & setEditData(selectedLocation)
                              // ✅ Navigate to the new parameterized URL
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
                              <DropdownMenuContent align="end" className="mt-2">
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

                      <hr></hr>
                      {/* Description and other detail JSX remains the same */}
                      {selectedLocation.address && (
                        <div className="mb-6 mt-6">
                          <h3 className="text-sm font-medium text-gray-700">
                            Address
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {selectedLocation.address || "No Address available"}
                          </p>
                        </div>
                      )}

                      {selectedLocation.description && (
                        <div className="mb-6 mt-6">
                          <h3 className="text-sm font-medium text-gray-700">
                            Description
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {selectedLocation.description ||
                              "No description available"}
                          </p>
                        </div>
                      )}
                      {selectedLocation?.photoUrls.length > 0 && (
                        <>
                          <div className="mb-6 mt-6 flex gap-2 flex-wrap">
                            {selectedLocation?.photoUrls?.map((item) => (
                              <img
                                key={item.id}
                                src={`data:${item.mimetype};base64,${item.base64}`}
                                alt="Location"
                                className="w-24 h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                          <hr></hr>
                        </>
                      )}

                      {selectedLocation.qrCode && (
                        <div>
                          <h3 className="text-sm mt-2 font-medium text-gray-700">
                            QR Code/Barcode
                          </h3>
                          {selectedLocation.qrCode && (
                            <>
                              <h4 className="text-sm mt-2 text-gray-700">
                                {selectedLocation?.qrCode}
                              </h4>
                              <div className="mt-2 mb-3 flex justify-start">
                                <div className="bg-white shadow-md rounded-lg p-2 w-fit border border-gray-200">
                                  <div className="flex justify-center mb-1 ro">
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

                      {/* Sub-Locations */}
                      <div className="mb-6 mt-6">
                        <h3 className="text-sm font-medium text-gray-700">
                          Sub-Locations (0)
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Add sub elements inside this Location
                        </p>
                        <button
                          onClick={handleShowNewSubLocationForm}
                          className="mt-2 cursor-pointer text-orange-600 hover:underline text-sm"
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

                      {/* Footer */}
                      <div className="text-sm text-gray-500 mt-6">
                        Created By{" "}
                        <span className="font-medium text-gray-700 capitalize">
                          {user?.fullName}
                        </span>{" "}
                        on {formatDate(selectedLocation.createdAt)}
                      </div>

                      {/* Action Button */}
                      <div className="mt-6 flex justify-center">
                        <NavLink to="/work-orders">
                          <button className="bg-white border hover-bg-orange-50 border-orange-600 text-orange-600 px-5 py-3 p-2 cursor-pointer rounded-full text-sm shadow-sm transition">
                            Use in New Work Order
                          </button>
                        </NavLink>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
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
