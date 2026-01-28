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
  const [actionToDelete, setActionToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form fields
  const [automationName, setAutomationName] = useState("");
  const [description, setDescription] = useState("");

  const [triggers, setTriggers] = useState<string[]>([]);
  const [triggerDataMap, setTriggerDataMap] = useState<Map<number, TriggerData>>(new Map());
  
  // Action data - support multiple actions
  interface ActionCard {
    id: string;
    type: "work_order" | "change_status";
    showForm: boolean;
    data: WorkOrderActionData | ChangeAssetStatusActionData | null;
  }
  
  const [actions, setActions] = useState<ActionCard[]>([]);
  const [showActionSelector, setShowActionSelector] = useState(false);
  
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

        // Populate actions - load all actions into the array
        if (automation.actions && Array.isArray(automation.actions) && automation.actions.length > 0) {
          const loadedActions: ActionCard[] = automation.actions.map((action: any, index: number) => {
          if (action.type === "create_work_order") {
            return {
              id: `action-${index}`,
              type: "work_order" as const,
              showForm: false,
              data: {
                title: action.title || "",
                description: action.description || "",
                assetId: action.assetId || "{{asset.id}}",
                categoryId: action.categoryId || "",
                locationId: action.locationId || "",
                priority: action.priority || "",
                estimatedTimeHours: action.estimatedTimeHours,
                vendorIds: action.vendorIds || [],
                procedureIds: action.procedureIds || [],
                partIds: action.partIds || [],
                assigneeUserIds: action.assigneeUserIds || [],
                assigneeTeamIds: action.assigneeTeamIds || [],
                onlyIfPreviousClosed: action.onlyIfPreviousClosed ?? true,
              } as WorkOrderActionData,
            };
          } else if (action.type === "change_asset_status") {
            return {
              id: `action-${index}`,
              type: "change_status" as const,
              showForm: false,
              data: {
                assetId: action.assetId || "",
                status: action.status || "",
              } as ChangeAssetStatusActionData,
            };
          }
          return {
            id: `action-${index}`,
            type: "work_order" as const,
            showForm: false,
            data: null,
          };
        });
          
          setActions(loadedActions);
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

  // Handle action data changes
  const handleActionChange = useCallback((actionId: string, data: WorkOrderActionData | ChangeAssetStatusActionData) => {
    setActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, data } : action
    ));
  }, []);

  // Add new action
  const handleAddAction = useCallback((type: "work_order" | "change_status") => {
    const newAction: ActionCard = {
      id: Date.now().toString(),
      type,
      showForm: type === "work_order" ? false : true,
      data: null,
    };
    setActions(prev => [...prev, newAction]);
    setShowActionSelector(false);
  }, []);

  // Delete action
  const handleDeleteAction = useCallback((actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
    setShowDeleteModal(false);
    setActionToDelete(null);
  }, []);

  // Toggle action form visibility
  const handleToggleActionForm = useCallback((actionId: string, show: boolean) => {
    setActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, showForm: show } : action
    ));
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
          const actionsArray = [];
          
          // Iterate through all configured actions
          for (const action of actions) {
            if (action.type === "work_order" && action.data) {
              const woData = action.data as WorkOrderActionData;
              if (woData.title) {
                actionsArray.push({
                  type: "create_work_order",
                  title: woData.title,
                  description: woData.description,
                  assetId: woData.assetId,
                  categoryId: woData.categoryId,
                  locationId: woData.locationId,
                  priority: woData.priority,
                  estimatedTimeHours: woData.estimatedTimeHours,
                  vendorIds: woData.vendorIds,
                  procedureIds: woData.procedureIds,
                  partIds: woData.partIds,
                  assigneeUserIds: woData.assigneeUserIds,
                  assigneeTeamIds: woData.assigneeTeamIds,
                  onlyIfPreviousClosed: woData.onlyIfPreviousClosed,
                });
              }
            } else if (action.type === "change_status" && action.data) {
              const csData = action.data as ChangeAssetStatusActionData;
              if (csData.assetId && csData.status) {
                actionsArray.push({
                  type: "change_asset_status",
                  assetId: csData.assetId,
                  status: csData.status,
                });
              }
            }
          }
          
          return actionsArray;
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
                index={index}
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

            {/* Render all configured actions */}
            {actions.map((action) => (
              <div key={action.id} className="mb-6">
                {action.type === "work_order" && (
                  <>
                    {action.showForm ? (
                      <CreateBlankWorkOrderForm
                        onBack={() => handleToggleActionForm(action.id, false)}
                        onChange={(data) => handleActionChange(action.id, data)}
                        initialData={action.data as WorkOrderActionData}
                      />
                    ) : (
                      <div className="border rounded-md shadow bg-white">
                        <div className="bg-blue-50 p-4 flex justify-between items-center rounded-t-md">
                          <h3 className="font-medium text-gray-900">
                            Create a Work Order
                          </h3>
                          <div className="flex gap-3">
                            <Settings2 className="h-5 w-5 text-gray-600 cursor-pointer" />
                            <Trash2
                              className="h-5 w-5 text-gray-600 cursor-pointer"
                              onClick={() => {
                                setActionToDelete(action.id);
                                setShowDeleteModal(true);
                              }}
                            />
                          </div>
                        </div>
                        <div className="divide-y">
                          <div
                            className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
                            onClick={() => handleToggleActionForm(action.id, true)}
                          >
                            <span className="text-blue-600 font-medium flex items-center gap-2">
                              <FilePlus2 className="h-5 w-5" />
                              Create from blank
                            </span>
                            <ChevronRight className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {action.type === "change_status" && (
                  <ChangeAssetStatusForm
                    onBack={() => {
                      setActionToDelete(action.id);
                      setShowDeleteModal(true);
                    }}
                    onChange={(data) => handleActionChange(action.id, data)}
                    initialData={action.data as ChangeAssetStatusActionData}
                  />
                )}
              </div>
            ))}

         
            {actions.length === 0 || showActionSelector ? (
              <div className="space-y-3 mb-6">
                <ActionItem
                  icon={<FilePlus2 />}
                  text="Create a Work Order"
                  onClick={() => handleAddAction("work_order")}
                />
                <ActionItem
                  icon={<WandSparkles />}
                  text="Change Asset Status"
                  onClick={() => handleAddAction("change_status")}
                />
                <ActionItem
                  icon={<Bell />}
                  text="Send a notification"
                  isLocked
                />
              </div>
            ) : null}

            {/* Add Another Action button - only show if we have actions and selector is hidden */}
            {actions.length > 0 && !showActionSelector && (
              <div
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setShowActionSelector(true)}
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

   
      <ConfirmDiscardModal
        open={showDiscardModal}
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={onBack}
      />
      <ConfirmDeleteActionModal
        open={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setActionToDelete(null);
        }}
        onConfirm={() => {
          if (actionToDelete) {
            handleDeleteAction(actionToDelete);
          }
        }}
      />
    </div>
  );
}
