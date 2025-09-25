import { Plus } from "lucide-react";
import { Button } from "../../../ui/button";

export function AssetAutomations() {
  return (
    <div className="border-t border-border pt-8">
      <h3 className="font-medium mb-4">Automations (0)</h3>
      <div className="border border-dashed border-border rounded-lg p-6">
        <Button variant="ghost" className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
          <Plus className="h-4 w-4" />
          Create Automation
        </Button>
      </div>
    </div>
  );
}
