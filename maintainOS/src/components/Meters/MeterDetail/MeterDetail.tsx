import React, { useEffect, useState } from "react";
import {
  Building2,
  Edit,
  FastForward,
  LinkIcon,
  MapPin,
  MoreHorizontal,
  Plus,
  Copy, // Imported Copy Icon
} from "lucide-react";
import { Button } from "../../ui/button";
import { MeterAutomations } from "./MeterAutomations";
import { MeterDetailsSection } from "./MeterDetailsSection";
import { MeterReadings } from "./MeterReadings";
import { MeterWorkOrders } from "./MeterWorkOrders";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { formatDate } from "../../utils/Date";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux"; // Imported useDispatch
import MeterDeleteModal from "../MeterDeleteModal";
import RecordReadingModal from "./RecordReadingModal";
import toast from "react-hot-toast";
import { Tooltip } from "../../ui/tooltip";
import { meterService, createMeter } from "../../../store/meters"; // Imported createMeter
import { workOrderService } from "../../../store/workOrders";

export function MeterDetail({
  selectedMeter,
  handleDeleteMeter,
  fetchMeters,
  setShowReadingMeter,
  setIsRecordModalOpen,
  restoreData,
  onClose,
}: any) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // Initialize dispatch
  const user = useSelector((state: RootState) => state.auth.user);
  const [createdUser, setCreatedUser] = useState("");
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

  const fetchCreatedUser = async () => {
    let res: string[];
    try {
      const res = await workOrderService.fetchUserById(selectedMeter.createdBy);
      setCreatedUser(res.fullName);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCreatedUser();
  }, [selectedMeter.createdBy]);

  // New Feature: Handle Copy Meter
  const handleCopyMeter = async () => {
    const loadingToast = toast.loading("Copying meter...");
    try {
      const formData = new FormData();

      // 1. Prefix Name
      formData.append("name", `Copy-${selectedMeter.name}`);

      // 2. Copy Type
      formData.append("meterType", selectedMeter.meterType || "manual");

      // 3. Copy Measurement Unit (Handle potential structure differences)
      const measId =
        selectedMeter.measurementId || selectedMeter.measurement?.id;
      if (measId) {
        formData.append("measurementId", measId);
      }

      // 4. Copy Optional Fields
      if (selectedMeter.description)
        formData.append("description", selectedMeter.description);
      if (selectedMeter.assetId)
        formData.append("assetId", selectedMeter.assetId);
      if (selectedMeter.locationId)
        formData.append("locationId", selectedMeter.locationId);

      // 5. Copy Frequency (Ensure it's stringified as per NewMeterForm logic)
      if (selectedMeter.readingFrequency) {
        formData.append(
          "readingFrequency",
          JSON.stringify(selectedMeter.readingFrequency)
        );
      }

      // 6. Dispatch Create Action
      await dispatch(createMeter(formData)).unwrap();

      toast.success("Meter copied successfully!", { id: loadingToast });

      // 7. Refresh List
      fetchMeters();
    } catch (err: any) {
      console.error("Failed to copy meter:", err);
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
                onClick={() => setIsRecordModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Record Reading
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-orange-600"
                onClick={() => {
                  navigate(`/meters/${selectedMeter.id}/edit`);
                }}
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
                    {/* ✅ New Copy Option */}
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
                          handleRestoreData(), onClose();
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
              <div className="flex items-center cursor-pointer gap-2">
                <Building2 className="h-4 w-4" />
                <span
                  onClick={() =>
                    navigate(`/assets?assetId=${selectedMeter.asset.id}`)
                  }
                >
                  {selectedMeter.asset && selectedMeter.asset.name}
                </span>
              </div>
            )}
            {selectedMeter?.locationId && (
              <div className="flex items-center gap-2 cursor-pointer">
                <MapPin className="h-4 w-4" />
                <span
                  onClick={() =>
                    navigate(`/locations/${selectedMeter.location.id}`)
                  }
                >
                  {selectedMeter.location && selectedMeter.location.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-8 overflow-auto">
          <MeterReadings
            selectedMeter={selectedMeter}
            setShowReadingMeter={setShowReadingMeter}
          />
          <MeterDetailsSection selectedMeter={selectedMeter} />
          {/* <MeterAutomations /> */}
          {/* <MeterWorkOrders selectedMeter={selectedMeter} /> */}
          {selectedMeter.createdAt === selectedMeter.updatedAt ? (
            <>
              <div className="text-sm text-gray-500 mt-6">
                Created By{" "}
                <span className="font-medium text-gray-700 capitalize">
                  {createdUser}
                </span>{" "}
                on {formatDate(selectedMeter.createdAt)}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-500 mt-6">
                Created By{" "}
                <span className="font-medium text-gray-700 capitalize">
                  {createdUser}
                </span>{" "}
                on {formatDate(selectedMeter.createdAt)}
              </div>
              <div className="text-sm text-gray-500 mt-6">
                Updated By{" "}
                <span className="font-medium text-gray-700 capitalize">
                  {user?.fullName}
                </span>{" "}
                on {formatDate(selectedMeter.createdAt)}
              </div>
            </>
          )}

          {/* Delete Modal */}
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
