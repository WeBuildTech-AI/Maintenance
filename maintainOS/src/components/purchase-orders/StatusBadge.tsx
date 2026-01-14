import { Badge } from "../ui/badge";

const formatStatus = (status: string) => {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-orange-50 text-orange-700 border-orange-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    partially_fulfilled: "bg-yellow-50 text-yellow-700 border-yellow-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    received: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    Draft: "bg-gray-50 text-gray-700 border-gray-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",

  };
  const className = map[status] || map["Draft"];
  return (
    <Badge variant="outline" className={className}>
      {formatStatus(status)}
    </Badge>

  );
}