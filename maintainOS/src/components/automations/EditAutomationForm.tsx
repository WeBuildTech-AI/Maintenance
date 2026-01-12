"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  WandSparkles,
  Bell,
  GitBranch,
  Lock,
  Plus,
  Bookmark,
  Trash2,
  Settings2,
} from "lucide-react";

import { ConfirmDiscardModal } from "./modals/ConfirmDiscardModal";
import { ConfirmDeleteActionModal } from "./modals/ConfirmDeleteActionModal";
import { CreateBlankWorkOrderForm, type WorkOrderActionData } from "./actions/CreateBlankWorkOrderForm";
import { ChangeAssetStatusForm, type ChangeAssetStatusActionData } from "./actions/ChangeAssetStatusForm";
import { ActionItem } from "./shared/ActionItem";
import { TriggerCard, type TriggerData } from "./triggers/TriggerCard";
import type { SelectOption } from "../work-orders/NewWorkOrderForm/DynamicSelect";
import { fetchFilterData } from "../utils/filterDataFetcher";
import { useAppDispatch } from "../../store/hooks";
import { fetchAutomationById, updateAutomation } from "../../store/automations/automations.thunks";
import { toast } from "../ui/use-toast";

interface EditAutomationFormProps {
  automationId: string;
  onBack: () => void;
}

export function EditAutomationForm({ automationId, onBack }: EditAutomationFormProps) {
  const dispatch = useAppDispatch();
  
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<"work_order" | "change_status" | null>(null);
  const [showCreateBlankForm, setShowCreateBlankForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form fields
  const [automationName, setAutomationName] = useState("");
  const [description, setDescription] = useState("");

  const [triggers, setTriggers] = useState<string[]>([]);
  const [triggerDataMap, setTriggerDataMap] = useState<Map<number, TriggerData>>(new Map());
  
  // Action data
  const [workOrderActionData, setWorkOrderActionData] = useState<WorkOrderActionData | null>(null);
  const [changeStatusActionData, setChangeStatusActionData] = useState<ChangeAssetStatusActionData | null>(null);
  
  // Dynamic dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
  const [meterOptions, setMeterOptions] = useState<SelectOption[]>([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);
  const [isMetersLoading, setIsMetersLoading] = useState(false);

  // Fetch automation data on mount
  useEffect(() => {
    const loadAutomationData = async () => {
      try {
        setIsLoading(true);
        const automation = await dispatch(fetchAutomationById(automationId)).unwrap();
        
        // Populate basic fields
        setAutomationName(automation.name || "");
        setDescription(automation.description || "");

        // Populate triggers
        if (automation.triggers?.when && Array.isArray(automation.triggers.when)) {
          const triggersArray = automation.triggers.when;
          setTriggers(triggersArray.map(() => "Meter Reading"));

          // Map API trigger data to form data
          const newTriggerDataMap = new Map<number, TriggerData>();
          triggersArray.forEach((trigger: any, index: number) => {
            // Map API operator format back to UI format
            const operatorReverseMap: Record<string, string> = {
              "eq": "equal",
              "ne": "notEqual",
              "gt": "above",
              "lt": "below",
              "gte": "aboveOrEqual",
              "lte": "belowOrEqual",
              "between": "isBetween",
              "decreases_by_from_last_trigger": "DecreasedbyLastTrigger",
              "increases_by_from_last_trigger": "IncreasedbyLastTrigger",
              "increases_by_from_last_reading": "IncreasedbyLastReading",
              "decreases_by_from_last_reading": "DecreasedbyLastReading"
            };

            // Map scope type back to UI format
            const scopeReverseMap: Record<string, string> = {
              "one_reading": "oneReading",
              "multiple_readings": "multipleReadings",
              "reading_longer_than": "readingLongerThan"
            };

            const conditions = (trigger.rules || []).map((rule: any, ruleIndex: number) => ({
              id: `${index}-${ruleIndex}`,
              operator: operatorReverseMap[rule.op] || rule.op,
              value: String(rule.value || "")
            }));

            newTriggerDataMap.set(index, {
              meterId: trigger.meterId || "",
              assetId: trigger.assetId || "",
              conditions,
              forOption: scopeReverseMap[trigger.scope?.type] || "oneReading",
              multipleReadingsCount: "",
              lastReadingsCount: "",
              durationValue: "",
              timeUnit: "minutes",
            });
          });

          setTriggerDataMap(newTriggerDataMap);
        }

        // Populate actions
        if (automation.actions && Array.isArray(automation.actions) && automation.actions.length > 0) {
          const firstAction = automation.actions[0];
          
          if (firstAction.type === "create_work_order") {
            setSelectedActionType("work_order");
            setShowCreateBlankForm(true);
            setWorkOrderActionData({
              title: firstAction.title || "",
              description: firstAction.description || "",
              assetId: firstAction.assetId || "{{asset.id}}",
              assigneeUserIds: firstAction.assigneeUserIds || [],
              assigneeTeamIds: firstAction.assigneeTeamIds || [],
              onlyIfPreviousClosed: firstAction.onlyIfPreviousClosed || false,
            });
          } else if (firstAction.type === "change_asset_status") {
            setSelectedActionType("change_status");
            setChangeStatusActionData({
              assetId: firstAction.assetId || "{{asset.id}}",
              status: firstAction.status || "offline",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load automation:", error);
        toast.error("Failed to load automation data");
        onBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadAutomationData();
  }, [automationId, dispatch, onBack]);

  // Fetch handlers
  const handleFetchAssets = async () => {
    try {
      setIsAssetsLoading(true);
      const { data } = await fetchFilterData("assets");
      const normalized = Array.isArray(data)
        ? data.map((d: any) => ({
            id: d.id,
            name: d.name || "Unknown Asset",
          }))
        : [];
      setAssetOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setIsAssetsLoading(false);
    }
  };

  const handleFetchMeters = async () => {
    try {
      setIsMetersLoading(true);
      const { data } = await fetchFilterData("meters");
      const normalized = Array.isArray(data)
        ? data.map((d: any) => ({
            id: d.id,
            name: d.name || "Unknown Meter",
          }))
        : [];
      setMeterOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch meters:", error);
    } finally {
      setIsMetersLoading(false);
    }
  };

  // Automatically fetch assets and meters on mount so dropdowns can display selected values
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch both assets and meters in parallel
      await Promise.all([
        handleFetchAssets(),
        handleFetchMeters()
      ]);
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle trigger data changes
  const handleTriggerChange = useCallback((index: number, data: TriggerData) => {
    setTriggerDataMap(prev => {
      const newMap = new Map(prev);
      newMap.set(index, data);
      return newMap;
    });
  }, []);

  // Handle work order action data changes
  const handleWorkOrderChange = useCallback((data: WorkOrderActionData) => {
    setWorkOrderActionData(data);
  }, []);

  // Handle change asset status action data changes
  const handleChangeStatusChange = useCallback((data: ChangeAssetStatusActionData) => {
    setChangeStatusActionData(data);
  }, []);

  // Handle automation update
  const handleSave = async () => {
    // Validation
    if (!automationName.trim()) {
      toast.error("Please enter an automation name");
      return;
    }

    // Check if at least one trigger is configured
    const hasValidTrigger = Array.from(triggerDataMap.values()).some(
      data => data.meterId && data.conditions.length > 0
    );

    if (!hasValidTrigger) {
      toast.error("Please configure at least one trigger with a meter and condition");
      return;
    }

    try {
      setIsSaving(true);

      // Build triggers from collected data
      const triggersData = Array.from(triggerDataMap.values())
        .filter(data => data.meterId && data.conditions.length > 0)
        .map(data => {
          // Map operator strings to API format
          const operatorMap: Record<string, string> = {
            "equal": "eq",
            "notEqual": "ne",
            "above": "gt",
            "below": "lt",
            "aboveOrEqual": "gte",
            "belowOrEqual": "lte",
            "isBetween": "between",
            "DecreasedbyLastTrigger": "decreases_by_from_last_trigger",
            "IncreasedbyLastTrigger": "increases_by_from_last_trigger",
            "IncreasedbyLastReading": "increases_by_from_last_reading",
            "DecreasedbyLastReading": "decreases_by_from_last_reading"
          };

          // Map forOption to scope type
          const scopeTypeMap: Record<string, string> = {
            "oneReading": "one_reading",
            "multipleReadings": "multiple_readings",
            "readingLongerThan": "reading_longer_than"
          };

          const rules = data.conditions.map(condition => ({
            op: operatorMap[condition.operator] || condition.operator,
            value: parseFloat(condition.value) || 0
          }));

          return {
            type: "meter_reading",
            meterId: data.meterId,
            assetId: data.assetId,
            rules,
            scope: {
              type: scopeTypeMap[data.forOption] || "one_reading"
            }
          };
        });

      // Prepare automation data
      const automationData = {
        name: automationName,
        description: description || undefined,
        triggers: {
          when: triggersData
        },
        conditions: {
          activeWindows: []
        },
        actions: (() => {
          const actions = [];
          
          // Add work order action if configured
          if (workOrderActionData && workOrderActionData.title) {
            actions.push({
              type: "create_work_order",
              title: workOrderActionData.title,
              description: workOrderActionData.description,
              assetId: workOrderActionData.assetId,
              assigneeUserIds: workOrderActionData.assigneeUserIds,
              assigneeTeamIds: workOrderActionData.assigneeTeamIds,
              onlyIfPreviousClosed: workOrderActionData.onlyIfPreviousClosed,
            });
          }
          
          // Add change status action if configured
          if (changeStatusActionData && changeStatusActionData.assetId && changeStatusActionData.status) {
            actions.push({
              type: "change_asset_status",
              assetId: changeStatusActionData.assetId,
              status: changeStatusActionData.status,
            });
          }
          
          return actions;
        })(),
      };

      await dispatch(updateAutomation({ id: automationId, automationData })).unwrap();
      
      toast.success("Automation updated successfully!");
      
      // Navigate back
      onBack();
    } catch (error: any) {
      console.error("Failed to update automation:", error);
      
      // Extract detailed error message
      const errorMessage = error?.message 
        || error?.error 
        || error 
        || "Failed to update automation";
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading automation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => setShowDiscardModal(true)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Edit Automation
        </Button>
        <Button 
          className="gap-2 cursor-pointer bg-orange-600 hover:bg-orange-700"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Automation Name */}
        <div className="space-y-2">
          <label
            htmlFor="automation-name"
            className="text-sm font-medium text-black"
          >
            Automation name (Required)
          </label>
          <Input
            id="automation-name"
            placeholder="e.g., Critical Pump Failure Protocol"
            className="border-0 border-b border-black rounded-none bg-white text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-black"
            value={automationName}
            onChange={(e) => setAutomationName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            placeholder="What will this automation do?"
            className="bg-white text-black placeholder:text-gray-500 border border-gray-300 rounded-md resize focus-visible:ring-0 focus-visible:border-black"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Trigger Section */}
        <div className="relative pl-8">
          <div className="absolute left-0 top-1 flex flex-col items-center">
            <div className="bg-gray-100 border rounded-full p-1.5">
              <Settings2 className="h-5 w-5 text-gray-600" />
            </div>
            <div className="h-full border-l-2 border-dashed border-gray-300 my-2"></div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Trigger</h3>

            {triggers.map((trigger, index) => (
              <TriggerCard
                key={index}
                title={trigger}
                onDelete={() =>
                  setTriggers((prev) => prev.filter((_, i) => i !== index))
                }
                assetOptions={assetOptions}
                meterOptions={meterOptions}
                isAssetsLoading={isAssetsLoading}
                isMetersLoading={isMetersLoading}
                onFetchAssets={handleFetchAssets}
                onFetchMeters={handleFetchMeters}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                onChange={(data) => handleTriggerChange(index, data)}
                initialData={triggerDataMap.get(index)}
              />
            ))}

            {/* Add Trigger */}
            <button
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              onClick={() => setTriggers((prev) => [...prev, "Meter Reading"])}
            >
              <div className="flex items-center justify-start gap-2 text-gray-600">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add Trigger</span>
              </div>
            </button>
          </div>
        </div>

        {/* Conditions Section */}
        <div className="relative pl-8">
          <div className="absolute left-0 top-1 flex flex-col items-center">
            <div className="bg-gray-100 border rounded-full p-1.5">
              <GitBranch className="h-5 w-5 text-gray-600" />
            </div>
            <div className="h-full border-l-2 border-dashed border-gray-300 my-2"></div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Conditions</h3>
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-start gap-2 text-gray-600">
                <Lock className="h-5 w-5" />
                <span className="font-medium">Add Condition</span>
              </div>
            </button>
          </div>
        </div>

        {/* Actions Section */}
        <div className="relative pl-8">
          <div className="absolute left-0 top-1 flex flex-col items-center">
            <div className="bg-gray-100 border rounded-full p-1.5">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Actions</h3>

            {/* Show selected action form */}
            {selectedActionType === "work_order" && (
              <>
                {showCreateBlankForm ? (
                  <CreateBlankWorkOrderForm
                    onBack={() => setShowCreateBlankForm(false)}
                    onChange={handleWorkOrderChange}
                    initialData={workOrderActionData}
                  />
                ) : (
                  <div className="border rounded-md shadow bg-white mb-6">
                    <div className="bg-blue-50 p-4 flex justify-between items-center rounded-t-md">
                      <h3 className="font-medium text-gray-900">
                        Create a Work Order
                      </h3>
                      <div className="flex gap-3">
                        <Settings2 className="h-5 w-5 text-gray-600 cursor-pointer" />
                        <Trash2
                          className="h-5 w-5 text-gray-600 cursor-pointer"
                          onClick={() => setShowDeleteModal(true)}
                        />
                      </div>
                    </div>
                    <div className="divide-y">
                      <div
                        className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
                        onClick={() => setShowCreateBlankForm(true)}
                      >
                        <span className="text-blue-600 font-medium flex items-center gap-2">
                          <FilePlus2 className="h-5 w-5" />
                          Create from blank
                        </span>
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer">
                        <span className="text-blue-600 font-medium flex items-center gap-2">
                          <Bookmark className="h-5 w-5" />
                          Use a Template
                        </span>
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedActionType === "change_status" && (
              <ChangeAssetStatusForm
                onBack={() => {
                  setSelectedActionType(null);
                  setChangeStatusActionData(null);
                }}
                onChange={handleChangeStatusChange}
                initialData={changeStatusActionData}
              />
            )}

            {/* Show action selection if no action selected */}
            {!selectedActionType ? (
              <div className="space-y-3">
                <ActionItem
                  icon={<FilePlus2 />}
                  text="Create a Work Order"
                  onClick={() => {
                    setSelectedActionType("work_order");
                  }}
                />
                <ActionItem
                  icon={<WandSparkles />}
                  text="Change Asset Status"
                  onClick={() => {
                    setSelectedActionType("change_status");
                  }}
                />
                <ActionItem
                  icon={<Bell />}
                  text="Send a notification"
                  isLocked
                />
              </div>
            ) : (
              <div
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  // Allow adding another action in the future
                }}
              >
                <div className="flex items-center justify-start gap-2 text-gray-600">
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Another Action</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDiscardModal
        open={showDiscardModal}
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={onBack}
      />
      <ConfirmDeleteActionModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setSelectedActionType(null);
          setWorkOrderActionData(null);
          setChangeStatusActionData(null);
          setShowCreateBlankForm(false);
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
}
