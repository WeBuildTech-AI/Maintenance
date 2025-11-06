import { useProcedureBuilder } from "./ProcedureBuilderContext"; 
import {type ProcedureBodyProps } from "./types";
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


export default function ProcedureBody({ name, description }: ProcedureBodyProps) {
  const {
    fields,
    handleFieldDragStart,
    handleFieldDragOver, 
    handleFieldDragEnd,
    activeField,
    setActiveContainerId, 
    overContainerId, 
  } = useProcedureBuilder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require moving 8px to start drag
      },
    })
  );

  // --- LOGIC for highlighting drop zone ---
  const isDragging = !!activeField;
  const isOverRoot = overContainerId === 'root';
  // Any field can be dropped on root
  const canDropOnRoot = isDragging;
  // --- END LOGIC ---

  return (
    // --- WRAPPED IN DND CONTEXT ---
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleFieldDragStart}
      onDragOver={handleFieldDragOver} 
      onDragEnd={handleFieldDragEnd}
    >
      <div className="relative flex w-full"> 
        
        <div
          className="flex-1 flex justify-center items-start"
        >
          <div 
            className={`flex-1 max-w-2xl rounded-lg shadow-sm p-10 transition-colors ${
              canDropOnRoot && isOverRoot ? 'bg-yellow-50' : 'bg-white'
            }`}
            onClick={() => setActiveContainerId('root')}
          >
            <h2 className="text-2xl font-semibold mb-1">{name}</h2>
            <p className="text-gray-500 mb-6">{description}</p>

            <SortableContext
              id="root" 
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <ProcedureBlock
                  key={field.id}
                  field={field}
                  index={index}
                  isNested={false}
                />
              ))}
            </SortableContext>
          </div>
        </div>

        <ProcedureSidebar />

        <ReorderSectionsModal />
        
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