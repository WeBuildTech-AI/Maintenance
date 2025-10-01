import { Upload } from "lucide-react";

export default function UploadPictures() {
  return (
    <div className="mt-4">
      <h3 className="mb-4 text-base font-medium text-gray-900">Pictures</h3>
      <div className="mb-6 border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer">
        <Upload className="mx-auto mb-2 h-6 w-6" />
        <p className="text-gray-900">Add or drag pictures</p>
      </div>
    </div>
  );
}
