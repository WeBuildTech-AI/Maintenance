"use client";

import { Zap, MapPin, Building2 } from "lucide-react";

export interface Automation {
  id: string;
  name: string;
  asset: string;
  location: string;
  lastRun: string;
  enabled: boolean;
  description: string;
  automationId: string;
  createdOn: string;
  trigger: {
    condition: string;
    assets: string;
    meters: string;
    frequency: string;
  };
  action: {
    type: string;
    frequency: string;
    title: string;
    asset: string;
    assetId?: string;
  };
  actionHistory: {
    time: string;
    status: "skipped" | "executed";
    skippedCount?: number;
    value?: string;
    workOrderLink?: string;
  }[];
}

interface AutomationsListProps {
  selectedTab: "enabled" | "disabled";
  onTabChange: (tab: "enabled" | "disabled") => void;
  automations: Automation[];
  selectedAutomation: Automation | null;
  onSelect: (automation: Automation) => void;
}

export function AutomationsList({
  selectedTab,
  onTabChange,
  automations,
  selectedAutomation,
  onSelect,
}: AutomationsListProps) {
  const filteredAutomations = automations.filter(
    (a) => (selectedTab === "enabled" ? a.enabled : !a.enabled)
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-yellow-600 shrink-0">
        <button
          onClick={() => onTabChange("enabled")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors
            ${
              selectedTab === "enabled"
                ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Enabled
        </button>
        <button
          onClick={() => onTabChange("disabled")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors
            ${
              selectedTab === "disabled"
                ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Disabled
        </button>
      </div>

      {/* Automation Items */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filteredAutomations.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No {selectedTab} automations found
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredAutomations &&  filteredAutomations?.map((automation) => {
              const isSelected = selectedAutomation?.id === automation.id;
              
              return (
                <div
                  key={automation.id}
                  onClick={() => onSelect(automation)}
                  className={`cursor-pointer border rounded shadow-sm hover:shadow transition relative group p-4
                    ${
                      isSelected
                        ? "border-yellow-500 bg-yellow-50/40"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 border border-orange-200 shadow-sm">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Automation Name */}
                      <h3 className="font-medium text-sm text-gray-900 truncate leading-tight" title={automation.name}>
                        {automation.name}
                      </h3>
                      
                      {/* Asset */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{automation.asset}</span>
                      </div>
                      
                      {/* Meter/Location */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{automation.location}</span>
                      </div>
                      
                      {/* Last Run */}
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Last Run:</span> {automation.lastRun}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}