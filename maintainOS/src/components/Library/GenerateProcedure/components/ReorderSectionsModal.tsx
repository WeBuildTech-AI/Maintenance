import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { SortableSectionItem } from "./SortableSectionItem";
import { Layout } from "lucide-react";

export function ReorderSectionsModal() {
  const { fields, isReorderModalOpen, setIsReorderModalOpen, handleDragEnd } =
    useProcedureBuilder();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isReorderModalOpen) {
    return null;
  }

  // Filter to get only top-level sections
  const sections = fields.filter((f) => f.blockType === "section");

  return (
    // Modal Backdrop
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={() => setIsReorderModalOpen(false)}
    >
      {/* Modal Content */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          width: "500px",
          maxWidth: "90%",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Reorder Sections
          </h2>
        </div>

        {/* Body (Draggable List) */}
        <div style={{ padding: "24px", minHeight: "200px" }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sections.map((section) => (
                  <SortableSectionItem key={section.id} id={section.id}>
                    <Layout size={20} style={{ color: "#6b7280" }} />
                    <span style={{ color: "#111827", fontWeight: 500 }}>
                      {section.label}
                    </span>
                  </SortableSectionItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => setIsReorderModalOpen(false)}
            style={{
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}