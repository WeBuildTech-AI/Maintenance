import React, { useEffect, useState } from "react";
import {
  Building2,
  Edit,
  LinkIcon,
  MapPin,
  MoreHorizontal,
  Plus,
  Copy,
} from "lucide-react";
import { Button } from "../../ui/button";
import { MeterDetailsSection } from "./MeterDetailsSection";
import { MeterReadings } from "./MeterReadings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { formatDate } from "../../utils/Date";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import MeterDeleteModal from "../MeterDeleteModal";
import RecordReadingModal from "./RecordReadingModal";
import toast from "react-hot-toast";
import { Tooltip } from "../../ui/tooltip";
import { meterService, createMeter } from "../../../store/meters";
import { workOrderService } from "../../../store/workOrders";
import { NewMeterForm } from "../NewMeterForm/NewMeterForm";
import { useNavigate } from "react-router-dom"; // ✅ Import

export function MeterDetail({
  selectedMeter,
  handleDeleteMeter,
  fetchMeters,
  setShowReadingMeter,
  setIsRecordModalOpen,
  restoreData,
  onClose,
  onOptimisticCreate, // ✅ Destructure
  onOptimisticUpdate, // ✅ Destructure
}: any) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [createdUserName, setCreatedUserName] = useState("Unknown");
  const [updatedUserName, setUpdatedUserName] = useState("Unknown");
  const [openMeterDeleteModal, setOpenMeterDeleteModal] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleRestoreData = async () => {
    try {
      await meterService.restoreMeterData(selectedMeter.id);
      fetchMeters();
      toast.success("Successfully restored the data");
    } catch (err) {
      toast.error("Failed to restore the Meter Data");
    }
  };

  const fetchMeterUsers = async () => {
    try {
      if (selectedMeter.createdBy) {
        const res = await workOrderService.fetchUserById(selectedMeter.createdBy);
        setCreatedUserName(res.fullName || "Unknown");
      } else {
        setCreatedUserName("Unknown");
      }
      if (selectedMeter.updatedBy) {
        const res = await workOrderService.fetchUserById(selectedMeter.updatedBy);
        setUpdatedUserName(res.fullName || "Unknown");
      } else {
        setUpdatedUserName("Unknown");
      }

    } catch (err) {
      console.log("Error fetching user details:", err);
    }
  };

  useEffect(() => {
    fetchMeterUsers();
  }, [selectedMeter.id, selectedMeter.createdBy, selectedMeter.updatedBy]);

  const handleCopyMeter = async () => {
    const loadingToast = toast.loading("Copying meter...");
    try {
      const formData = new FormData();
      formData.append("name", `Copy-${selectedMeter.name}`);
      formData.append("meterType", selectedMeter.meterType || "manual");

      const measId = selectedMeter.measurementId || selectedMeter.measurement?.id;
      if (measId) formData.append("measurementId", measId);

      if (selectedMeter.description) formData.append("description", selectedMeter.description);
      if (selectedMeter.assetId) formData.append("assetId", selectedMeter.assetId);
      if (selectedMeter.locationId) formData.append("locationId", selectedMeter.locationId);

      if (selectedMeter.readingFrequency) {
        formData.append("readingFrequency", JSON.stringify(selectedMeter.readingFrequency));
      }

      const newMeter = await dispatch(createMeter(formData)).unwrap();
      toast.success("Meter copied successfully!", { id: loadingToast });

      // ✅ Optimistic Update
      if (onOptimisticCreate) {
        onOptimisticCreate(newMeter);
      } else if (fetchMeters) {
        fetchMeters();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to copy meter", { id: loadingToast });
    }
  };



  return (
    <>
      <div className="flex border mr-2 mb-2 flex-col h-full">
        {/* Header */}
        <div className="p-6 border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-medium capitalize">
              {selectedMeter.name}
            </h1>
            <div className="flex items-center gap-2">
              <Tooltip text="Copy Link">
                <button
                  title="Copy Link"
                  onClick={() => {
                    const url = `${window.location.origin}/meters?meterId=${selectedMeter.id}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Meter link copied!");
                  }}
                  className="cursor-pointer rounded-md p-2 text-orange-600"
                >
                  <LinkIcon size={18} />
                </button>
              </Tooltip>
              <Button
                className="gap-2 bg-orange-600 hover:bg-orange-700"
                onClick={() => setIsRecordModalOpen && setIsRecordModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Record Reading
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-orange-600"
                onClick={() => navigate(`/meters/${selectedMeter.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="mt-2">
                    <DropdownMenuItem onClick={handleCopyMeter}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Meter
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setOpenMeterDeleteModal(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                    {restoreData && (
                      <DropdownMenuItem
                        onClick={() => {
                          handleRestoreData();
                          if (onClose) onClose();
                        }}
                      >
                        {restoreData}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            {selectedMeter?.assetId && (
              <div
                // ✅ UPDATED: Path-based Routing
                onClick={() => {
                  console.log("👉 Detail View Asset Click:", selectedMeter.assetId);
                  navigate(`/assets?assetId=${selectedMeter.assetId}&page=1&limit=50`);
                }}
                className="flex items-center cursor-pointer gap-2 hover:text-orange-600 hover:underline"
              >
                <Building2 className="h-4 w-4" />
                <span>
                  {selectedMeter.asset && selectedMeter.asset.name}
                </span>
              </div>
            )}
            {selectedMeter?.locationId && (
              <div
                // ✅ UPDATED: Path-based Routing
                onClick={() => {
                  console.log("👉 Detail View Location Click:", selectedMeter.locationId);
                  navigate(`/locations/${selectedMeter.locationId}`);
                }}
                className="flex items-center gap-2 cursor-pointer hover:text-orange-600 hover:underline"
              >
                <MapPin className="h-4 w-4" />
                <span>
                  {selectedMeter.location && selectedMeter.location.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 w-full space-y-8 overflow-y-auto">
          <MeterReadings
            selectedMeter={selectedMeter}
            setShowReadingMeter={setShowReadingMeter}
          />
          <MeterDetailsSection selectedMeter={selectedMeter} />

          <div className="text-sm text-gray-500 mt-6">
            Created By{" "}
            <span className="font-medium text-gray-700 capitalize">
              {createdUserName}
            </span>{" "}
            on {formatDate(selectedMeter.createdAt)}
          </div>

          {selectedMeter.createdAt !== selectedMeter.updatedAt && (
            <div className="text-sm text-gray-500 mt-1">
              Updated By{" "}
              <span className="font-medium text-gray-700 capitalize">
                {updatedUserName}
              </span>{" "}
              on {formatDate(selectedMeter.updatedAt)}
            </div>
          )}

          {openMeterDeleteModal && (
            <MeterDeleteModal
              modalRef={modalRef}
              onClose={() => setOpenMeterDeleteModal(false)}
              onConfirm={() => {
                handleDeleteMeter(selectedMeter?.id);
                setOpenMeterDeleteModal(false);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}