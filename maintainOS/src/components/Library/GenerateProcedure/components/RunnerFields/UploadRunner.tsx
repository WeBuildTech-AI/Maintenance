import { Camera, X, FileText } from "lucide-react";
import React from "react";

interface UploadRunnerProps {
  value: string | null; 
  onChange: (val: string | null) => void;
}

export function UploadRunner({ value, onChange }: UploadRunnerProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onChange(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (value) {
    const isImage = value.startsWith("data:image") || value.match(/\.(jpeg|jpg|gif|png)$/);
    return (
      <div className="relative mt-2 w-fit group animate-in fade-in zoom-in-95">
        {isImage ? (
            <img src={value} alt="Uploaded" className="h-48 w-auto rounded-lg border border-gray-200 shadow-sm object-cover" />
        ) : (
            <div className="h-32 w-32 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-500">
                <FileText size={32} />
                <span className="text-xs mt-2 font-medium">File Uploaded</span>
            </div>
        )}
        <button onClick={() => onChange(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors" title="Remove file">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <label className="mt-2 block w-full cursor-pointer group">
      <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg h-36 flex flex-col items-center justify-center text-blue-500 group-hover:bg-blue-50 group-hover:border-blue-400 transition-all duration-200">
        <div className="bg-blue-500 text-white p-2 rounded-lg mb-3 shadow-sm group-hover:scale-110 transition-transform">
          <Camera size={24} />
        </div>
        <span className="text-sm font-medium">Add Pictures/Files</span>
      </div>
      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
    </label>
  );
}