// Shared filter utilities for Reporting module

export interface FilterParam {
  field: string;
  operator: string;
  value: string;
}

/**
 * Converts MM/DD/YYYY format to ISO date string (YYYY-MM-DD)
 */
export const convertToISODate = (dateStr: string): string => {
  try {
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  } catch (e) {
    console.error("Date conversion error:", e);
    return dateStr;
  }
};

/**
 * Maps frontend filter parameters to backend API filter format
 * @param filters - Filter object from FilterBar
 * @param dateRange - Date range with startDate and endDate
 * @returns Array of FilterParam objects for API
 */
export const mapFilters = (
  filters: Record<string, any>,
  dateRange: { startDate: string; endDate: string }
): FilterParam[] => {
  const mapped: FilterParam[] = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;

    if (key === "assignedToOneOf") {
      mapped.push({
        field: "assigneeId",
        operator: "eq",
        value: String(value),
      });
    } else if (key === "locationOneOf") {
      mapped.push({
        field: "locationId",
        operator: "eq",
        value: String(value),
      });
    } else if (key === "priorityOneOf") {
      mapped.push({ field: "priority", operator: "eq", value: String(value) });
    } else if (key === "workTypeOneOf") {
      mapped.push({ field: "workType", operator: "eq", value: String(value) });
    } else if (key === "completedByOneOf") {
      mapped.push({
        field: "completedBy",
        operator: "eq",
        value: String(value),
      });
    } else if (key === "vendorOneOf") {
      mapped.push({ field: "vendorIds", operator: "eq", value: String(value) });
    }
    // Add more filter mappings here as needed
  });

  // Add Date Range (Global) - Convert to ISO format with timestamp
  if (dateRange.startDate) {
    mapped.push({
      field: "createdAt",
      operator: "gte",
      value: `${convertToISODate(dateRange.startDate)}T00:00:00Z`,
    });
  }
  if (dateRange.endDate) {
    mapped.push({
      field: "createdAt",
      operator: "lte",
      value: `${convertToISODate(dateRange.endDate)}T23:59:59Z`,
    });
  }

  return mapped;
};
