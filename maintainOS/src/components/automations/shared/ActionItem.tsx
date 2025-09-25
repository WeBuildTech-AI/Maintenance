import { ChevronRight, Lock } from "lucide-react";

export function ActionItem({
  icon,
  text,
  isLocked = false,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  isLocked?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg ${
        isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
      }`}
      onClick={!isLocked ? onClick : undefined}
    >
      <div className="flex items-center gap-4">
        {isLocked ? <Lock className="h-5 w-5 text-gray-400" /> : <div className="text-blue-600">{icon}</div>}
        <span className={`font-medium ${isLocked ? "text-gray-400" : ""}`}>{text}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  );
}
