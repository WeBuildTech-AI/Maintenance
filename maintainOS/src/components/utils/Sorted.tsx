// utils/sortLocations.ts
import { LocationResponse } from "../../store/locations"; // adjust path to your type

export function sortLocations(
  locations: LocationResponse[],
  sortBy: string
): LocationResponse[] {
  const sorted = [...locations];

  switch (sortBy) {
    case "Name: Ascending Order":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "Name: Descending Order":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    // case "Status":
    //   return sorted.sort((a, b) => a.status.localeCompare(b.status));

    // case "Location":
    //   return sorted.sort((a, b) => a.location.localeCompare(b.location));

    default:
      return locations;
  }
}
