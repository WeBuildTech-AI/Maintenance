import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
// import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  MessageSquare,
  Type,
  Gauge,
  Hash,
  ChevronDown,
  CheckSquare,
  CircleDot,
  Camera,
  PenTool,
  Calendar as CalendarIcon,
  Minus,
  Users,
  Calculator,
  Mail,
  Grid3x3,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Move,
  Eye,
  Save,
  Settings,
} from "lucide-react";
import { format } from "date-fns";

export interface ChecklistItem {
  id: string;
  type: string;
  label: string;
  required: boolean;
  category: "controlpoints" | "deviation" | "components";
  config: Record<string, any>;
  order: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

const CONTROL_TYPES = {
  controlpoints: [
    {
      type: "comments",
      icon: MessageSquare,
      label: "Comments",
      description: "Multi-line text input for detailed comments",
    },
    {
      type: "text",
      icon: Type,
      label: "Text",
      description: "Single line text input",
    },
    {
      type: "odometer",
      icon: Gauge,
      label: "Odometer",
      description: "Numeric input for odometer readings",
    },
    {
      type: "number",
      icon: Hash,
      label: "Number",
      description: "Numeric input field",
    },
    {
      type: "dropdown",
      icon: ChevronDown,
      label: "Dropdown",
      description: "Select from predefined options",
    },
    // {
    //   type: "checkboxes",
    //   icon: CheckSquare,
    //   label: "Checkboxes",
    //   description: "Multiple selection checkboxes",
    // },
    // {
    //   type: "radio",
    //   icon: CircleDot,
    //   label: "Radio buttons",
    //   description: "Single selection from options",
    // },
    // {
    //   type: "photo",
    //   icon: Camera,
    //   label: "Take photo",
    //   description: "Camera capture for visual documentation",
    // },
    // {
    //   type: "signature",
    //   icon: PenTool,
    //   label: "Signing",
    //   description: "Digital signature capture",
    // },
    // {
    //   type: "date",
    //   icon: CalendarIcon,
    //   label: "Date",
    //   description: "Date picker input",
    // },
    // {
    //   type: "divider",
    //   icon: Minus,
    //   label: "Section divider",
    //   description: "Visual separator between sections",
    // },
    // {
    //   type: "attendees",
    //   icon: Users,
    //   label: "Attendees",
    //   description: "Select multiple attendees/participants",
    // },
    {
      type: "calculation",
      icon: Calculator,
      label: "Calculation",
      description: "Auto-calculated field based on formula",
    },
    {
      type: "email",
      icon: Mail,
      label: "Email-title / PDF-name",
      description: "Email or document title input",
    },
    {
      type: "array",
      icon: Grid3x3,
      label: "Array questions",
      description: "Repeatable question groups",
    },
    {
      type: "worktime",
      icon: Clock,
      label: "Work time",
      description: "Time tracking and duration input",
    },
  ],
  deviation: [
    {
      type: "deviation_cause",
      icon: AlertTriangle,
      label: "Deviation cause",
      description: "Capture deviation reasons and corrective actions",
    },
  ],
  components: [
    {
      type: "comments",
      icon: MessageSquare,
      label: "Comments",
      description: "Component-specific comments",
    },
    {
      type: "dropdown",
      icon: ChevronDown,
      label: "Dropdown",
      description: "Component selection dropdown",
    },
    // {
    //   type: "radio",
    //   icon: CircleDot,
    //   label: "Radio buttons",
    //   description: "Component condition selection",
    // },
    // {
    //   type: "checkboxes",
    //   icon: CheckSquare,
    //   label: "Checkboxes",
    //   description: "Component status checkboxes",
    // },
    {
      type: "date",
      icon: CalendarIcon,
      label: "Date",
      description: "Component service/replacement date",
    },
    {
      type: "refilled",
      icon: Gauge,
      label: "Refilled",
      description: "Component refill indicator",
    },
    {
      type: "number",
      icon: Hash,
      label: "Number",
      description: "Measurement or quantity input",
    },
    // {
    //   type: "photo",
    //   icon: Camera,
    //   label: "Take photo",
    //   description: "Component condition photo",
    // },
    {
      type: "text",
      icon: Type,
      label: "Text",
      description: "Component notes or serial number",
    },
  ],
};

interface ChecklistBuilderProps {
  onSave: (template: ChecklistTemplate) => void;
  initialTemplate?: ChecklistTemplate;
  mode?: "create" | "edit" | "view";
}

export function ChecklistBuilder({
  onSave,
  initialTemplate,
  mode = "create",
}: ChecklistBuilderProps) {
  const [template, setTemplate] = useState<ChecklistTemplate>(
    initialTemplate || {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [selectedCategory, setSelectedCategory] = useState<
    "controlpoints" | "deviation" | "components"
  >("controlpoints");
  const [previewMode, setPreviewMode] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<ChecklistItem | null>(null);

  const addItem = (type: string) => {
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      category: selectedCategory,
      config: getDefaultConfig(type),
      order: template.items.length,
    };

    setTemplate((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      updatedAt: new Date().toISOString(),
    }));
  };

  const getDefaultConfig = (type: string): Record<string, any> => {
    switch (type) {
      case "dropdown":
      case "radio":
      case "checkboxes":
        return { options: ["Option 1", "Option 2", "Option 3"] };
      case "number":
      case "odometer":
        return { min: 0, max: 1000000, step: 1 };
      case "text":
      case "comments":
        return {
          placeholder: "Enter text here...",
          maxLength: type === "comments" ? 1000 : 255,
        };
      case "calculation":
        return { formula: "", inputs: [] };
      case "array":
        return { minItems: 1, maxItems: 10, template: [] };
      case "worktime":
        return { trackStart: true, trackEnd: true, autoCalculate: true };
      default:
        return {};
    }
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setTemplate((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const deleteItem = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...template.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Update order
    newItems.forEach((item, index) => {
      item.order = index;
    });

    setTemplate((prev) => ({
      ...prev,
      items: newItems,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSave = () => {
    if (!template.name.trim()) {
      alert("Please enter a template name");
      return;
    }
    onSave(template);
  };

  const isReadonly = mode === "view";

  return (
    <>
      <div className="flex h-full">
        {/* Control Palette */}
        {!isReadonly && !previewMode && (
          <div className="w-80 border p-1 bg-card">
            <div className="ml-3 mr-2">
              <h3 className="mb-2">Control Types</h3>
              <Tabs
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                {/* Tabs Header (fixed, not scrollable) */}
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="controlpoints">Controls</TabsTrigger>
                  <TabsTrigger value="deviation">Deviation</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                </TabsList>

                {/* Tabs Content */}
                {Object.entries(CONTROL_TYPES).map(([category, controls]) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    {/* 👇 Only this list has independent scroll */}
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      <div className="">
                        {controls.map((control) => {
                          const Icon = control.icon;
                          return (
                            <Card
                              key={control.type}
                              className="cursor-pointer hover:bg-accent transition-colors p-3"
                              onClick={() => addItem(control.type)}
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {control.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {control.description}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col border ml-2 mr-3">
          {/* Header */}
          <div className=" bg-card border-b p-4">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex-1 space-y-2">
                {!isReadonly ? (
                  <>
                    <Input
                      placeholder="Template Name"
                      value={template.name}
                      onChange={(e) =>
                        setTemplate((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="text-lg font-medium"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={template.description}
                      onChange={(e) =>
                        setTemplate((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="text-sm"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-medium">{template.name}</h2>
                    {template.description && (
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 space-x-2 ml-4">
                <Badge className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50">
                  {template.items.length} item
                  {template.items.length !== 1 ? "s" : ""}
                </Badge>

                {!isReadonly && (
                  <>
                    <Button
                      className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {previewMode ? "Edit" : "Preview"}
                    </Button>

                    <Button
                      className="gap-2 bg-orange-600 hover:bg-orange-700"
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Template
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Builder/Preview */}
          <div className="flex-1 p-4">
            {previewMode || isReadonly ? (
              <ChecklistPreview template={template} />
            ) : (
              <ChecklistEditor
                template={template}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
                onMoveItem={moveItem}
                onEditItem={setEditingItem}
              />
            )}
          </div>
        </div>

        {/* Item Configuration Dialog */}
        {editingItem && (
          <ItemConfigDialog
            item={editingItem}
            onSave={(updatedItem) => {
              updateItem(editingItem.id, updatedItem);
              setEditingItem(null);
            }}
            onClose={() => setEditingItem(null)}
          />
        )}
      </div>
    </>
  );
}

// Form Editor Component
function ChecklistEditor({
  template,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
  onEditItem,
}: {
  template: ChecklistTemplate;
  onUpdateItem: (id: string, updates: Partial<ChecklistItem>) => void;
  onDeleteItem: (id: string) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  onEditItem: (item: ChecklistItem) => void;
}) {
  if (template.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-center">
        <div>
          <h3 className="text-lg font-medium text-muted-foreground">
            No items added yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select control types from the left panel to build your checklist
          </p>
        </div>
      </div>
    );
  }

  const categorizedItems = template.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(categorizedItems).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">
              {category === "controlpoints" ? "Control Points" : category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <ChecklistItemEditor
                key={item.id}
                item={item}
                onUpdate={(updates) => onUpdateItem(item.id, updates)}
                onDelete={() => onDeleteItem(item.id)}
                onEdit={() => onEditItem(item)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Individual Item Editor
function ChecklistItemEditor({
  item,
  onUpdate,
  onDelete,
  onEdit,
}: {
  item: ChecklistItem;
  onUpdate: (updates: Partial<ChecklistItem>) => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const controlType = [
    ...CONTROL_TYPES.controlpoints,
    ...CONTROL_TYPES.deviation,
    ...CONTROL_TYPES.components,
  ].find((c) => c.type === item.type);

  const Icon = controlType?.icon || Type;

  return (
    <div className="flex items-center gap-2 mb-2 space-x-3 p-2 border rounded-lg bg-background">
      <Icon className="h-4 w-4 text-muted-oreground" />
      <div className="flex-1">
        <Input
          value={item.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="border-none p-2 h-auto focus-visible:ring-0"
        />
        <div className="text-xs text-muted-foreground mt-1">
          {controlType?.label} • {item.required ? "Required" : "Optional"}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Move className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Preview Component
function ChecklistPreview({ template }: { template: ChecklistTemplate }) {
  const [responses, setResponses] = useState<Record<string, any>>({});

  const updateResponse = (itemId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  };

  if (template.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-center">
        <div>
          <h3 className="text-lg font-medium text-muted-foreground">
            No items to preview
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add some controls to see the preview
          </p>
        </div>
      </div>
    );
  }

  const categorizedItems = template.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="max-w-2xl mx-auto">
      {Object.entries(categorizedItems).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">
              {category === "controlpoints" ? "Control Points" : category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-3">
            {items.map((item) => (
              <ChecklistItemPreview
                key={item.id}
                item={item}
                value={responses[item.id]}
                onChange={(value) => updateResponse(item.id, value)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Preview Item Component
function ChecklistItemPreview({
  item,
  value,
  onChange,
}: {
  item: ChecklistItem;
  value: any;
  onChange: (value: any) => void;
}) {
  const renderControl = () => {
    switch (item.type) {
      case "text":
      case "email":
        return (
          <Input
            placeholder={item.config.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "comments":
        return (
          <Textarea
            placeholder={item.config.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        );

      case "number":
      case "odometer":
        return (
          <Input
            type="number"
            min={item.config.min}
            max={item.config.max}
            step={item.config.step}
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        );

      case "dropdown":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {item.config.options?.map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <>
            {/* <RadioGroup value={value} onValueChange={onChange}>
            {item.config.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${item.id}-${index}`} />
                <Label htmlFor={`${item.id}-${index}`}>{option}</Label>
              </div>
            ))}s
          </RadioGroup> */}
          </>
        );

      case "checkboxes":
        return (
          <div className="space-y-2">
            {item.config.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                {/* <Checkbox
                  id={`${item.id}-${index}`}
                  checked={value?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(
                        currentValues.filter((v: string) => v !== option)
                      );
                    }
                  }}
                /> */}
                <Label htmlFor={`${item.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case "date":
        return (
          <>
            {/* <Popover>
             <PopoverTrigger asChild>
            <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover> */}
          </>
        );

      case "photo":
        return (
          <Button variant="outline" className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Take Photo
          </Button>
        );

      case "signature":
        return (
          <Button variant="outline" className="w-full">
            <PenTool className="mr-2 h-4 w-4" />
            Add Signature
          </Button>
        );

      case "divider":
      // return <Separator className="my-4" />;

      case "worktime":
        return (
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1">
              <Clock className="mr-2 h-4 w-4" />
              Start Time
            </Button>
            <Button variant="outline" className="flex-1">
              <Clock className="mr-2 h-4 w-4" />
              End Time
            </Button>
          </div>
        );

      default:
        return (
          <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            {item.type} control (preview not implemented)
          </div>
        );
    }
  };

  if (item.type === "divider") {
    return renderControl();
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center space-x-1">
        <span>{item.label}</span>
        {item.required && <span className="text-destructive">*</span>}
      </Label>
      {renderControl()}
    </div>
  );
}

// Item Configuration Dialog
function ItemConfigDialog({
  item,
  onSave,
  onClose,
}: {
  item: ChecklistItem;
  onSave: (item: Partial<ChecklistItem>) => void;
  onClose: () => void;
}) {
  const [config, setConfig] = useState(item);

  const handleSave = () => {
    onSave(config);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {item.type} Field</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Field Label</Label>
            <Input
              value={config.label}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, label: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* <Checkbox
              id="required"
              checked={config.required}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({ ...prev, required: !!checked }))
              }
            /> */}
            <Label htmlFor="required">Required field</Label>
          </div>

          {/* Type-specific configuration */}
          {(item.type === "dropdown" ||
            item.type === "radio" ||
            item.type === "checkboxes") && (
            <div>
              <Label>Options</Label>
              <Textarea
                value={config.config.options?.join("\n") || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      options: e.target.value.split("\n").filter(Boolean),
                    },
                  }))
                }
                placeholder="Enter each option on a new line"
                rows={4}
              />
            </div>
          )}

          {(item.type === "number" || item.type === "odometer") && (
            <>
              <div>
                <Label>Minimum Value</Label>
                <Input
                  type="number"
                  value={config.config.min || 0}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      config: { ...prev.config, min: Number(e.target.value) },
                    }))
                  }
                />
              </div>
              <div>
                <Label>Maximum Value</Label>
                <Input
                  type="number"
                  value={config.config.max || 1000000}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      config: { ...prev.config, max: Number(e.target.value) },
                    }))
                  }
                />
              </div>
            </>
          )}

          {(item.type === "text" || item.type === "comments") && (
            <div>
              <Label>Placeholder Text</Label>
              <Input
                value={config.config.placeholder || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    config: { ...prev.config, placeholder: e.target.value },
                  }))
                }
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
