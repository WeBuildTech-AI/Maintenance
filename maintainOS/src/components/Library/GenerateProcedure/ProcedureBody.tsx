import { ProcedureBuilderProvider, useProcedureBuilder } from "./ProcedureBuilderContext";
import { type ProcedureBodyProps } from "./types";
import { ProcedureSidebar } from "./ProcedureSidebar";
import { ProcedureBlock } from "./components/ProcedureBlock";
import { ReorderSectionsModal } from "./components/ReorderSectionsModal"; // <-- ADDED

// This is the inner component that consumes the context
function ProcedureBodyContent({ name, description }: ProcedureBodyProps) {
  const { fields } = useProcedureBuilder();

  return (
    <div className="relative flex flex-1 bg-gray-50 ">
      <div
        className="flex-1 overflow-y-auto px-8 py-8 flex justify-center items-start w-screen "
        style={{ marginRight: "90px" }}
      >
        <div className="flex-1 max-w-3xl bg-white rounded-lg shadow-sm p-10 self-start">
          <h2 className="text-2xl font-semibold mb-1">{name}</h2>
          <p className="text-gray-500 mb-6">{description}</p>

          {fields.map((field, index) => (
            <ProcedureBlock key={field.id} field={field} index={index} />
          ))}
        </div>
      </div>

      <ProcedureSidebar />
      
      {/* --- ADDED MODAL --- */}
      <ReorderSectionsModal />
    </div>
  );
}

// This is the main export that wraps everything in the Provider
export default function ProcedureBody(props: ProcedureBodyProps) {
  return (
    <ProcedureBuilderProvider>
      <ProcedureBodyContent {...props} />
    </ProcedureBuilderProvider>
  );
}