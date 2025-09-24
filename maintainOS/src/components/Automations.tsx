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
  LayoutGrid,
  ChevronDown,
  Search,
  AlertTriangle,
  Settings,
  PanelTop,
  Table,
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
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "480px",
          maxWidth: "90%",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#111827",
            margin: 0,
            marginBottom: "8px",
          }}
        >
          Discard unsaved changes?
        </h3>

        {/* Message */}
        <p
          style={{
            fontSize: "14px",
            color: "#6B7280",
            marginBottom: "24px",
            lineHeight: "1.5",
            margin: 0,
            marginBottom: "24px",
          }}
        >
          If you leave now, you'll lose unsaved changes to this automation.
        </p>

        {/* Divider Line */}
        <div
          style={{
            height: "1px",
            backgroundColor: "#E5E7EB",
            marginBottom: "16px",
          }}
        />

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
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
      </div>
    </div>
  );
}
// ---------------- Action Item ----------------
function ActionItem({
  icon,
  text,
  isLocked = false,
}: {
  icon: React.ReactNode;
  text: string;
  isLocked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
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

// ---------------- New Automation Form ----------------
function NewAutomationForm({ onBack }: { onBack: () => void }) {
  const [showDiscardModal, setShowDiscardModal] = useState(false);

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
            <div className="space-y-3">
              <ActionItem icon={<FilePlus2 />} text="Create a Work Order" />
              <ActionItem
                icon={<WandSparkles />}
                text="Change Asset status"
                isLocked
              />
              <ActionItem icon={<Bell />} text="Send a notification" isLocked />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDiscardModal
        open={showDiscardModal}
        onCancel={() => setShowDiscardModal(false)}
        onConfirm={onBack}
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
