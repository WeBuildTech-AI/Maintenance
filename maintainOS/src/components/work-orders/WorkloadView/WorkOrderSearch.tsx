import { Search } from "lucide-react";
import { Input } from "../../ui/input";

interface WorkOrderSearchProps {
  query: string;
  setQuery: (val: string) => void;
}

export function WorkOrderSearch({ query, setQuery }: WorkOrderSearchProps) {
  return (
    <div className="relative mt-1 min-w-64 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search work orders..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
