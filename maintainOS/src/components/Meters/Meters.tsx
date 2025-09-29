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

export function Meters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMeterForm, setShowNewMeterForm] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [meterData, setMeterData] = useState<MeterResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [getLocationData, setGetLocationData] = useState([]);
  const [getAssetData, setGetAssestData] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState<
    (typeof meterData)[0] | null
  >(null);

  useEffect(() => {
    const fetchMeters = async () => {
      setLoading(true);
      try {
        const res = await meterService.fetchMeters(10, 1, 0);
        setMeterData(res);
        console.log(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await locationService.fetchLocations(10, 1, 0);
        setGetLocationData(res);
        console.log(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const res = await assetService.fetchAssets(10, 1, 0);
        setGetAssestData(res);
        console.log(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const filteredMeters = meterData.filter((meter) => {
    const query = searchQuery.toLowerCase();

    // Search by name, meterType, or locationId (if needed)
    const matchesSearch =
      meter.name.toLowerCase().includes(query) ||
      meter.meterType.toLowerCase().includes(query) ||
      (meter.locationId?.toLowerCase().includes(query) ?? false);

    // Filter by type
    const matchesType =
      selectedType === "all" ||
      meter.meterType.toLowerCase() === selectedType.toLowerCase();

    // Filter by asset
    const matchesAsset =
      selectedAsset === "all" ||
      meter.assetId?.toLowerCase() === selectedAsset.toLowerCase();

    // Filter by location
    const matchesLocation =
      selectedLocation === "all" ||
      meter.locationId?.toLowerCase() === selectedLocation.toLowerCase();

    return matchesSearch && matchesType && matchesAsset && matchesLocation;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {MetersHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        setShowNewMeterForm,
        setShowSettings
      )}

      {viewMode === "table" ? (
        <>
          <MeterTable meter={filteredMeters} selectedMeter={selectedMeter} />
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
              getLocationData={getLocationData}
              getAssetData={getAssetData}
            />

            <div className="flex-1 bg-card">
              {showNewMeterForm ? (
                <NewMeterForm
                  onCancel={() => setShowNewMeterForm(false)}
                  onCreate={() => {
                    // Your create meter logic
                    console.log("Meter created!");
                    setShowNewMeterForm(false);
                  }}
                  getLocationData={getLocationData}
                  getAssetData={getAssetData}
                />
              ) : selectedMeter ? (
                <MeterDetail
                  selectedMeter={selectedMeter}
                  getLocationData={getLocationData}
                  getAssetData={getAssetData}
                />
              ) : (
                <MetersEmptyState />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
