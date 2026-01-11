"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, MoreVertical, Clock, Building2, Gauge, Timer, Play, FileText, ExternalLink, Loader2 } from "lucide-react";
import { Switch } from "../ui/switch-automations";
import type { Automation } from "./AutomationsList";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteAutomation, switchAutomation } from "../../store/automations/automations.thunks";
import { AutomationOptionsModal } from "./modals/AutomationOptionsModal";
import DeleteAutomationModal from "./modals/DeleteAutomationModal";
import { meterService } from "../../store/meters/meters.service";

interface AutomationDetailsProps {
  automation: Automation;
  onEdit?: () => void;
}

export function AutomationDetails({ automation, onEdit }: AutomationDetailsProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const selectedAutomation = useAppSelector((state) => state.automations.selectedAutomation);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [meterUnit, setMeterUnit] = useState<string>("");

  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch meter unit when automation is loaded
  useEffect(() => {
    const fetchMeterUnit = async () => {
      if (!selectedAutomation?.triggers?.when?.[0]?.meterId) return;
      
      try {
        const meterId = selectedAutomation.triggers.when[0].meterId;
        const meter = await meterService.fetchMeterById(meterId);
        
        if (meter?.measurement?.name) {
          setMeterUnit(meter.measurement.name);
        }
      } catch (error) {
        console.error("Failed to fetch meter unit:", error);
      }
    };

    fetchMeterUnit();
  }, [selectedAutomation]);

  const handleSwitchToggle = async () => {
    setIsSwitching(true);
    try {
      await dispatch(switchAutomation(automation.id)).unwrap();
    } catch (error) {
      console.error("Failed to switch automation:", error);
    } finally {
      setIsSwitching(false);
    }
  };



  const handleCopyAutomation = () => {
    // TODO: Implement copy automation logic
    console.log("Copy automation:", automation.id);
  };

  const handleDeleteClick = () => {
    // Show confirmation modal
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteAutomation(automation.id)).unwrap();
      setShowDeleteModal(false);
      // Optionally navigate back or refresh the list
    } catch (error) {
      console.error("Failed to delete automation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto border-l border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{automation.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Automation ID: {automation.automationId}
            </p>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last Run: {automation.lastRun}</span>
            </div>
            <p className="text-sm text-gray-500">Created on {automation.createdOn}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
              onClick={onEdit}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <div className="relative">
              <button 
                ref={moreButtonRef}
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => setShowOptionsModal(true)}
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
              
              {/* Automation Options Dropdown */}
              <AutomationOptionsModal
                open={showOptionsModal}
                onClose={() => setShowOptionsModal(false)}
                onCopy={handleCopyAutomation}
                onDelete={handleDeleteClick}
                buttonRef={moreButtonRef}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-orange-600 w-[calc(100%+3rem)] -mx-6 mb-0" />

        {/* Enable Toggle */}

        <div className="flex items-center justify-between py-4 border-y border-gray-200 -mx-6 px-6 bg-gray-50/50 mb-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-900">Enable Automation</span>
            <span className="text-xs text-gray-500">
              {automation.enabled 
                ? "Automation is active and running" 
                : "Automation is currently paused"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isSwitching && (
              <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Updating...
              </div>
            )}
            <Switch
              checked={automation.enabled}
              onCheckedChange={handleSwitchToggle}
              disabled={isSwitching}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600">{automation.description}</p>
        </div>

        {/* Trigger Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Trigger</h3>
          </div>

          {/* Trigger Condition */}
          <div className="ml-3 relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-orange-200" style={{ left: '4px' }} />
            
            <div className="pl-6">
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                <p className="text-sm text-gray-800">
                  <span className="font-medium text-orange-700">When: </span>
                  {automation.trigger.condition} {meterUnit}
                </p>
              </div>

              {/* Trigger Details */}
              <div className="space-y-3 border border-gray-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Assets:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                    <Building2 className="w-3 h-3" />
                    {automation.trigger.assets}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Meters:</span>
                  <span className="text-sm text-gray-800">{automation.trigger.meters}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">For:</span>
                  <span className="text-sm text-gray-800">{automation.trigger.frequency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
              <Play className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Action</h3>
          </div>

          <div className="ml-3 pl-6">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
              <p className="text-sm font-medium text-gray-800">
                {automation.action.type}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {automation.action.frequency}
              </p>
            </div>

            {/* Action Details */}
            <div className="space-y-3 border border-gray-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Title:</span>
                <span className="text-sm text-gray-800">{automation.action.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Asset:</span>
                <span className="text-sm text-gray-800">{automation.action.asset}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action History */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Action History</h3>
          
          <div className="space-y-2">
            {automation.actionHistory.map((history, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-md border 
                  ${history.status === "skipped" ? "border-orange-200 bg-orange-50/50" : "border-gray-200"}`}
              >
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${history.status === "skipped" ? "text-orange-500" : "text-gray-500"}`} />
                  <span className={`text-sm ${history.status === "skipped" ? "text-orange-600" : "text-gray-600"}`}>
                    {history.time}
                  </span>
                  {history.value && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      {history.value}
                    </span>
                  )}
                </div>
                
                <div>
                  {history.status === "skipped" ? (
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-medium border border-orange-200">
                      Skipped ({history.skippedCount})
                    </span>
                  ) : (
                    <>
                      {/* Show "See Work Order" if there's a work order link */}
                      {history.workOrderLink ? (
                        <button 
                          onClick={() => {
                            const workOrderId = history.workOrderLink?.replace('#', '');
                            if (workOrderId) {
                              navigate(`/work-orders/${workOrderId}`);
                            }
                          }}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          See Work Order
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : null}
                      
                      {/* Show "See Asset" if action type is asset status change and we have an assetId */}
                      {automation.action.type.toLowerCase().includes('asset status') && automation.action.assetId && automation.action.assetId !== '{{asset.id}}' ? (
                        <button 
                          onClick={() => {
                            const assetId = automation.action.assetId;
                            if (assetId) {
                              navigate(`/assets?assetId=${assetId}&page=1&limit=50`);
                            }
                          }}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          See Asset
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteAutomationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
