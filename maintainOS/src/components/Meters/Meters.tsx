import { useEffect, useState } from "react";
import { MeterDetail } from "./MeterDetail/MeterDetail";
import { MetersEmptyState } from "./MetersEmptyState";
import { MetersHeaderComponent } from "./MetersHeader";
import { MetersList } from "./MetersList/MetersList";
import { mockMeters } from "./mockData";
import { NewMeterForm } from "./NewMeterForm/NewMeterForm";
import { MeterTable } from "./MeterTable";
import { meterService, type MeterResponse } from "../../store/meters";
import type { ViewMode } from "../purchase-orders/po.types";
import { locationService } from "../../store/locations";
import { assetService } from "../../store/assets";
import { useNavigate, useMatch } from "react-router-dom";
import { Toaster } from "react-hot-toast";

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

  const handleCreateForm = () => {
    // Your create/update meter logic will go here
    console.log("Meter operation complete!");
    navigate("/meters");
  };

  useEffect(() => {
    const fetchMeters = async () => {
      setLoading(true);
      try {
        const res = await meterService.fetchMeters(10, 1, 0);

        // 1. Sort the incoming data to show the newest first
        // NOTE: This assumes your meter object has a 'createdAt' or similar date field.
        // Please change 'createdAt' to the correct field name if it's different.
        const sortedData = [...res].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMeterData(sortedData);

        // 2. Set the first meter (the newest) as the selected one
        // This check prevents errors if the API returns no data.
        if (sortedData.length > 0) {
          setSelectedMeter(sortedData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, []);

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
                // getLocationData={getLocationData}
                // getAssetData={getAssetData}
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
                    filteredMeters={meterData}
                    setSelectedMeter={setSelectedMeter}
                    //  setF
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
