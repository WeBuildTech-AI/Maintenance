import type { Dispatch, SetStateAction } from "react";

type FormState = { name: string; partsSummary: string; color: string; };
interface VendorPrimaryDetailsProps { form: FormState; setForm: Dispatch<SetStateAction<any>>; }

export function VendorPrimaryDetails({ form, setForm }: VendorPrimaryDetailsProps) {
  const colorOptions = ["#2563eb", "#10b981", "#f97316", "#ec4899", "#6366f1"];
  return (
    <>
      <div className="px-6 pt-6"><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Enter Vendor Name (Required)" required className="w-full border-0 border-b-2 bg-transparent px-0 py-2 text-lg placeholder-gray-400 outline-none focus:border-blue-500" /></div>
      <div className="px-6 pt-6">
        <label className="block text-base font-medium text-gray-900 mb-4">Vendor Color</label>
        <div className="flex gap-3">{colorOptions.map((color) => (<button key={color} type="button" className={`h-8 w-8 rounded-full border-2 transition-all duration-200 ${form.color === color ? "ring-2 ring-pink-500 ring-offset-2 border-white" : "border-gray-200 hover:scale-110"}`} style={{ backgroundColor: color }} onClick={() => setForm((f) => ({ ...f, color }))} />))}</div>
      </div>
      <div className="px-6 pt-6">
        <label className="block text-base font-medium text-gray-900 mb-3">Description</label>
        <textarea value={form.partsSummary} onChange={(e) => setForm((f) => ({ ...f, partsSummary: e.target.value }))} placeholder="Add a description" rows={4} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-gray-600 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </>
  );
}