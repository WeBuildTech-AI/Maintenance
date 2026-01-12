"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store"
import { NewAutomationForm } from "./NewAutomationForm";
import { EditAutomationForm } from "./EditAutomationForm";
import { AutomationsHeaderComponent } from "./AutomationsHeader";
import { AutomationsList, type Automation } from "./AutomationsList";
import { AutomationDetails } from "./AutomationDetails";
import type { ViewMode } from "../purchase-orders/po.types";
import type { AutomationResponse } from "../../store/automations/automations.types";
import { setSelectedAutomation } from "../../store/automations/automations.reducers";
import { fetchAutomations } from "../../store/automations/automations.thunks";
export function Automations() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id: automationIdFromUrl } = useParams<{ id: string }>();

  const { automations, selectedAutomation } = useSelector(
    (state: RootState) => state.automations
  );

  // Local State
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [isEditingAutomation, setIsEditingAutomation] = useState(false);
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"enabled" | "disabled">("enabled");

  // Fetch automations on mount
  useEffect(() => {
    dispatch(fetchAutomations());
  }, [dispatch]);

  // Transform API Data to UI Data (Memoized for performance)
  const uiAutomations: Automation[] = useMemo(() => {
    return automations.map((apiItem) => {
      // Extract latest run for asset/meter info
      const latestRun = apiItem.runs && apiItem.runs.length > 0 ? apiItem.runs[0] : null;
      const firstTrigger = apiItem.triggers.when[0];
      const firstAction = apiItem.actions[0];

      // Format Last Run Date
      const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
      };

      const lastRunText = latestRun 
        ? formatRelativeTime(latestRun.lastTriggeredAt)
        : "Never run";

      // Format operator for better readability
      const formatOperator = (op: string) => {
        const opMap: Record<string, string> = {
          'lt': 'less than',
          'gt': 'greater than',
          'eq': 'equals',
          'lte': 'less than or equal to',
          'gte': 'greater than or equal to',
          'ne': 'not equal to'
        };
        return opMap[op] || op;
      };

      // Format action type for better readability
      const formatActionType = (type: string) => {
        return type
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      // Format scope type
      const formatScopeType = (type: string) => {
        return type
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      // Get meter and asset names from previewContext or latest run
      const meterName = latestRun?.meter?.name 
        || apiItem.previewContext?.meters?.[0]?.name 
        || "Not Yet Triggered";
      
      const assetName = latestRun?.asset?.name 
        || apiItem.previewContext?.assets?.[0]?.name 
        || "Awaiting First Run";

      // Map to UI Interface
      return {
        id: apiItem.id,
        name: apiItem.name,
        asset: assetName,
        location: meterName, 
        lastRun: lastRunText,
        enabled: apiItem.isEnabled,
        description: apiItem.description,
        automationId: apiItem.id,
        createdOn: new Date(apiItem.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        
        // Map nested Trigger object
        trigger: {
          condition: `Meter Reading ${formatOperator(firstTrigger?.rules[0]?.op)} ${firstTrigger?.rules[0]?.value}`,
          assets: assetName !== "Awaiting First Run" ? assetName : "N/A",
          meters: meterName !== "Not Yet Triggered" ? meterName : "N/A",
          frequency: formatScopeType(firstTrigger?.scope?.type || "continuous"),
        },
        
        // Map nested Action object
        action: {
          type: formatActionType(firstAction?.type) || "Unknown Action",
          frequency: "Immediate",
          title: formatActionType(firstAction?.type) || "Action",
          asset: assetName !== "Awaiting First Run" ? assetName : "N/A",
          assetId: firstAction?.assetId,
        },
        
        // Map History
        actionHistory: (apiItem.runs || []).map(run => ({
          time: formatRelativeTime(run.lastTriggeredAt),
          status: "executed",
          value: "Triggered", 
          workOrderLink: run.lastWorkOrderId ? `#${run.lastWorkOrderId}` : undefined
        }))
      };
    });
  }, [automations]);

  // Filter automations based on tab and search query
  const filteredAutomations = useMemo(() => {
    return uiAutomations.filter((automation) => {
      const matchesTab = selectedTab === "enabled" ? automation.enabled : !automation.enabled;
      const matchesSearch = 
        automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        automation.asset.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
  }, [uiAutomations, selectedTab, searchQuery]);

  // Handle Selection - maps UI selection back to Redux and updates URL
  const handleSelect = (uiAuto: Automation) => {
    const originalApiObject = automations.find((a: AutomationResponse) => a.id === uiAuto.id);
    if (originalApiObject) {
      dispatch(setSelectedAutomation(originalApiObject));
      // Update URL with automation ID
      navigate(`/automations/${uiAuto.id}`, { replace: true });
    }
  };

  // Sync URL with selected automation on mount and when URL changes
  useEffect(() => {
    if (automationIdFromUrl && automations.length > 0) {
      const automationFromUrl = automations.find((a) => a.id === automationIdFromUrl);
      if (automationFromUrl && automationFromUrl.id !== selectedAutomation?.id) {
        dispatch(setSelectedAutomation(automationFromUrl));
      }
    }
  }, [automationIdFromUrl, automations, selectedAutomation, dispatch]);

  // Convert Redux selected item to UI format for the list highlight
  const selectedUiAutomation = useMemo(() => {
    return selectedAutomation 
      ? uiAutomations.find(a => a.id === selectedAutomation.id) || null
      : null;
  }, [selectedAutomation, uiAutomations]);

  // Handle tab change and auto-select first item in new tab
  const handleTabChange = (tab: "enabled" | "disabled") => {
    setSelectedTab(tab);
    
    // Find first automation in the new tab
    const firstInTab = automations.find(
      (a) => (tab === "enabled" ? a.isEnabled : !a.isEnabled)
    );
    
    if (firstInTab) {
      dispatch(setSelectedAutomation(firstInTab));
      navigate(`/automations/${firstInTab.id}`, { replace: true });
    } else {
      dispatch(setSelectedAutomation(null));
      navigate('/automations', { replace: true });
    }
  };

  // Memoize the onBack callback to prevent infinite re-renders
  const handleEditBack = useCallback(() => {
    setIsEditingAutomation(false);
    setEditingAutomationId(null);
    // Refresh automations list
    dispatch(fetchAutomations());
  }, [dispatch]);

  if (isCreatingRule) {
    return <NewAutomationForm onBack={() => setIsCreatingRule(false)} />;
  }

  if (isEditingAutomation && editingAutomationId) {
    return (
      <EditAutomationForm
        automationId={editingAutomationId}
        onBack={handleEditBack}
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      {AutomationsHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        setIsCreatingRule,
        setShowSettings
      )}

      {/* Main Content - Split View with Boxes */}
      <div className="flex flex-1 h-full p-3 gap-2 overflow-hidden">
        
        {/* Left Box - Automations List */}
        <div 
          className="border border-border bg-card flex flex-col min-h-0"
          style={{ width: '400px', minWidth: '400px', maxWidth: '400px', flex: '0 0 400px' }}
        >
          <AutomationsList
            selectedTab={selectedTab}
            onTabChange={handleTabChange}
            automations={filteredAutomations}
            selectedAutomation={selectedUiAutomation}
            onSelect={handleSelect}
          />
        </div>

        {/* Right Box - Automation Details */}
        <div className="flex-1 border border-border bg-card min-h-0 flex flex-col overflow-hidden">
          {selectedUiAutomation ? (
            <div className="overflow-y-auto h-full">
              <AutomationDetails 
                automation={selectedUiAutomation}
                onEdit={() => {
                  setIsEditingAutomation(true);
                  setEditingAutomationId(selectedUiAutomation.id);
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-card h-full">
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  Select an automation to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}