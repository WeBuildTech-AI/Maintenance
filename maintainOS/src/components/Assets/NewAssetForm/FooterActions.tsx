interface FooterActionsProps {
  onCreate: () => void;
  onCancel?: () => void;
}

export function FooterActions({ onCreate, onCancel }: FooterActionsProps) {
  return (
    <div className="sticky bottom-0 mt-6 flex items-center border-t bg-white px-6 py-4">
      {onCancel && (
        <button
          onClick={onCancel}
          className="h-10 rounded-md border px-4 text-sm font-medium text-orange-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      )}
      <button
        onClick={onCreate}
        style={{
          marginLeft: "auto",
          paddingLeft: "40px",
          paddingRight: "40px",
        }}
        className="h-10 rounded-md bg-orange-600 text-sm font-medium text-white shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Create
      </button>
    </div>
  );
}
