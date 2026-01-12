import { Loader2 } from "lucide-react";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function Toggle({ 
  checked, 
  onCheckedChange, 
  disabled = false, 
  isLoading = false,
  className = "" 
}: ToggleProps) {
  const handleToggle = () => {
    if (!disabled && !isLoading) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2
        ${checked ? "bg-orange-600" : "bg-gray-200"}
        ${(disabled || isLoading) ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={`
          pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 
          transition duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      >
        {isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-orange-600" />
        )}
      </span>
    </button>
  );
}