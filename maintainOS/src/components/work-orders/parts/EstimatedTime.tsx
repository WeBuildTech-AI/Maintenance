export default function EstimatedTime() {
  return (
    <div className="mt-6">
      <h3 className="mb-4 text-base font-medium text-gray-900">Estimated Time</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Hours</label>
          <input
            type="number"
            defaultValue={1}
            className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Minutes</label>
          <input
            type="number"
            defaultValue={0}
            className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
