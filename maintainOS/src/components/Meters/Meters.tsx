import { useEffect, useState } from "react";
import { MeterDetail } from "./MeterDetail/MeterDetail";
import { MetersEmptyState } from "./MetersEmptyState";
import { MetersHeaderComponent } from "./MetersHeader";
import { MetersList } from "./MetersList/MetersList";
import { mockMeters } from "./mockData";
import { NewMeterForm } from "./NewMeterForm/NewMeterForm";
import { MeterTable } from "./MeterTable";
import {
  deleteMeter,
  meterService,
  type MeterResponse,
} from "../../store/meters";
import type { ViewMode } from "../purchase-orders/po.types";
import { locationService } from "../../store/locations";
import { assetService } from "../../store/assets";
import { useNavigate, useMatch } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";

export function Meters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [meterData, setMeterData] = useState<MeterResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMeter, setSelectedMeter] = useState<
    (typeof meterData)[0] | null
  >(null);

  const dispatch = useDispatch<AppDispatch>();

  // 🔽 Router hooks to manage /create and /:id/edit
  const navigate = useNavigate();
  const isCreateRoute = useMatch("/meters/create");
  const isEditRoute = useMatch("/meters/:meterId/edit");

  // 🔽 Derived State: Determine if we are in edit mode and fetch the data if needed
  const isEditMode = !!isEditRoute;
  const meterToEdit = isEditMode
    ? meterData.find((m) => m.id === isEditRoute?.params.meterId)
    : null;

  const handleShowNewMeterForm = () => {
    navigate("/meters/create");
  };

  const handleCancelForm = () => {
    navigate("/meters");
  };

  const handleCreateForm = async () => {
    // Your create/update meter logic will go here
    console.log("Meter operation complete!");
    navigate("/meters");
    await fetchMeters();
  };

  const fetchMeters = async () => {
    setLoading(true);
    try {
      const res = await meterService.fetchMeters(10, 1, 0);
      const sortedData = [...res].sort(
        (a, b) =>
          new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
      );

      setMeterData(sortedData);

      if (sortedData.length > 0) {
        setSelectedMeter(sortedData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // handle

  // 2. Call the new function inside your useEffect
  useEffect(() => {
    fetchMeters();
  }, []); // This still runs only once on mount

  const handleDeleteMeter = (id) => {
    dispatch(deleteMeter(id))
      .unwrap()
      .then(() => {
        toast.success("Meter Deleted Successfully!");

        // ✨ Naya logic, aapke location wale code jaisa ✨

        // Step 1: Delete hone wale item ka index find karo
        const indexToDelete = meterData.findIndex((meter) => meter.id === id);

        // Step 2: Naya meter sirf tab select karo jab deleted meter hi active/selected tha
        if (selectedMeter?.id === id && indexToDelete !== -1) {
          // Case 1: Agar list mein sirf ek hi item tha
          if (meterData.length === 1) {
            setSelectedMeter(null);
          }
          // Case 2: Agar aakhri item delete hua hai, toh pichla wala select karo
          else if (indexToDelete === meterData.length - 1) {
            setSelectedMeter(meterData[indexToDelete - 1]);
          }
          // Case 3: Baaki sab cases mein (pehla ya beech ka), agla wala select karo
          else {
            setSelectedMeter(meterData[indexToDelete + 1]);
          }
        }

        // Step 3: Frontend ki list ko manually update karo
        // Yeh maan kar ki aapke paas setFilteredMeters state setter hai
        setMeterData((prev) => prev.filter((meter) => meter.id !== id));

        // Optional: Agar aapko delete ke baad page navigate karna hai
        // navigate("/meters");
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
        {/* Header */}
        {MetersHeaderComponent(
          viewMode,
          setViewMode,
          searchQuery,
          setSearchQuery,
          handleShowNewMeterForm,
          setShowSettings
        )}

        {viewMode === "table" ? (
          <>
            <MeterTable meter={meterData} selectedMeter={selectedMeter} />
          </>
        ) : (
          <>
            <div className="flex flex-1 overflow-hidden">
              <MetersList
                // filteredMeters={filteredMeters}
                filteredMeters={meterData}
                selectedMeter={selectedMeter}
                setSelectedMeter={setSelectedMeter}
                loading={loading}
                handleShowNewMeterForm={handleShowNewMeterForm}
                handleCreateForm={handleCreateForm}
                handleCancelForm={handleCancelForm}
              />

              <div className="flex-1 bg-card">
                {isCreateRoute || isEditRoute ? (
                  <NewMeterForm
                    onCancel={handleCancelForm}
                    onCreate={handleCreateForm}
                    // Pass the derived meter data for editing
                    editingMeter={meterToEdit}
                  />
                ) : selectedMeter ? (
                  <MeterDetail
                    selectedMeter={selectedMeter}
                    handleDeleteMeter={handleDeleteMeter}
                  />
                ) : (
                  <MetersEmptyState />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
