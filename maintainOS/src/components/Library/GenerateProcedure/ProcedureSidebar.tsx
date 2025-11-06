import { Plus, Type, Layout, FileText } from "lucide-react";
import { useProcedureBuilder } from "./ProcedureBuilderContext";

export function ProcedureSidebar() {
  const {
    sidebarRef,
    handleAddField,
    handleAddHeading,
    handleAddSection,
  } = useProcedureBuilder();

  return (
    <div
      ref={sidebarRef}
      style={{
        position: "fixed",
        right: "24px",
        bottom: "88px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: "10px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        width: "85px",
        zIndex: 40,
      }}
    >
      <p className="text-gray-700 font-medium text-sm mb-1">New Item</p>

      <button
        onClick={handleAddField}
        className="flex flex-col items-center text-gray-800 text-sm font-medium hover:text-blue-600 transition-all mb-2"
      >
        <Plus size={20} color="#10b981" />
        <span className="mt-[2px]">Field</span>
      </button>

      <button
        onClick={handleAddHeading}
        className="flex flex-col items-center text-gray-800 text-sm font-medium hover:text-blue-600 transition-all mb-2"
      >
        <Type size={20} color="#2563eb" />
        <span className="mt-[2px]">Heading</span>
      </button>

      <button
        onClick={handleAddSection}
        className="flex flex-col items-center text-gray-800 text-sm font-medium hover:text-blue-600 transition-all mb-2"
      >
        <Layout size={20} color="#2563eb" />
        <span className="mt-[2px]">Section</span>
      </button>

      <button className="flex flex-col items-center text-gray-800 text-sm font-medium hover:text-blue-600 transition-all mb-2">
        <FileText size={20} color="#2563eb" />
        <span className="mt-[2px]">Procedure</span>
      </button>
    </div>
  );
}