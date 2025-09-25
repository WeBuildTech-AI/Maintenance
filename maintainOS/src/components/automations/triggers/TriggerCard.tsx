import { Trash2 } from "lucide-react";
import { SearchWithDropdown } from "../../Locations/SearchWithDropdown";

export function TriggerCard({ title, onDelete }: { title: string; onDelete: () => void }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <p className="font-medium text-blue-800">When: {title}</p>
        <button className="p-2 hover:bg-blue-100 rounded" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-blue-600" />
        </button>
      </div>

      <SearchWithDropdown
        title="Asset"
        placeholder="Start typing..."
        dropdownOptions={["Asset 1", "Asset 2", "Asset 3", "Asset 4"]}
        onSearch={(value) => console.log("Asset search:", value)}
        onDropdownSelect={(option) => console.log("Asset selected:", option)}
      />

      <SearchWithDropdown
        title="Meter (Required)"
        placeholder="Start typing..."
        dropdownOptions={["Meter 1", "Meter 2", "Meter 3", "Meter 4"]}
        onSearch={(value) => console.log("Meter search:", value)}
        onDropdownSelect={(option) => console.log("Meter selected:", option)}
      />
    </div>
  );
}
