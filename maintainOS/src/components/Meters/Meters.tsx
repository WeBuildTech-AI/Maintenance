import { useState } from "react";
import { MeterDetail } from "./MeterDetail/MeterDetail";
import { MetersEmptyState } from "./MetersEmptyState";
import { MetersHeader } from "./MetersHeader";
import { MetersList } from "./MetersList/MetersList";
import { mockMeters } from "./mockData";
import { NewMeterForm } from "./NewMeterForm/NewMeterForm";

export function Meters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMeterForm, setShowNewMeterForm] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedMeter, setSelectedMeter] = useState<typeof mockMeters[0] | null>(null);

  const filteredMeters = mockMeters.filter((meter) => {
    const matchesSearch =
      meter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meter.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meter.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || meter.type.toLowerCase() === selectedType.toLowerCase();
    const matchesAsset = selectedAsset === "all" || meter.asset.toLowerCase() === selectedAsset.toLowerCase();
    const matchesLocation = selectedLocation === "all" || meter.location.toLowerCase() === selectedLocation.toLowerCase();

    return matchesSearch && matchesType && matchesAsset && matchesLocation;
  });

  return (
    <div className="flex flex-col h-full">
      <MetersHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setShowNewMeterForm={setShowNewMeterForm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />

      <div className="flex flex-1 overflow-hidden">
        <MetersList
          filteredMeters={filteredMeters}
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
    </div>
  );
}
