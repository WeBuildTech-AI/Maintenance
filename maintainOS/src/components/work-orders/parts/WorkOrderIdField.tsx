export default function WorkOrderIdField() {
  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-900 mb-1">
        Work Order ID
      </label>
      <input
        type="text"
        placeholder="Work Order ID"
        className="w-full h-12 px-4 border border-gray-300 rounded-md bg-white"
      />
    </div>
  );
}
