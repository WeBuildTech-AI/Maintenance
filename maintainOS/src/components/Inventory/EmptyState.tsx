import { Button } from "../ui/button";

export function EmptyState({
  variant,
  onCreate,
}: {
  variant: "list" | "panel";
  onCreate?: () => void;
}) {
  if (variant === "list") {
    // exact "No parts found" state from your left list
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed" />
        </div>
        <p className="text-muted-foreground mb-2">No parts found</p>
        <Button variant="link" className="text-primary p-0" onClick={onCreate}>
          Create your first part
        </Button>
      </div>
    );
  }

  // exact right-panel placeholder
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed" />
        </div>
        <p className="text-muted-foreground mb-2">Select a part to view details</p>
        <p className="text-sm text-muted-foreground">or create a new one to get started</p>
      </div>
    </div>
  );
}
