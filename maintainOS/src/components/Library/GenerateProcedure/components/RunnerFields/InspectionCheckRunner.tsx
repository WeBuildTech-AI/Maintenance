import React, { useState, useEffect } from "react";
import { Upload, Plus, X } from "lucide-react";

interface InspectionCheckRunnerProps {
  value: any;
  onChange: (val: any) => void;
}

export function InspectionCheckRunner({ value, onChange }: InspectionCheckRunnerProps) {
  const safeVal = typeof value === 'object' && value !== null ? value : { status: value || null, note: '', file: null };
  const status = safeVal.status;
  const note = safeVal.note || "";
  const file = safeVal.file || null;

  const [showNote, setShowNote] = useState(!!note);
  const [showUpload, setShowUpload] = useState(!!file);

  useEffect(() => {
    if (note) setShowNote(true);
    if (file) setShowUpload(true);
  }, [note, file]);

  const handleStatusClick = (newStatus: string) => {
    onChange({ ...safeVal, status: newStatus });
    if (newStatus === 'flag') {
      setShowNote(true);
      setShowUpload(true);
    } else {
      setShowNote(!!note);
      setShowUpload(!!file);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...safeVal, note: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = ev => onChange({ ...safeVal, file: ev.target?.result });
      r.readAsDataURL(f);
    }
  };

  const removeFile = () => {
    onChange({ ...safeVal, file: null });
    if (status !== 'flag') setShowUpload(false);
  };

  const statusConfig: any = {
    pass: { label: "Pass", active: "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500", inactive: "bg-white border-gray-200 text-emerald-600 hover:bg-emerald-50" },
    flag: { label: "Flag", active: "bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500", inactive: "bg-white border-gray-200 text-orange-500 hover:bg-orange-50" },
    fail: { label: "Fail", active: "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500", inactive: "bg-white border-gray-200 text-red-500 hover:bg-red-50" },
  };

  const isNoteVisible = status === 'flag' || showNote;
  const isUploadVisible = status === 'flag' || showUpload;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {["pass", "flag", "fail"].map((key) => {
          const isActive = status === key;
          const config = statusConfig[key];
          return (
            <button
              key={key}
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

      {isUploadVisible && (
        <div className="animate-in fade-in slide-in-from-top-2 pt-1">
           {status === 'flag' && <p className="text-sm text-gray-600 mb-2">You can upload a picture/file to show the flagged issue</p>}
           {file ? (
              <div className="relative w-fit group">
                <img src={file} alt="Proof" className="h-32 w-auto rounded-md border shadow-sm object-cover" />
                <button onClick={removeFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"><X size={12}/></button>
              </div>
           ) : (
              <label className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-50 transition-colors w-full">
                <div className="bg-blue-500 text-white p-1.5 rounded-md mb-2 shadow-sm"><Upload size={16} /></div>
                <span className="text-sm font-medium">Add Pictures/Files</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
           )}
        </div>
      )}

      {isNoteVisible && (
        <div className="animate-in fade-in slide-in-from-top-2 pt-1">
          <textarea
            placeholder="Enter note"
            value={note}
            onChange={handleNoteChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none placeholder:text-gray-400 bg-white"
          />
        </div>
      )}

      {(status === "pass" || status === "fail") && (
        <div className="flex gap-6 pt-1">
          {!showNote && (
            <button onClick={() => setShowNote(true)} className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium transition-colors">
              <Plus size={14} /> Add notes
            </button>
          )}
          {!showUpload && (
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium transition-colors">
              <Plus size={14} /> Add Pictures/Files
            </button>
          )}
        </div>
      )}
    </div>
  );
}