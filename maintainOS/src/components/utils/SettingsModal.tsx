import React, { useState, useEffect, useRef } from "react";
import { X, Plus, GripVertical, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";

// --- DND-KIT IMPORTS (No Change) ---
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Custom Dropdown Component 1: "Add Column" (No Change) ---
interface CustomColumnSelectProps {
  options: string[];
  onSelect: (option: string) => void;
}

const CustomColumnSelect: React.FC<CustomColumnSelectProps> = ({
  options,
  onSelect,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  const handleSelectOption = (option: string) => {
    onSelect(option);
    setIsPopoverOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          padding: "8px 12px",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={16} style={{ color: "#6b7280" }} />
          <span style={{ color: "#111827", fontSize: "14px" }}>
            Add column...
          </span>
        </span>
        <ChevronDown
          size={16}
          style={{
            color: "#6b7280",
            transition: "transform 0.2s",
            transform: isPopoverOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {isPopoverOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: "100%",
            marginTop: "4px",
            width: "100%",
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 10,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelectOption(option)}
              style={{
                padding: "10px 12px",
                fontSize: "14px",
                color: "#374151",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f9fafb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff")
              }
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- (NEW) Custom Dropdown Component 2: "Single Select" (No Change) ---
interface CustomSingleSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const CustomSingleSelect: React.FC<CustomSingleSelectProps> = ({
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Click outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger Button - shows the selected value */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          padding: "8px 12px",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <span style={{ color: "#111827", fontSize: "14px" }}>
          {value}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: "#6b7280",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Popover/Modal */}
      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: "100%",
            marginTop: "4px",
            width: "100%",
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 10,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              style={{
                padding: "10px 12px",
                fontSize: "14px",
                color: option === value ? "#2563eb" : "#374151",
                fontWeight: option === value ? 600 : 400,
                backgroundColor: option === value ? "#f3f4f6" : "#fff",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (option !== value)
                  e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                if (option !== value)
                  e.currentTarget.style.backgroundColor = "#fff";
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// --- (End of) Custom Single Select ---


// --- Custom Toggle Component (No Change) ---
interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CustomToggle: React.FC<CustomToggleProps> = ({ checked, onChange }) => {
  const activeColor = "#2DD4BF";
  const inactiveColor = "#E5E7EB";
  const knobColor = "#FFFFFF";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        cursor: "pointer",
        flexShrink: 0,
      }}
      onClick={() => onChange(!checked)}
    >
      <input
        type="checkbox"
        checked={checked}
        readOnly
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <div
        style={{
          width: "32px",
          height: "18px",
          borderRadius: "9999px",
          backgroundColor: checked ? activeColor : inactiveColor,
          transition: "background-color 0.2s ease-in-out",
          padding: "2px",
          boxSizing: "content-box",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: knobColor,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease-in-out",
            transform: checked ? "translateX(14px)" : "translateX(0px)",
          }}
        />
      </div>
    </div>
  );
};

// --- Sortable Item Component (No Change) ---
interface SortableColumnItemProps {
  id: string;
  onRemove: (id: string) => void;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({ id, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <button 
        {...attributes} 
        {...listeners}
        style={{ background: 'none', border: 'none', cursor: 'grab' }}
      >
        <GripVertical size={16} color="#9ca3af" />
      </button>
      <span
        style={{
          color: "#374151",
          fontSize: "14px",
          flexGrow: 1,
        }}
      >
        {id}
      </span>
      <button
        onClick={() => onRemove(id)}
        style={{
          background: "none",
          border: "none",
          color: "#9ca3af",
          cursor: "pointer",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

// --- Main SettingsModal Component ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (settings: {
    resultsPerPage: number;
    showDeleted: boolean;
    sortColumn: string;
    visibleColumns: string[];
  }) => void;
  allToggleableColumns: string[];
  currentVisibleColumns: string[];
  // --- (NEW) Naya prop add karein ---
  currentShowDeleted: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onApply,
  allToggleableColumns,
  currentVisibleColumns,
  // --- (NEW) Prop ko yahaan read karein ---
  currentShowDeleted,
}) => {
  const [resultsPerPage, setResultsPerPage] = useState(25);
  // --- (NEW) State ko 'currentShowDeleted' prop se initialize karein ---
  const [showDeleted, setShowDeleted] = useState(currentShowDeleted);
  const [sortColumn, setSortColumn] = useState("Last updated");
  const [tempVisibleColumns, setTempVisibleColumns] =
    useState<string[]>(currentVisibleColumns);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    if (isOpen) {
      // Jab modal khule, parent ki current state se sync karein
      setTempVisibleColumns(currentVisibleColumns);
      // --- (NEW) 'showDeleted' state ko bhi sync karein ---
      setShowDeleted(currentShowDeleted);
      
      if (currentVisibleColumns.length > 0) {
        setSortColumn("Title");
      }
    }
    // --- (NEW) 'currentShowDeleted' ko dependency mein add karein ---
  }, [isOpen, currentVisibleColumns, currentShowDeleted]);

  if (!isOpen) return null;

  const selectedColumns = tempVisibleColumns;
  const availableColumns = allToggleableColumns.filter(
    (col) => !selectedColumns.includes(col)
  );
  
  const sortColumnOptions = ["Title", ...allToggleableColumns];

  const handleRemoveColumn = (columnName: string) => {
    setTempVisibleColumns((prev) =>
      prev.filter((col) => col !== columnName)
    );
  };

  const handleAddColumn = (newColumn: string) => {
    if (newColumn && !selectedColumns.includes(newColumn)) {
      setTempVisibleColumns((prev) => [...prev, newColumn]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTempVisibleColumns((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: "320px",
        zIndex: 1000,
        backgroundColor: "#fff",
        boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
        borderLeft: "1px solid #e5e7eb",
        overflowY: "auto",
        transition: "transform 0.3s ease-out",
        transform: "translateX(0%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header (No Change) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          Settings
        </h2>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "6px",
          }}
        >
          <X style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        </button>
      </div>

      {/* Content (Scrollable) (No Change) */}
      <div style={{ padding: "22px 20px", flexGrow: 1, overflowY: "auto" }}>
        {/* Results per page (No change) */}
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              fontWeight: 600,
              marginBottom: "10px",
              color: "#374151",
            }}
          >
            Results per page
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[25, 50, 100, 200].map((num) => (
              <button
                key={num}
                onClick={() => setResultsPerPage(num)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border:
                    resultsPerPage === num
                      ? "1px solid #2563eb"
                      : "1px solid #d1d5db",
                  background: resultsPerPage === num ? "#2563eb" : "#ffffff",
                  color: resultsPerPage === num ? "#fff" : "#374151",
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Options (No Change) */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontWeight: 600,
              marginBottom: "12px",
              color: "#374151",
            }}
          >
            Options
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center", 
              gap: "10px",
              minHeight: "22px",
            }}
          >
            <CustomToggle
              checked={showDeleted}
              onChange={(v) => setShowDeleted(v)}
            />
            <span 
              style={{ 
                color: "#374151", 
                fontSize: "14px", 
                fontWeight: 500,
                cursor: "pointer"
              }}
              onClick={() => setShowDeleted(!showDeleted)}
            >
              Show only deleted procedures
            </span>
          </div>
        </div>

        {/* Column options (No Change) */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontWeight: 600,
              marginBottom: "12px",
              color: "#374151",
            }}
          >
            Column options
          </p>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#f3f4f6",
                }}
              >
                <GripVertical size={16} color="#9ca3af" style={{ opacity: 0.5 }} />
                <span
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    fontWeight: 500,
                    flexGrow: 1,
                  }}
                >
                  Title (Locked)
                </span>
              </div>
              
              <SortableContext
                items={selectedColumns}
                strategy={verticalListSortingStrategy}
              >
                {selectedColumns.map((colName) => (
                  <SortableColumnItem
                    key={colName}
                    id={colName}
                    onRemove={handleRemoveColumn}
                  />
                ))}
              </SortableContext>
              
              {availableColumns.length > 0 && (
                <CustomColumnSelect
                  options={availableColumns}
                  onSelect={handleAddColumn}
                />
              )}
            </div>
          </DndContext>
        </div>

        {/* --- Default sort column (No Change) --- */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontWeight: 600,
              marginBottom: "12px",
              color: "#374151",
            }}
          >
            Default sort column
          </p>
          <CustomSingleSelect
            value={sortColumn}
            onChange={setSortColumn}
            options={sortColumnOptions}
          />
        </div>
      </div>

      {/* Apply button (Fixed Footer) (No Change) */}
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          padding: "18px 20px",
          flexShrink: 0,
        }}
      >
        <Button
          className="w-full"
          style={{
            width: "100%",
            backgroundColor: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            padding: "10px 0",
            borderRadius: "8px",
            fontSize: "15px",
            boxShadow: "0 3px 8px rgba(37,99,235,0.25)",
          }}
          onClick={() =>
            onApply({
              resultsPerPage,
              showDeleted,
              sortColumn,
              visibleColumns: tempVisibleColumns,
            })
          }
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

export default SettingsModal;