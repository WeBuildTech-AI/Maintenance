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

  const filteredMeters = mockMeters.filter((meter) => {
    const matchesSearch =
      meter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meter.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meter.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "all" ||
      meter.type.toLowerCase() === selectedType.toLowerCase();
    const matchesAsset =
      selectedAsset === "all" ||
      meter.asset.toLowerCase() === selectedAsset.toLowerCase();
    const matchesLocation =
      selectedLocation === "all" ||
      meter.location.toLowerCase() === selectedLocation.toLowerCase();

    return matchesSearch && matchesType && matchesAsset && matchesLocation;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {MetersHeaderComponent(viewMode, setViewMode, searchQuery, setSearchQuery, setShowNewMeterForm, setShowSettings)}

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
                />
              ) : selectedMeter ? (
                <MeterDetail selectedMeter={selectedMeter} />
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
