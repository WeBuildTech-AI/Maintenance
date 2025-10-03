import { Paperclip } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface VendorAttachmentsInputProps { attachedDocs: File[]; setAttachedDocs: Dispatch<SetStateAction<File[]>>; onFilesSelected: (files: File[]) => void; }

export function VendorAttachmentsInput({ attachedDocs, setAttachedDocs, onFilesSelected }: VendorAttachmentsInputProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files) return; onFilesSelected(Array.from(e.target.files)); };
  const removeDoc = (index: number) => { setAttachedDocs((prev) => prev.filter((_, i) => i !== index)); };
  return (
    <div className="px-6 pt-6">
      <label className="block text-base font-medium text-gray-700 mb-2">Files</label>
      <div className="space-y-2">{attachedDocs.map((file, i) => (<div key={i} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-700">{file.name.split(".").pop()?.toUpperCase()}</div><span className="max-w-xs truncate text-sm text-gray-700">{file.name}</span></div><button type="button" onClick={() => removeDoc(i)} className="text-gray-500 hover:text-red-600">✕</button></div>))}</div>
      <div className="mt-3">
        <label htmlFor="docInput" className="inline-flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm font-medium text-orange-600 hover:bg-blue-50"><Paperclip className="h-4 w-4" />Attach files</label>
        <input id="docInput" type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  );
}