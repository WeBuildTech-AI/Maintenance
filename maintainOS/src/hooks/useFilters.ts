import { useEffect, useState } from "react";
import { filterService } from "../services/filterService";

export function useFilters() {
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await filterService.getFilterData();
        setFilters(data);
      } catch (err) {
        console.error("Failed to load filters:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { filters, loading };
}
