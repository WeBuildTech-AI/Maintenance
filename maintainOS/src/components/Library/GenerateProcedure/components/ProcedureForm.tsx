import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import {
  Camera,
  Check,
  Trash2,
  ChevronDown,
  Plus,
  Upload,
  X,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";
import type { ConditionData } from "../types";

// --- External Libraries for Work Order Runner ---
import SignatureCanvas from "react-signature-canvas";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isValid } from "date-fns";

// ==========================================
// 1. INTERNAL RUNNER COMPONENTS
// ==========================================

// --- Inspection Check Runner ---
function InspectionCheckRunner({
  value,
  onChange,
  onSave,
}: {
  value: any;
  onChange: (val: any) => void;
  onSave?: (val: any) => void; // Explicit API trigger
}) {
  const safeValue =
    typeof value === "object" && value !== null
      ? value
      : { status: value || null, note: "", files: [] };

  const status = safeValue.status;

  const [showNote, setShowNote] = React.useState(!!safeValue.note);
  const [showFileBox, setShowFileBox] = React.useState(false);

  const colors = {
    pass: { border: "#10b981", text: "#10b981", bg: "#f0fdf4" },
    flag: { border: "#f59e0b", text: "#f59e0b", bg: "#fffbeb" },
    fail: { border: "#ef4444", text: "#ef4444", bg: "#fef2f2" },
  };

  const handleStatusClick = (newStatus: string) => {
    const newVal = { ...safeValue, status: newStatus };
    onChange(newVal); // Update UI state

    // ✅ Trigger API Save Immediately on Status Change (Button Click)
    if (onSave) onSave(newVal);

    // reset extra fields on status change logic (optional UI preference)
    if (newStatus !== "pass") {
      setShowNote(true);
      setShowFileBox(true);
    }
  };

  // ✅ Trigger API Save only when user leaves the note field (Blur)
  const handleNoteBlur = () => {
    if (onSave) onSave(safeValue);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* ----------------- TOP BUTTONS ----------------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        {["pass", "flag", "fail"].map((opt) => {
          const selected = status === opt;
          const style = colors[opt as keyof typeof colors];

          return (
            <button
              key={opt}
              onClick={() => handleStatusClick(opt)}
              style={{
                padding: "10px",
                border: `1px solid ${selected ? style.border : "#d1d5db"}`,
                borderRadius: "6px",
                background: selected ? style.bg : "white",
                color: selected ? style.text : "#374151",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {selected && <Check size={16} />}
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ----------------- FLAG UI ----------------- */}
      {status === "flag" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>
            You can upload a picture/file to show the flagged issue
          </p>

          {/* Upload Box */}
          <div
            style={{
              border: "2px dashed #60a5fa",
              background: "#eff6ff",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <Upload size={16} style={{ color: "#3b82f6", marginBottom: 8 }} />
            <div style={{ color: "#3b82f6", fontWeight: 600 }}>
              Add Pictures/Files
            </div>
          </div>

          {/* Note Box */}
          <textarea
            placeholder="Enter note"
            value={safeValue.note}
            onChange={(e) => onChange({ ...safeValue, note: e.target.value })}
            onBlur={handleNoteBlur} // ✅ Save on Blur
            style={{
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px 10px",
              minHeight: "80px",
              fontSize: "0.9rem",
            }}
          />
        </div>
      )}

      {/* ----------------- FAIL UI ----------------- */}
      {status === "fail" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>
            You can upload a picture/file to show the failure
          </p>

          {/* Upload Box */}
          <div
            style={{
              border: "2px dashed #60a5fa",
              background: "#eff6ff",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <Upload size={16} style={{ color: "#3b82f6", marginBottom: 8 }} />
            <div style={{ color: "#3b82f6", fontWeight: 600 }}>
              Add Pictures/Files
            </div>
          </div>

          {/* Note Box */}
          <textarea
            placeholder="Enter note"
            value={safeValue.note}
            onChange={(e) => onChange({ ...safeValue, note: e.target.value })}
            onBlur={handleNoteBlur} // ✅ Save on Blur
            style={{
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px 10px",
              minHeight: "80px",
              fontSize: "0.9rem",
            }}
          />
        </div>
      )}

      {/* ----------------- PASS → Dynamic Add Fields ----------------- */}
      {status === "pass" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            {/* ADD NOTES LINK */}
            <button
              style={{
                color: "#2563eb",
                fontSize: "0.9rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setShowNote(true)}
            >
              <Plus size={14} /> Add notes
            </button>

            {/* ADD PICTURES LINK */}
            <button
              style={{
                color: "#2563eb",
                fontSize: "0.9rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setShowFileBox(true)}
            >
              <Plus size={14} /> Add Pictures/Files
            </button>
          </div>

          {/* SHOW NOTE WHEN CLICKED */}
          {showNote && (
            <textarea
              placeholder="Enter note"
              value={safeValue.note}
              onChange={(e) => onChange({ ...safeValue, note: e.target.value })}
              onBlur={handleNoteBlur} // ✅ Save on Blur
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "8px 10px",
                minHeight: "80px",
                fontSize: "0.9rem",
              }}
            />
          )}

          {/* SHOW IMAGE BOX WHEN CLICKED */}
          {showFileBox && (
            <div
              style={{
                border: "2px dashed #60a5fa",
                background: "#eff6ff",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <Upload size={16} style={{ color: "#3b82f6", marginBottom: 8 }} />
              <div style={{ color: "#3b82f6", fontWeight: 600 }}>
                Add Pictures/Files
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Signature Runner ---
function SignatureRunner({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sigCanvas = useRef<any>(null); // ✅ Fixed: Initialized with null

  const handleSave = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        alert("Please provide a signature before saving.");
        return;
      }
      
      // ✅ FIX: Removed 'getTrimmedCanvas()' which causes the crash.
      // Used standard 'toDataURL()' instead.
      const dataURL = sigCanvas.current.toDataURL("image/png");
      
      onChange(dataURL);
      setIsModalOpen(false);
    }
  };

  const handleClear = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  return (
    <>
      {/* ===== OUTER SIGNATURE BLOCK ===== */}
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          width: "100%",
          padding: "40px 12px",
          border: "1px dashed #d1d5db",
          borderRadius: "6px",
          background: "#fff",
          textAlign: "center",
          color: value ? "#111827" : "#6b7280",
          fontStyle: value ? "normal" : "italic",
          cursor: "pointer",
          marginTop: "8px",
        }}
      >
        {value ? (
          <img
            src={value}
            alt="Signature"
            style={{
              maxHeight: "110px",
              width: "100%",
              objectFit: "contain",
              padding: "8px",
            }}
          />
        ) : (
          "Tap to sign"
        )}
      </div>

      {/* ===== MODAL ===== */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 999999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "600px",
              background: "white",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                Sign below:
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* SIGNATURE AREA */}
            <div
              style={{
                padding: "16px",
                background: "#f9fafb",
                minHeight: "260px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  width: "100%",
                  height: "240px",
                  overflow: "hidden",
                  cursor: "crosshair",
                }}
              >
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  backgroundColor="white"
                  canvasProps={{ style: { width: "100%", height: "240px" } }}
                />
              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div
              style={{
                padding: "14px 18px",
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                background: "white",
              }}
            >
              <button
                onClick={handleClear}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                Clear
              </button>

              <button
                onClick={handleSave}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Upload Runner ---
function UploadRunner({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ---------------- PREVIEW MODE ----------------
  if (value) {
    return (
      <div style={{ position: "relative", width: "100%", marginTop: "10px" }}>
        {/* Image preview */}
        <img
          src={value}
          alt="Uploaded preview"
          style={{
            width: "100%",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            objectFit: "cover",
          }}
        />

        {/* delete button */}
        <button
          onClick={() => onChange(null)}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(0,0,0,0.55)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(2px)",
          }}
          title="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // ---------------- UPLOAD BOX MODE ----------------
  return (
    <label
      style={{
        width: "100%",
        marginTop: "10px",
        padding: "24px",
        border: "2px dashed #007AFF",
        background: "#f0f7ff",
        borderRadius: "6px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        cursor: "pointer",
      }}
    >
      <Camera size={26} color="#007AFF" />

      <span
        style={{
          color: "#007AFF",
          fontWeight: 500,
          fontSize: "0.9rem",
        }}
      >
        Add Pictures/Files
      </span>

      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </label>
  );
}

// --- Date Runner ---
function DateRunner({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : undefined;
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date.toISOString());
      setIsCalendarOpen(false);
    }
  };

  const displayDate =
    value && isValid(new Date(value))
      ? format(new Date(value), "MM/dd/yyyy")
      : "";

  return (
    <div style={{ position: "relative", marginTop: "8px" }} ref={containerRef}>
      {/* ---------- INPUT BOX (EXACT CASE UI) ---------- */}
      <div
        onClick={() => setIsCalendarOpen(true)}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "0.9rem",
          color: displayDate ? "#111827" : "#6b7280",
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <input
          readOnly
          placeholder="mm/dd/yyyy"
          value={displayDate}
          style={{
            flex: 1,
            background: "transparent",
            outline: "none",
            border: "none",
            fontSize: "0.9rem",
            color: displayDate ? "#111827" : "#6b7280",
            cursor: "pointer",
          }}
        />

        {/* Clear button if date selected */}
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              marginRight: "6px",
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Calendar icon */}
        <CalendarIcon size={18} style={{ color: "#2563eb" }} />
      </div>

      {/* ---------- DATE PICKER ---------- */}
      {isCalendarOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "8px",
            zIndex: 999,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "8px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            styles={{
              head_cell: {
                width: "40px",
                color: "#6b7280",
                fontSize: "0.75rem",
                fontWeight: 600,
              },
              cell: { width: "40px" },
              day: { margin: "auto", borderRadius: "6px" },
              day_selected: { backgroundColor: "#2563eb", color: "white" },
              day_today: { fontWeight: "bold", color: "#2563eb" },
            }}
          />
        </div>
      )}
    </div>
  );
}

function YesNoRunner({
  value,
  onChange,
  onSave,
}: {
  value: any;
  onChange: (val: any) => void;
  onSave?: (val: any) => void;
}) {
  const safeValue =
    typeof value === "object" && value !== null
      ? value
      : { status: value || null, note: "", file: null };
  const status = safeValue.status;
  const note = safeValue.note || "";
  const file = safeValue.file || null;

  const [showNote, setShowNote] = useState(!!note);
  const [showUpload, setShowUpload] = useState(!!file);

  useEffect(() => {
    if (note) setShowNote(true);
    if (file) setShowUpload(true);
  }, [note, file]);

  const handleStatusClick = (newStatus: string) => {
    const newVal = { ...safeValue, status: newStatus };
    onChange(newVal);
    // ✅ Trigger API Save Immediately
    if (onSave) onSave(newVal);

    setShowNote(!!note);
    setShowUpload(!!file);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...safeValue, note: e.target.value });
  };

  // ✅ Trigger API Save on Blur (Note)
  const handleNoteBlur = () => {
    if (onSave) onSave(safeValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = (ev) => onChange({ ...safeValue, file: ev.target?.result });
      r.readAsDataURL(f);
    }
  };

  const removeFile = () => {
    onChange({ ...safeValue, file: null });
    setShowUpload(false);
  };

  const statusConfig: any = {
    yes: {
      label: "Yes",
      active:
        "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500",
      inactive: "bg-white border-gray-200 text-emerald-600 hover:border-emerald-300",
    },
    no: {
      label: "No",
      active: "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500",
      inactive: "bg-white border-gray-200 text-red-500 hover:border-red-300",
    },
    "n/a": {
      label: "N/A",
      active:
        "bg-gray-100 border-gray-500 text-gray-800 ring-1 ring-gray-500",
      inactive: "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {["yes", "no", "n/a"].map((key) => {
          const isActive = status === key;
          const config = statusConfig[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleStatusClick(key)}
              className={`flex items-center justify-center h-12 rounded-md border text-base font-medium transition-all duration-200 ${
                isActive ? config.active : config.inactive
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {showUpload && (
        <div className="animate-in fade-in slide-in-from-top-2 pt-1">
          {file ? (
            <div className="relative w-fit group">
              <img
                src={file}
                alt="Proof"
                className="h-32 w-auto rounded-md border border-gray-200 shadow-sm object-cover"
              />
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                type="button"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-50 transition-colors w-full h-32">
              <div className="bg-blue-500 text-white p-1.5 rounded-md mb-2 shadow-sm">
                <Upload size={16} />
              </div>
              <span className="text-sm font-medium">Add Pictures/Files</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      )}

      {showNote && (
        <div className="animate-in fade-in slide-in-from-top-2 pt-1">
          <textarea
            placeholder="Enter note"
            value={note}
            onChange={handleNoteChange}
            onBlur={handleNoteBlur} // ✅ Save on Blur
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none placeholder:text-gray-400 bg-white"
          />
        </div>
      )}

      {status && (
        <div className="flex gap-6 pt-1">
          {!showNote && (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Plus size={16} /> Add notes
            </button>
          )}
          {!showUpload && (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Plus size={16} /> Add Pictures/Files
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. MAIN PROCEDURE FORM LOGIC
// ==========================================

// --- Helper: checkCondition (Full logic - NO CHANGE) ---
function checkCondition(condition: ConditionData, parentAnswer: any): boolean {
  const op = condition.conditionOperator || condition.type;

  // --- [FIX FOR RUNNER]: Handle Object answers (Inspection Check) ---
  let valToCheck = parentAnswer;
  if (
    typeof parentAnswer === "object" &&
    parentAnswer !== null &&
    "status" in parentAnswer
  ) {
    valToCheck = parentAnswer.status;
  }

  if (valToCheck === undefined || valToCheck === null || valToCheck === "") {
    if (op === "is not checked" || op === "is_not_checked") {
      return true;
    }
    return false;
  }

  const val = condition.conditionValue || condition.value;
  const val2 = condition.conditionValue2;
  const values = condition.values;

  if (op === "is") return valToCheck === val;
  if (op === "one_of") return values?.includes(valToCheck);

  if (op === "is not") return valToCheck !== val;
  if (op === "not_one_of") return !values?.includes(valToCheck);

  if (op === "is checked" || op === "is_checked") return valToCheck === true;
  if (op === "is not checked" || op === "is_not_checked")
    return valToCheck === false;

  if (op === "contains") {
    return Array.isArray(valToCheck) && valToCheck.includes(val);
  }
  if (op === "does not contain") {
    return !Array.isArray(valToCheck) || !valToCheck.includes(val);
  }

  const numAnswer = parseFloat(valToCheck);
  const numVal = parseFloat(val || "");
  const numVal2 = parseFloat(val2 || "");
  if (isNaN(numAnswer)) return false;

  if (op === "higher than" || op === "higher_than") return numAnswer > numVal;
  if (op === "lower than" || op === "lower_than") return numAnswer < numVal;
  if (op === "equal to" || op === "equal_to") return numAnswer === numVal;
  if (op === "not equal to" || op === "not_equal_to")
    return numAnswer !== numVal;

  if (op === "between") {
    if (isNaN(numVal) || isNaN(numVal2)) return false;
    const min = Math.min(numVal, numVal2);
    const max = Math.max(numVal, numVal2);
    return numAnswer >= min && numAnswer <= max;
  }
  return false;
}

// --- Helper Components (Internal to this file) ---
interface RenderItemProps {
  item: any;
  answers: Record<string, any>;
  updateAnswer: (fieldId: string, value: any) => void;
  renderAllItems: (
    items: any[],
    allFieldsInScope: any[]
  ) => React.ReactNode[];
  allFieldsInScope: any[];
  // ✅ [ADDED]: Variant prop for passing down
  variant?: "preview" | "runner";
  // ✅ [ADDED]: Prop for saving
  onFieldSave?: (fieldId: string, value: any) => void;
}

// Renders a single interactive Field
const PreviewField = memo(function PreviewField({
  item: field,
  answers,
  updateAnswer,
  variant, // ✅ [ADDED]
  onFieldSave, // ✅ [ADDED]
}: Omit<RenderItemProps, "renderAllItems" | "allFieldsInScope">) {
  // --- Normalize Builder vs API props ---
  const fieldId = field.id.toString();
  const currentValue = answers[fieldId];
  const fieldLabel = field.fieldName || field.label;
  const fieldType = field.fieldType || field.selectedType;
  const fieldDesc = field.fieldDescription || field.description;
  const fieldOptions = field.config?.options || field.options;

  // --- [NEW] Meter reading ke liye specific data normalize karein ---
  const fieldUnit = field.config?.meterUnit || field.meterUnit;
  const meterName = field.selectedMeterName || field.config?.meterName;
  const lastReading =
    field.lastReading !== undefined
      ? field.lastReading
      : field.config?.lastReading;

  const isRequired = field.required || field.isRequired;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        updateAnswer(fieldId, loadEvent.target?.result);
        // ✅ Immediate save for image upload
        if (onFieldSave && variant === "runner") {
          onFieldSave(fieldId, loadEvent.target?.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ [ADDED] Handles saving on blur (for Text/Number inputs)
  const handleBlur = () => {
    if (onFieldSave && variant === "runner" && currentValue !== undefined) {
      onFieldSave(fieldId, currentValue);
    }
  };

  // ✅ [ADDED] Handles immediate saving (for Selectors/Buttons)
  const handleImmediateSave = (val: any) => {
    updateAnswer(fieldId, val);
    if (onFieldSave && variant === "runner") {
      onFieldSave(fieldId, val);
    }
  };

  // ✅ Special handler for complex runners (Inspection/YesNo) to save data without waiting for state update
  const handleRunnerSave = (val: any) => {
    if (onFieldSave && variant === "runner") {
      onFieldSave(fieldId, val);
    }
  };

  const renderFieldInput = () => {
    // ✅ [ADDED]: RUNNER MODE LOGIC (Work Order)
    if (variant === "runner") {
      switch (fieldType) {
        case "inspection_check":
        case "Inspection Check":
          return (
            <InspectionCheckRunner
              value={currentValue}
              onChange={(val) => updateAnswer(fieldId, val)}
              onSave={handleRunnerSave}
            />
          );
        case "signature_block":
        case "Signature Block":
          return (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {fieldLabel}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* 👇 Integration Here */}
              <SignatureRunner
                value={currentValue}
                onChange={handleImmediateSave}
              />

              {fieldDesc && (
                <p className="text-sm text-gray-500 mt-1">{fieldDesc}</p>
              )}
            </div>
          );
        case "picture_file":
        case "Picture/File Field":
          return (
            <UploadRunner
              value={currentValue}
              onChange={handleImmediateSave}
            />
          );
        case "Date":
          return (
            <DateRunner value={currentValue} onChange={handleImmediateSave} />
          );
        case "yes_no_NA":
        case "Yes, No, N/A":
          return (
            <YesNoRunner
              value={currentValue}
              onChange={(val) => updateAnswer(fieldId, val)}
              onSave={handleRunnerSave}
            />
          );

        // Interactive inputs for standard fields
        case "text_field":
        case "Text Field":
          return (
            <input
              type="text"
              value={currentValue || ""}
              onChange={(e) => updateAnswer(fieldId, e.target.value)}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Enter Text"
            />
          );
        case "number_field":
        case "Number Field":
          return (
            <input
              type="number"
              value={currentValue || ""}
              onChange={(e) => updateAnswer(fieldId, e.target.value)}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Enter Number"
            />
          );
        case "amount":
        case "Amount ($)":
          return (
            <div style={{ position: "relative" }}>
              {/* $ SIGN */}
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  fontSize: "0.9rem",
                }}
              >
                $
              </span>

              {/* INPUT BOX */}
              <input
                type="number"
                value={currentValue || ""}
                onChange={(e) => updateAnswer(fieldId, e.target.value)}
                onBlur={handleBlur}
                placeholder="Enter Amount"
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  paddingLeft: "35px", // <-- FIXED PADDING
                  fontSize: "0.9rem",
                  color: "#111827",
                }}
              />
            </div>
          );

        case "checkbox":
        case "Checkbox":
          return (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentValue === true}
                onChange={(e) => handleImmediateSave(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm">{fieldLabel}</span>
            </label>
          );
        case "mulitple_choice":
        case "Multiple Choice":
          return (
            <div className="flex flex-col gap-2">
              {fieldOptions?.map((opt: any, idx: number) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={fieldId}
                    checked={currentValue === opt}
                    onChange={() => handleImmediateSave(opt)}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          );
        case "checklist":
        case "Checklist":
          const cl = currentValue || [];
          return (
            <div className="flex flex-col gap-2">
              {fieldOptions?.map((opt: any, idx: number) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cl.includes(opt)}
                    onChange={(e) => {
                      const nl = e.target.checked
                        ? [...cl, opt]
                        : cl.filter((x: any) => x !== opt);
                      handleImmediateSave(nl);
                    }}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          );
        case "meter_reading":
        case "Meter Reading":
          return (
            <>
              <div className="mb-1 text-xs text-gray-500">
                Last: {lastReading ?? "N/A"}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={currentValue || ""}
                  onChange={(e) => updateAnswer(fieldId, e.target.value)}
                  onBlur={handleBlur}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter Reading"
                />
                <span className="absolute right-3 top-2 text-gray-400 text-xs">
                  {fieldUnit}
                </span>
              </div>
            </>
          );

        default:
          return (
            <p className="text-xs text-gray-400">
              Field type not supported in runner: {fieldType}
            </p>
          );
      }
    }

    // ✅ [EXISTING LOGIC]: Standard Preview Mode (Your original design)
    switch (fieldType) {
      case "number_field":
      case "Number Field":
        return (
          <input
            type="number"
            placeholder="Enter Number"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.9rem",
              background: "#fff",
            }}
            value={currentValue || ""}
            onChange={(e) => updateAnswer(fieldId, e.target.value)}
            disabled // Disabled in preview
          />
        );
      case "text_field":
      case "Text Field":
        return (
          <input
            type="text"
            placeholder="Enter Text"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.9rem",
              background: "#fff",
            }}
            value={currentValue || ""}
            onChange={(e) => updateAnswer(fieldId, e.target.value)}
            disabled
          />
        );

      case "amount":
      case "Amount ($)":
        return (
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              $
            </span>
            <input
              type="number"
              placeholder="Enter Amount"
              style={{
                width: "100%",
                padding: "10px 12px 10px 28px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.9rem",
                background: "#fff",
              }}
              value={currentValue || ""}
              onChange={(e) => updateAnswer(fieldId, e.target.value)}
              disabled
            />
          </div>
        );

      case "Date":
        return (
          <div style={{ position: "relative" }}>
            <input
              type="date"
              placeholder="mm/dd/yyyy"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.9rem",
                color: currentValue ? "#111827" : "#6b7280",
                background: "#fff",
              }}
              value={currentValue || ""}
              onChange={(e) => updateAnswer(fieldId, e.target.value)}
              disabled
            />
          </div>
        );

      case "meter_reading":
      case "Meter Reading":
        return (
          <>
            {/* Last Reading (View mode jaisa) */}
            {lastReading !== null && lastReading !== undefined && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Last Reading: {lastReading} {fieldUnit || ""}
              </p>
            )}
            {/* Meter Name (View mode jaisa) */}
            {meterName && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#2563eb",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                {meterName}
              </p>
            )}
            {/* Reading Input Box */}
            <div style={{ position: "relative" }}>
              <input
                type="number"
                placeholder="Enter Reading"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  background: "#fff",
                }}
                value={currentValue || ""}
                onChange={(e) => updateAnswer(fieldId, e.target.value)}
                disabled
              />
              {fieldUnit && (
                <span
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                    pointerEvents: "none",
                    fontSize: "0.9rem",
                  }}
                >
                  {fieldUnit}
                </span>
              )}
            </div>
          </>
        );

      case "signature_block":
      case "Signature Block":
        return (
          <div
            style={{
              width: "100%",
              padding: "40px 12px",
              border: "1px dashed #d1d5db",
              borderRadius: "6px",
              background: "#fff",
              textAlign: "center",
              color: "#6b7280",
              fontStyle: "italic",
              cursor: "pointer",
            }}
          >
            Tap to sign
          </div>
        );

      case "checkbox":
      case "Checkbox":
        return (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={currentValue === true}
              onChange={(e) => updateAnswer(fieldId, e.target.checked)}
              disabled
            />
            <span style={{ fontSize: "0.9rem" }}>{fieldLabel}</span>
          </label>
        );

      case "picture_file":
      case "Picture/File Field":
        if (currentValue) {
          return (
            <div style={{ position: "relative" }}>
              <img
                src={currentValue}
                alt="Upload Preview"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <button
                onClick={() => updateAnswer(fieldId, null)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }
        return (
          <label
            style={{
              width: "100%",
              padding: "24px",
              border: "2px dashed #007AFF",
              background: "#f0f7ff",
              borderRadius: "6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <Camera size={24} color="#007AFF" />
            <span
              style={{
                color: "#007AFF",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              Add Pictures/Files
            </span>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
              disabled
            />
          </label>
        );

      case "inspection_check":
      case "Inspection Check":
        const options = ["Pass", "Flag", "Fail"];
        const colors = {
          Pass: { border: "#10b981", text: "#10b981", bg: "#f0fdf4" },
          Flag: { border: "#f59e0b", text: "#f59e0b", bg: "#fffbeb" },
          Fail: { border: "#ef4444", text: "#ef4444", bg: "#fef2f2" },
        };
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            {options.map((opt) => {
              const isSelected = currentValue === opt.toLowerCase();
              const style = colors[opt as keyof typeof colors];
              return (
                <button
                  key={opt}
                  onClick={() => updateAnswer(fieldId, opt.toLowerCase())}
                  style={{
                    padding: "10px",
                    border: `1px solid ${
                      isSelected ? style.border : "#d1d5db"
                    }`,
                    borderRadius: "6px",
                    background: isSelected ? style.bg : "white",
                    color: isSelected ? style.text : "#374151",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  disabled // Disabled
                >
                  {isSelected && <Check size={16} />}
                  {opt}
                </button>
              );
            })}
          </div>
        );

      case "yes_no_NA":
      case "Yes, No, N/A":
        const ynnOptions = ["Yes", "No", "N/A"];
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
            }}
          >
            {ynnOptions.map((opt) => {
              const isSelected = currentValue === opt.toLowerCase();
              return (
                <button
                  key={opt}
                  onClick={() => updateAnswer(fieldId, opt.toLowerCase())}
                  style={{
                    padding: "10px",
                    border: `1px solid ${
                      isSelected ? "#007AFF" : "#d1d5db"
                    }`,
                    borderRadius: "6px",
                    background: isSelected ? "#f0f7ff" : "white",
                    color: isSelected ? "#007AFF" : "#374151",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                  disabled // Disabled
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );

      case "mulitple_choice":
      case "Multiple Choice":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {fieldOptions?.map((opt: string, index: number) => (
              <label
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                }}
              >
                <input
                  type="radio"
                  name={`field-${fieldId}`}
                  checked={currentValue === opt}
                  onChange={() => updateAnswer(fieldId, opt)}
                  disabled
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "checklist":
      case "Checklist":
        const currentList = currentValue || [];
        const handleChecklistChange = (opt: string, isChecked: boolean) => {
          const newList = isChecked
            ? [...currentList, opt]
            : currentList.filter((item) => item !== opt);
          updateAnswer(fieldId, newList);
        };
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {fieldOptions?.map((opt: string, index: number) => (
              <label
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={currentList.includes(opt)}
                  onChange={(e) => handleChecklistChange(opt, e.target.checked)}
                  disabled
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <p style={{ fontStyle: "italic", color: "#6b7280" }}>
            Preview not available for '{fieldType}'
          </p>
        );
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      {fieldType === "Checkbox" || fieldType === "checkbox" ? (
        <div className="p-0">{renderFieldInput()}</div>
      ) : (
        <>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            {fieldLabel}
            {isRequired && (
              <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
            )}
          </label>
          {fieldDesc && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                marginTop: "-4px",
                marginBottom: "8px",
              }}
            >
              {fieldDesc}
            </p>
          )}
          <div>{renderFieldInput()}</div>
        </>
      )}
    </div>
  );
});

// Renders a Section (with collapse)
const PreviewSection = memo(function PreviewSection({
  item: section,
  variant, // ✅ [ADDED]
  onFieldSave, // ✅ [ADDED]
  ...props
}: RenderItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sectionFields = section.fields || [];
  const sectionHeadings = section.headings || [];
  const combinedSectionItems = [...sectionFields, ...sectionHeadings].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const fieldCount = sectionFields.length;
  const sectionLabel = section.sectionName || section.label;

  return (
    <div className="pb-4">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full bg-none cursor-pointer text-left border-none p-0 mb-4"
      >
        <ChevronDown
          size={20}
          className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
        />
        <span className="text-lg font-semibold text-gray-900">
          {sectionLabel}
        </span>
      </button>

      {isCollapsed ? (
        <div className="pl-7 text-gray-500 text-sm">
          {fieldCount} field{fieldCount !== 1 ? "s" : ""} collapsed
        </div>
      ) : (
        <div className="pl-7 flex flex-col gap-6">
          {props.renderAllItems(combinedSectionItems, props.allFieldsInScope)}
        </div>
      )}
    </div>
  );
});

// Component to decide what to render
const RenderPreviewItem = memo(function RenderPreviewItem(
  props: RenderItemProps
) {
  const { item } = props;

  // Normalize blockType
  let blockType = item.blockType;
  if (!blockType) {
    if (item.sectionName) blockType = "section";
    else if (item.text || item.fieldType === "heading") blockType = "heading";
    else blockType = "field";
  }

  switch (blockType) {
    case "field":
      return <PreviewField {...props} />;
    case "section":
      return <PreviewSection {...props} />;
    case "heading":
      return (
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#111827",
            marginTop: "16px",
            paddingBottom: "8px",
          }}
        >
          {item.text || item.label || item.fieldName}
        </h3>
      );
    default:
      return null;
  }
});

// --- Main Reusable Component ---
interface ProcedureFormProps {
  rootFields: any[];
  rootHeadings: any[];
  sections: any[];
  resetKey?: string;
  onAnswersChange?: (answers: Record<string, any>) => void;
  variant?: "preview" | "runner";
  onFieldSave?: (fieldId: string, value: any) => void;
  initialAnswers?: Record<string, any>;
  alwaysShowConditionalFields?: boolean;
  showConditionLabel?: boolean; // ✅ [ADDED]
}

export function ProcedureForm({
  rootFields,
  rootHeadings,
  sections,
  resetKey,
  onAnswersChange,
  variant = "preview",
  onFieldSave,
  initialAnswers = {},
  alwaysShowConditionalFields = false,
  showConditionLabel = false, // ✅ [ADDED]
}: ProcedureFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);

  // --- ✅ 1. Sync Initial Answers when they load ---
  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      console.log("📥 Loading saved answers into form:", initialAnswers);
      setAnswers((prev) => ({
        ...prev,
        ...initialAnswers,
      }));
    }
  }, [initialAnswers]);

  // --- Reset answers when procedure ID changes ---
  useEffect(() => {
    if (resetKey) {
        setAnswers(initialAnswers || {});
    }
  }, [resetKey]);

  const updateAnswer = useCallback(
    (fieldId: string, value: any) => {
      setAnswers((prev) => {
        const next = { ...prev, [fieldId]: value };
        if (onAnswersChange) onAnswersChange(next);
        return next;
      });
    },
    [onAnswersChange]
  );

  // --- RECURSIVE RENDER FUNCTION ---
  const renderAllItems = useCallback(
    (items: any[], allFieldsInScope: any[]): React.ReactNode[] => {
      
      const renderRecursive = (currentItem: any): React.ReactNode => {
        // 1. Render the current item
        const node = (
          <RenderPreviewItem
            key={currentItem.id}
            item={currentItem}
            answers={answers}
            updateAnswer={updateAnswer}
            renderAllItems={renderAllItems}
            allFieldsInScope={allFieldsInScope}
            variant={variant}
            onFieldSave={onFieldSave}
          />
        );

        // 2. Find DIRECT children of this item
        const children = allFieldsInScope.filter((c) => c.parentId === currentItem.id);

        // 3. If no children, return just the node
        if (children.length === 0) {
           return node;
        }

        // 4. If children exist, render them recursively (wrapped in logic)
        return (
          <div key={currentItem.id} className="flex flex-col gap-2">
            {node}
            {children.map((child) => {
              const isMet = checkCondition(
                child.condition,
                answers[currentItem.id.toString()]
              );
              
              const shouldRender = isMet || alwaysShowConditionalFields;

              if (shouldRender) {
                 return (
                  <div
                    key={child.id}
                    className="pl-6 border-l-2 border-blue-100 ml-2 animate-in fade-in slide-in-from-left-2 mt-2"
                  >
                    {/* Optional: Show Condition Label in 'Structure View' mode OR if explicitly requested */}
                    {(alwaysShowConditionalFields || showConditionLabel) && (
                      <div className="text-xs text-blue-500 mb-1 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded">
                        Condition: {(child.condition?.conditionOperator || (child.condition as any)?.type)?.replace(/_/g, " ")} {child.condition?.conditionValue || (child.condition as any)?.value}
                      </div>
                    )}
                    
                    {renderRecursive(child)}
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      };

      // Only process items that are ROOTS in the current context (no parent OR parent is not in this list)
      // Note: In a section, 'items' might be just the section fields. We treat those as roots relative to the section if they have no parent.
      const roots = items.filter((f) => !f.parentId); // Simple check: If it has a parent, it's a child.
      
      return roots.map(renderRecursive);
    },
    [answers, updateAnswer, variant, onFieldSave, alwaysShowConditionalFields, showConditionLabel]
  );

  const combinedRootItems = [...(rootFields || []), ...(rootHeadings || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const allRootFieldsForLogic = rootFields || [];

  return (
    <div className="flex flex-col gap-6">
      {renderAllItems(combinedRootItems, allRootFieldsForLogic)}

      {/* Render Sections */}
      {sections.map((section: any) => (
        <RenderPreviewItem
          key={section.id}
          item={{ ...section, blockType: "section" }} // Pass section as an item
          answers={answers}
          updateAnswer={updateAnswer}
          renderAllItems={renderAllItems}
          allFieldsInScope={section.fields || []} // Pass section's fields
          variant={variant} // ✅ [ADDED] Pass variant down
          onFieldSave={onFieldSave} // ✅ [ADDED] Pass callback down
        />
      ))}
    </div>
  );
}