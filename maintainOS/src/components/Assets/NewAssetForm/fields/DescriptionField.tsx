export function DescriptionField({ description, setDescription }) {
  return (
    <div className="mt-4">
      <label className="mb-2 block text-sm font-medium text-gray-900">
        Description
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description"
        className="w-full min-h-[96px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
