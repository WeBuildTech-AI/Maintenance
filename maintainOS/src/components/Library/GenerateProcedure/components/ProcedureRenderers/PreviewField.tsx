import React, { memo } from "react";
import { Camera, Check, Trash2, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { InspectionCheckRunner } from "../RunnerFields/InspectionCheckRunner";
import { SignatureRunner } from "../RunnerFields/SignatureRunner";
import { UploadRunner } from "../RunnerFields/UploadRunner";
import { DateRunner } from "../RunnerFields/DateRunner";
import type { RenderItemProps } from "../ProcedureFormTypes";

export const PreviewField = memo(function PreviewField({
  item: field,
  answers,
  updateAnswer,
  variant
}: Omit<RenderItemProps, "renderAllItems" | "allFieldsInScope">) {
  
  const fieldId = field.id.toString(); 
  const currentValue = answers[fieldId];
  const fieldLabel = field.fieldName || field.label;
  const fieldType = field.fieldType || field.selectedType;
  const fieldDesc = field.fieldDescription || field.description;
  const fieldOptions = field.config?.options || field.options;
  
  const fieldUnit = field.config?.meterUnit || field.meterUnit;
  const meterName = field.selectedMeterName || field.config?.meterName;
  const lastReading = field.lastReading !== undefined ? field.lastReading : field.config?.lastReading;

  const isRequired = field.required || field.isRequired;

  // --- A. STANDARD RENDERER (For Library/Builder) ---
  const renderStandardInput = () => {
    switch (fieldType) {
      case "text_field": case "Text Field": return <input type="text" placeholder="Enter Text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" disabled />;
      case "number_field": case "Number Field": return <input type="number" placeholder="Enter Number" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" disabled />;
      case "amount": case "Amount ($)": return <div style={{ position: "relative" }}><span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "0.9rem" }}>$</span><input type="number" placeholder="Enter Amount" style={{ width: "100%", padding: "10px 12px 10px 28px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", background: "#fff" }} disabled /></div>;
      case "inspection_check": case "Inspection Check": return <div className="flex gap-2">{["Pass", "Flag", "Fail"].map(opt => <div key={opt} className="flex-1 py-2 border rounded text-center text-sm bg-gray-50 text-gray-500">{opt}</div>)}</div>;
      case "yes_no_NA": case "Yes, No, N/A": return <div className="flex gap-2">{["Yes", "No", "N/A"].map(opt => <div key={opt} className="flex-1 py-2 border rounded text-center text-sm bg-gray-50 text-gray-500">{opt}</div>)}</div>;
      case "picture_file": case "Picture/File Field": return <div className="w-full py-8 border-2 border-dashed rounded-md text-center text-gray-400 text-sm">Upload Picture/File</div>;
      case "signature_block": case "Signature Block": return <div className="w-full py-8 border border-dashed rounded-md text-center text-gray-400 italic text-sm">Sign Here</div>;
      case "Date": return <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-400" disabled />;
      case "checkbox": case "Checkbox": return <div className="flex items-center gap-2"><input type="checkbox" disabled /> <span className="text-sm text-gray-600">{fieldLabel}</span></div>;
      case "meter_reading": case "Meter Reading": return <>{(lastReading !== null && lastReading !== undefined) && <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "4px" }}>Last Reading: {lastReading} {fieldUnit || ""}</p>}{meterName && <p style={{ fontSize: "0.875rem", color: "#2563eb", marginBottom: "8px", fontWeight: 500 }}>{meterName}</p>}<div style={{ position: "relative" }}><input type="number" placeholder="Enter Reading" style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", background: "#fff" }} disabled />{fieldUnit && <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none", fontSize: "0.9rem" }}>{fieldUnit}</span>}</div></>;
      default: return <input disabled value="Field Preview" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50" />;
    }
  };

  // --- B. RUNNER RENDERER (For Work Order - Interactive) ---
  const renderRunnerInput = () => {
    switch (fieldType) {
      case "inspection_check": case "Inspection Check": return <InspectionCheckRunner value={currentValue} onChange={(val) => updateAnswer(fieldId, val)} />;
      case "picture_file": case "Picture/File Field": return <UploadRunner value={currentValue} onChange={(val) => updateAnswer(fieldId, val)} />;
      case "signature_block": case "Signature Block": return <SignatureRunner value={currentValue} onChange={(val) => updateAnswer(fieldId, val)} />;
      case "Date": return <DateRunner value={currentValue} onChange={(val) => updateAnswer(fieldId, val)} />;
      
      case "text_field": case "Text Field": return <input type="text" value={currentValue || ""} onChange={e => updateAnswer(fieldId, e.target.value)} placeholder="Enter Text" className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white transition-shadow" />;
      case "number_field": case "Number Field": return <input type="number" value={currentValue || ""} onChange={e => updateAnswer(fieldId, e.target.value)} placeholder="Enter Number" className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white transition-shadow" />;
      case "amount": case "Amount ($)": return <div style={{position:'relative'}}><span className="absolute left-3 top-2 text-gray-500">$</span><input type="number" value={currentValue || ""} onChange={e => updateAnswer(fieldId, e.target.value)} className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm" placeholder="Enter Amount" /></div>;
      case "meter_reading": case "Meter Reading": return <>{(lastReading !== null && lastReading !== undefined) && <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "4px" }}>Last Reading: {lastReading} {fieldUnit || ""}</p>}{meterName && <p style={{ fontSize: "0.875rem", color: "#2563eb", marginBottom: "8px", fontWeight: 500 }}>{meterName}</p>}<div style={{ position: "relative" }}><input type="number" placeholder="Enter Reading" style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", background: "#fff" }} value={currentValue || ""} onChange={(e) => updateAnswer(fieldId, e.target.value)} />{fieldUnit && <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none", fontSize: "0.9rem" }}>{fieldUnit}</span>}</div></>;
      case "yes_no_NA": case "Yes, No, N/A": const ynn = ["Yes", "No", "N/A"]; return <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px"}}>{ynn.map(o => <button key={o} onClick={()=>updateAnswer(fieldId, o.toLowerCase())} className={`py-2.5 rounded-md border text-sm font-medium ${currentValue===o.toLowerCase() ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-gray-200"}`}>{o}</button>)}</div>;
      case "mulitple_choice": case "Multiple Choice": return <div className="flex flex-col gap-2">{fieldOptions?.map((opt:any, idx:number) => <label key={idx} className="flex items-center gap-2 cursor-pointer"><input type="radio" name={fieldId} checked={currentValue === opt} onChange={() => updateAnswer(fieldId, opt)} /><span className="text-sm">{opt}</span></label>)}</div>;
      case "checklist": case "Checklist": const cl = currentValue||[]; return <div className="flex flex-col gap-2">{fieldOptions?.map((opt:any, idx:number) => <label key={idx} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={cl.includes(opt)} onChange={e => { const nl = e.target.checked ? [...cl, opt] : cl.filter((x:any) => x!==opt); updateAnswer(fieldId, nl); }} /><span className="text-sm">{opt}</span></label>)}</div>;
      case "checkbox": case "Checkbox": return <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={currentValue===true} onChange={e => updateAnswer(fieldId, e.target.checked)} className="rounded border-gray-300 text-blue-600" /><span className="text-sm">{fieldLabel}</span></label>;
      default: return renderStandardInput();
    }
  };

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      {fieldType !== "Checkbox" && fieldType !== "checkbox" && (
        <label className="block text-sm font-semibold text-gray-900 mb-3">{fieldLabel} {isRequired && <span className="text-red-500 ml-1">*</span>}</label>
      )}
      {fieldDesc && <p className="text-xs text-gray-500 mb-3 mt-[-4px]">{fieldDesc}</p>}
      {variant === "runner" ? renderRunnerInput() : renderStandardInput()}
    </div>
  );
});