import { useProcedureBuilder } from "./ProcedureBuilderContext";
import { type ProcedureBodyProps } from "./types";
import { ProcedureSidebar } from "./ProcedureSidebar";
import { ProcedureBlock } from "./components/ProcedureBlock";
import { ReorderSectionsModal } from "./components/ReorderSectionsModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AddLinkModal } from "./components/AddLinkModal";
import { Link2, Trash2 } from "lucide-react";

export default function ProcedureBody({ name, description }: ProcedureBodyProps) {
  const {
    fields,
    handleFieldDragStart,
    handleFieldDragOver,
    handleFieldDragEnd,
    activeField,
    setActiveContainerId,
    overContainerId,
    isLinkModalOpen,
    setIsLinkModalOpen,
    handleFieldPropChange,
    linkModalRef,
    // --- 🐞 YEH ADD KIYA HAI ---
    findFieldRecursive,
    // --- END ---
  } = useProcedureBuilder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require moving 8px to start drag
      },
    })
  );

  // --- 🐞 YEH FUNCTION UPDATE KIYA GAYA HAI (Array mein add karne ke liye) ---
  const handleSaveLink = (url: string, text: string) => {
    if (isLinkModalOpen.fieldId) {
      // 1. Field dhoondein
      const field = findFieldRecursive(fields, isLinkModalOpen.fieldId);
      if (!field) return;

      // 2. Naya link banayein
      const newLink = { id: Date.now().toString(), url, text };

      // 3. Puraane links ke saath naya link jod dein
      const newLinks = [...(field.links || []), newLink];

      // 4. Poora array state mein save karein
      handleFieldPropChange(isLinkModalOpen.fieldId, "links", newLinks);
      setIsLinkModalOpen({ fieldId: null });
    }
  };
  // --- END UPDATE ---

  const isDragging = !!activeField;
  const isOverRoot = overContainerId === "root";
  const canDropOnRoot = isDragging;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleFieldDragStart}
      onDragOver={handleFieldDragOver}
      onDragEnd={handleFieldDragEnd}
    >
      <div className="relative flex w-full">
        <div className="flex-1 flex justify-center items-start">
          <div
            className={`flex-1 max-w-2xl rounded-lg shadow-sm p-10 transition-colors ${
              canDropOnRoot && isOverRoot ? "bg-yellow-50" : "bg-white"
            }`}
            onClick={() => setActiveContainerId("root")}
          >
            <h2 className="text-2xl font-semibold mb-1">{name}</h2>
            <p className="text-gray-500 mb-6">{description}</p>

            {fields.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                Select new items from the toolbar to start adding to your
                Procedure
              </div>
            ) : (
              <SortableContext
                id="root"
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {/* CHANGED: Added 'flex flex-col gap-6' for better spacing between root fields */}
                <div className="flex flex-col gap-6">
                  {fields.map((field, index) => (
                    <ProcedureBlock
                      key={field.id}
                      field={field}
                      index={index}
                      isNested={false}
                      containerId="root"
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </div>

        <ProcedureSidebar />

        <ReorderSectionsModal />

        <AddLinkModal
          ref={linkModalRef}
          isOpen={!!isLinkModalOpen.fieldId}
          onClose={() => setIsLinkModalOpen({ fieldId: null })}
          onSave={handleSaveLink}
        />

        <DragOverlay>
          {activeField ? (
            <div className="flex-1 max-w-2xl">
              <ProcedureBlock
                field={activeField}
                index={0}
                isNested={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}