"use client";

export function EmptyState({
  message,
  subtext,
  buttonText,
}: {
  message: string;
  subtext: string;
  buttonText?: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="h-16 w-16 rounded-full border border-dashed border-muted-foreground/30" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </div>
      {buttonText && (
        <button className="inline-flex items-center gap-2 rounded bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700">
          {buttonText}
        </button>
      )}
    </div>
  );
}
