// src/utils/filterDataFetcher.ts
import { locationService } from "../../store/locations/locations.service";

// Simple cache object
const cache: Record<string, any[]> = {};

export async function fetchFilterData(filterType: string) {
  // 🔹 If data is cached, return immediately
  if (cache[filterType]) {
    console.log(`🟡 cache hit for ${filterType}`, cache[filterType]);
    return { data: cache[filterType], fromCache: true };
  }

  try {
    let result: any[] = [];

    // 🔹 Define your service calls here
    switch (filterType.toLowerCase()) {
      case "location": {
        const res = await locationService.fetchLocationsName(1000, 1, 0);
        const list = Array.isArray(res?.data) ? res.data : res;

        // 👇 include id + name (id is REQUIRED for matching)
        result = (list || []).map((l: any) => ({
          id: l.id,
          name: l.name,
          image: l.image || null,
        }));

        console.log("🟢 locations fetched from API:", { count: result.length, sample: result.slice(0, 5) });
        break;
      }

      default:
        result = [];
    }

    // 🔹 Cache results
    cache[filterType] = result;
    return { data: result, fromCache: false };
  } catch (error) {
    console.error(`Error fetching ${filterType} data:`, error);
    return { data: [], fromCache: false, error };
  }
}
