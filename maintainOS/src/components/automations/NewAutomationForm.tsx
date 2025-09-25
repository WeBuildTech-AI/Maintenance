"use client";

import { useState } from "react";
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
import { CreateBlankWorkOrderForm } from "./workorders/CreateBlankWorkOrderForm";
import { ActionItem } from "./shared/ActionItem";
import { TriggerCard } from "./triggers/TriggerCard";

export function NewAutomationForm({ onBack }: { onBack: () => void }) {
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showWorkOrderCard, setShowWorkOrderCard] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateBlankForm, setShowCreateBlankForm] = useState(false);

  const [triggers, setTriggers] = useState<string[]>(["Meter Reading"]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => setShowDiscardModal(true)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          New Automation
        </Button>
        <Button>Create</Button>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Automation Name */}
        <div className="space-y-2">
          <label htmlFor="automation-name" className="text-sm font-medium text-black">
            Automation name (Required)
          </label>
          <Input
            id="automation-name"
            placeholder="e.g., Critical Pump Failure Protocol"
            className="border-0 border-b border-black rounded-none bg-white text-black placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-black"
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
                onDelete={() => setTriggers((prev) => prev.filter((_, i) => i !== index))}
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

            {showWorkOrderCard ? (
              <>
                {showCreateBlankForm ? (
                  <CreateBlankWorkOrderForm onBack={() => setShowCreateBlankForm(false)} />
                ) : (
                  <div className="border rounded-md shadow bg-white mb-6">
                    <div className="bg-blue-50 p-4 flex justify-between items-center rounded-t-md">
                      <h3 className="font-medium text-gray-900">Create a Work Order</h3>
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

                <div
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setShowWorkOrderCard(true)}
                >
                  <div className="flex items-center justify-start gap-2 text-gray-600">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Add Action</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <ActionItem icon={<FilePlus2 />} text="Create a Work Order" onClick={() => setShowWorkOrderCard(true)} />
                <ActionItem icon={<WandSparkles />} text="Change Asset status" isLocked />
                <ActionItem icon={<Bell />} text="Send a notification" isLocked />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDiscardModal open={showDiscardModal} onCancel={() => setShowDiscardModal(false)} onConfirm={onBack} />
      <ConfirmDeleteActionModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowWorkOrderCard(false);
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
}
