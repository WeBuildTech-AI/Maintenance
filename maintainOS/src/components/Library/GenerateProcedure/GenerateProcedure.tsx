import { useState, useEffect } from "react";
import { Plus, Rocket, Loader2 } from "lucide-react"; 
import CreateProcedureModal from "./CreateProcedureModal";
import ProcedureBuilder from "./ProcedureBuilder";
import { ProcedureBuilderProvider } from "./ProcedureBuilderContext"; 

import { procedureService } from "../../../store/procedures/procedures.service";
import { convertJSONToState } from "./utils/conversion"; 
import type { FieldData, ProcedureSettingsState } from "./types";

export default function GenerateProcedure({ 
  onBack, 
  editingProcedureId 
}: { 
  onBack: () => void,
  editingProcedureId: string | null; 
}) {
  const [openModal, setOpenModal] = useState(false);
  const [builderData, setBuilderData] = useState<{ name: string; desc: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [prefetchedData, setPrefetchedData] = useState<{
    fields: FieldData[];
    settings: ProcedureSettingsState;
    name: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    document.body.style.overflow = openModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openModal]);
  
  // --- DATA FETCHING ---
  useEffect(() => {
    if (editingProcedureId) {
      const fetchAndConvertData = async () => {
        setIsLoading(true);
        try {
          const apiData = await procedureService.fetchProcedureById(editingProcedureId);
          console.log("Fetched API data for edit:", apiData);
          
          // @ts-ignore 
          const convertedState = convertJSONToState(apiData); 
          
          setPrefetchedData({
            ...convertedState,
            name: apiData.title,
            description: apiData.description || "",
          });
          
        } catch (error) {
          console.error("Failed to fetch procedure for editing:", error);
          alert("Failed to load procedure for editing.");
          onBack(); 
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAndConvertData();
    }
    // ✅ CRITICAL FIX: Removed 'onBack' from dependencies. 
    // This prevents infinite refetching loops if the parent component re-renders.
  }, [editingProcedureId]); 
  
  
  // --- RENDER ---

  // 1. Edit Mode (Loading)
  if (editingProcedureId && isLoading) {
    return (
      <div style={{ height: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <Loader2 size={24} className="animate-spin" />
        <span style={{ fontSize: "1.2rem", color: "#6b7280" }}>Loading Procedure...</span>
      </div>
    );
  }

  // 2. Edit Mode (Data Loaded)
  if (editingProcedureId && prefetchedData) {
    return (
      <ProcedureBuilderProvider
        name={prefetchedData.name}
        description={prefetchedData.description}
        initialState={prefetchedData} 
      >
        <ProcedureBuilder
          name={prefetchedData.name}
          description={prefetchedData.description}
          onBack={onBack} 
          editingProcedureId={editingProcedureId} 
        />
      </ProcedureBuilderProvider>
    );
  }

  // 3. Create Mode (Modal ke baad)
  if (!editingProcedureId && builderData) {
    return (
      <ProcedureBuilderProvider
        name={builderData.name}
        description={builderData.desc}
      >
        <ProcedureBuilder
          name={builderData.name}
          description={builderData.desc}
          onBack={() => {
            setBuilderData(null); 
            onBack(); 
          }}
          editingProcedureId={null} 
        />
      </ProcedureBuilderProvider>
    );
  }
  
  // 4. Create Mode (Initial view - Modal dikhayein)
  if (!editingProcedureId) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "700px",
          }}
        >
          {/* Create from blank */}
          <div
            onClick={() => setOpenModal(true)}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              backgroundColor: "#fff",
              padding: "32px",
              textAlign: "center",
              transition: "all 0.3s ease",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
            }}
          >
            <Plus size={28} color="#4b5563" style={{ marginBottom: "12px" }} />
            <h3
              style={{
                fontWeight: 600,
                color: "#111827",
                marginBottom: "6px",
                fontSize: "1.1rem",
              }}
            >
              Create from blank
            </h3>
            <p style={{ color: "#6b7280", fontSize: "15px" }}>
              Write your procedure from scratch
            </p>
          </div>

          {/* Use a template */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              backgroundColor: "#fff",
              padding: "32px",
              textAlign: "center",
              transition: "all 0.3s ease",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 6px 14px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
            }}
          >
            <Rocket size={28} color="#ec4899" style={{ marginBottom: "12px" }} />
            <h3
              style={{
                fontWeight: 600,
                color: "#111827",
                marginBottom: "6px",
                fontSize: "1.1rem",
              }}
            >
              Use a template
            </h3>
            <p style={{ color: "#6b7280", fontSize: "15px" }}>
              Search the Procedure Hub
            </p>
          </div>
        </div>

        {/* Modal */}
        <CreateProcedureModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onNext={(name, desc) => {
            setBuilderData({ name, desc });
            setOpenModal(false);
          }}
        />
      </div>
    );
  }

  return null;
}