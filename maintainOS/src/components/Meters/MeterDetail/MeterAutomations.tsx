import { Plus } from "lucide-react";
import { Button } from "../../ui/button";

export function MeterAutomations() {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Automations (0)</h2>
      <div className="border border-dashed border-border rounded-lg p-6">
        <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4" />
          Create Automation
        </Button>
      </div>
    </div>
  );
}
