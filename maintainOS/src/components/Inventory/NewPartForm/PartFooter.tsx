import { Button } from "../../ui/button";
import { Upload } from "lucide-react";

export function PartFooter({
  onCancel,
  onCreate,
  disabled,
}: {
  onCancel: () => void;
  onCreate: () => void;
  disabled: boolean;
}) {
  return (
    <div className="p-6 border-t flex justify-end">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="gap-2 bg-orange-600 hover:bg-orange-700"
          onClick={onCreate}
          disabled={disabled}
        >
          <Upload className="h-4 w-4" />
          Create
        </Button>
      </div>
    </div>
  );
}
