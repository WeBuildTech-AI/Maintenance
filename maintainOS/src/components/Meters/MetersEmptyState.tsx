export function MetersEmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
        </div>
        <p className="text-muted-foreground mb-2">Select a meter to view details</p>
        <p className="text-sm text-muted-foreground">or create a new meter to get started</p>
      </div>
    </div>
  );
}
