"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Plus,
  Pause,
  ChevronLeft,
  Trash2,
  Settings2,
  Lock,
  FilePlus2,
  ChevronRight,
  WandSparkles,
  Bell,
  GitBranch,
<<<<<<< HEAD
  LayoutGrid,
  ChevronDown,
  Search,
  AlertTriangle,
  Settings,
  PanelTop,
  Table,
=======
  Bookmark,
>>>>>>> origin/frontend-dev
} from "lucide-react";
import { SearchWithDropdown } from "./Locations/SearchWithDropdown";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

// ---------------- Small Inline Modal ----------------
function ConfirmDiscardModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          width: "500px",
          minHeight: "200px",
          maxWidth: "95%",
          padding: "40px 28px 28px",
          textAlign: "center",
          position: "relative",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            color: "#6B7280",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <p
          style={{
            fontSize: "17px",
            fontWeight: 500,
            color: "#111827",
            marginBottom: "28px",
            marginTop: "20px",
          }}
        >
          Discard unsaved changes?
        </p>

        <button
          onClick={onConfirm}
          style={{
            width: "100%",
            backgroundColor: "#60A5FA",
            border: "none",
            borderRadius: "6px",
            padding: "12px",
            fontSize: "15px",
            fontWeight: 600,
            color: "white",
            cursor: "pointer",
            marginBottom: "18px",
          }}
        >
<<<<<<< HEAD
          <button
            onClick={onCancel}
            style={{
              background: "transparent",
              color: "#3B82F6",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#F3F4F6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563EB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3B82F6")}
          >
            Discard Changes
          </button>
        </div>
=======
          Confirm
        </button>

        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "none",
            color: "#3B82F6",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
>>>>>>> origin/frontend-dev
      </div>
    </div>
  );
}

// ---------------- Delete Action Modal ----------------
function ConfirmDeleteActionModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          width: "500px",
          minHeight: "200px",
          maxWidth: "95%",
          padding: "40px 28px 28px",
          textAlign: "center",
          position: "relative",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            color: "#6B7280",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <p
          style={{
            fontSize: "17px",
            fontWeight: 500,
            color: "#111827",
            marginBottom: "28px",
            marginTop: "20px",
          }}
        >
          Are you sure you want to remove this action?
        </p>

        <button
          onClick={onConfirm}
          style={{
            width: "100%",
            backgroundColor: "#60A5FA",
            border: "none",
            borderRadius: "6px",
            padding: "12px",
            fontSize: "15px",
            fontWeight: 600,
            color: "white",
            cursor: "pointer",
            marginBottom: "18px",
          }}
        >
          Confirm
        </button>

        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "none",
            color: "#3B82F6",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------- Action Item ----------------
function ActionItem({
  icon,
  text,
  isLocked = false,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  isLocked?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg ${
        isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
      }`}
      onClick={!isLocked ? onClick : undefined}
    >
      <div className="flex items-center gap-4">
        {isLocked ? (
          <Lock className="h-5 w-5 text-gray-400" />
        ) : (
          <div className="text-blue-600">{icon}</div>
        )}
        <span className={`font-medium ${isLocked ? "text-gray-400" : ""}`}>
          {text}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  );
}

// ---------------- Create Blank Work Order Form ----------------
function CreateBlankWorkOrderForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="border rounded-md shadow bg-white">
      {/* Header */}
      <div className="bg-blue-50 p-4 flex justify-between items-center rounded-t-md">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            ←
          </button>
          <h3 className="font-medium text-gray-900">Create from blank</h3>
        </div>
        <div className="flex gap-3">
          <Settings2 className="h-5 w-5 text-gray-600 cursor-pointer" />
          <Trash2 className="h-5 w-5 text-gray-600 cursor-pointer" />
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Work Order Title <span className="text-red-500">(Required)</span>
          </label>
          <input
            type="text"
            placeholder="What needs to be done?"
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            placeholder="Add a description"
            rows={3}
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">Asset</label>
          <input
            type="text"
            placeholder="Start typing..."
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">
            Assign to
          </label>
          <input
            type="text"
            placeholder="Type name, email or phone number"
            className="mt-1 w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="createOnlyIfClosed" />
          <label htmlFor="createOnlyIfClosed" className="text-sm text-gray-700">
            Create only if previous Work Order generated from Automation is closed
          </label>
        </div>
      </div>
    </div>
  );
}

// ---------------- New Automation Form ----------------
function NewAutomationForm({ onBack }: { onBack: () => void }) {
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showWorkOrderCard, setShowWorkOrderCard] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateBlankForm, setShowCreateBlankForm] = useState(false);

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

      {/* Form Content */}
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4 mb-4">
              <div className="flex justify-between items-center">
                <p className="font-medium text-blue-800">When: Meter Reading</p>
                <button className="p-2 hover:bg-blue-100 rounded">
                  <Trash2 className="h-4 w-4 text-blue-600" />
                </button>
              </div>

              <SearchWithDropdown
                title="Asset"
                placeholder="Start typing..."
                dropdownOptions={["Asset 1", "Asset 2", "Asset 3", "Asset 4"]}
                onSearch={(value) => console.log("Asset search:", value)}
                onDropdownSelect={(option) =>
                  console.log("Asset selected:", option)
                }
              />

              <SearchWithDropdown
                title="Meter (Required)"
                placeholder="Start typing..."
                dropdownOptions={["Meter 1", "Meter 2", "Meter 3", "Meter 4"]}
                onSearch={(value) => console.log("Meter search:", value)}
                onDropdownSelect={(option) =>
                  console.log("Meter selected:", option)
                }
              />
            </div>

            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
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
<<<<<<< HEAD
            <div className="space-y-3">
              <ActionItem icon={<FilePlus2 />} text="Create a Work Order" />
              <ActionItem
                icon={<WandSparkles />}
                text="Change Asset status"
                isLocked
              />
              <ActionItem icon={<Bell />} text="Send a notification" isLocked />
            </div>
=======
            {showWorkOrderCard ? (
              showCreateBlankForm ? (
                <CreateBlankWorkOrderForm
                  onBack={() => setShowCreateBlankForm(false)}
                />
              ) : (
                <>
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

                  <div
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setShowWorkOrderCard(true)}
                  >
                    <div className="flex items-center justify-start gap-2 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="font-medium">Add Action</span>
                    </div>
                  </div>
                </>
              )
            ) : (
              <div className="space-y-3">
                <ActionItem
                  icon={<FilePlus2 />}
                  text="Create a Work Order"
                  onClick={() => setShowWorkOrderCard(true)}
                />
                <ActionItem
                  icon={<WandSparkles />}
                  text="Change Asset status"
                  isLocked
                />
                <ActionItem icon={<Bell />} text="Send a notification" isLocked />
              </div>
            )}
>>>>>>> origin/frontend-dev
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmDiscardModal
        open={showDiscardModal}
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={onBack}
      />

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

// ---------------- Automations Main ----------------
export function Automations() {
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("panel");

  if (isCreatingRule) {
    return <NewAutomationForm onBack={() => setIsCreatingRule(false)} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {/* <div className="flex justify-between items-center">
        <div>
          <h1>Automations</h1>
          <p className="text-muted-foreground">
            No-code rule builder for automated maintenance workflows
          </p>
        </div>
        <Button onClick={() => setIsCreatingRule(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div> */}

      <div className=" border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-medium">Automations</h1>
              {/* <p className="text-muted-foreground mt-2">
                No-code rule builder for automated maintenance workflows
              </p> */}
            </div>
            {/* <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Panel View</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div> */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* plain trigger, styled as a row (no button chrome) */}
                  <button
                    type="button"
                    className="flex h-6 items-center gap-2 cursor-pointer select-none
                              text-sm text-muted-foreground hover:text-foreground bg-transparent p-0"
                  >
                    <span className="leading-none font-medium ">
                      {viewMode === "panel" ? "Panel View" : "Table View"}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setViewMode("panel")}>
                    <PanelTop className="mr-2 h-4 w-4" /> Panel View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode("table")}>
                    <Table className="mr-2 h-4 w-4" /> Table View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              className="gap-2 bg-orange-600 hover:bg-orange-700"
              onClick={() => setIsCreatingRule(true)}
            >
              <Plus className="h-4 w-4" />
              New Automations
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Criticality
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Filter
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-orange-600">
            <Settings className="h-4 w-4" />
            My Filters
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Active Rules</CardTitle>
            <CardDescription>
              Currently running automation rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-1">
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">Critical Asset Failure Alert</p>
                  <p className="text-sm text-muted-foreground">
                    When asset status = "Critical Failure", create urgent WO
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50">
                    Active
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">SLA Breach Notification</p>
                  <p className="text-sm text-muted-foreground">
                    When WO SLA &lt; 2 hours, notify manager
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50">
                    Active
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rule Builder Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Builder</CardTitle>
            <CardDescription>
              Create automated workflows with triggers and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Visual rule builder interface with "When-Then" logic would be
              implemented here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
