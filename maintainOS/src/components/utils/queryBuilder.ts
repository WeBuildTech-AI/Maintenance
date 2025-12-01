// src/utils/queryBuilder.ts

export type FilterStateItem = {
  values: string[];
  condition: string; // "One of", "None of", "Is empty", "Is not empty", "Contains", "Does not contain"
};

// 1️⃣ UI State -> API Params
export function buildQueryParams(filters: Record<string, FilterStateItem>) {
  const params: Record<string, any> = {};

  Object.entries(filters).forEach(([key, data]) => {
    const { values, condition } = data;

    // 🔴 STEP 1: Reset all potential API keys for this filter first.
    // This guarantees that if you unselect everything, or switch conditions, 
    // the old parameter (e.g., assetOneOf) is explicitly removed (set to null).
    const suffixes = ["OneOf", "NoneOf", "IsEmpty", "IsNotEmpty", "Contains", "DoesNotContain", "Preset"];
    suffixes.forEach(suffix => {
        params[`${key}${suffix}`] = null;
    });
    // Special case for recurrence
    if (key === "recurrence") params["recurrence"] = null;


    // 🔴 STEP 2: Handle "Empty" / "Not Empty" conditions (No values needed)
    if (condition === "Is empty") {
      params[`${key}IsEmpty`] = true;
      return;
    }
    if (condition === "Is not empty") {
      params[`${key}IsNotEmpty`] = true;
      return;
    }

    // 🔴 STEP 3: If no values are selected, stop here.
    // Because we set everything to null in Step 1, the parent will now correctly remove the filter.
    if (!values || values.length === 0) {
      return;
    }

    // 🔴 STEP 4: Handle specific types with values

    // A. Dates (Preset logic)
    if (key === "dueDate" || key === "startDate") {
      const val = values[0]; 
      if (["today", "tomorrow", "next7", "next30", "thisMonth", "overdue", "yesterday", "last7", "last30"].includes(val)) {
        // Overwrite the null from Step 1 with the actual value
        params[`${key}Preset`] = val;
      }
      return; 
    }

    // B. Recurrence
    if (key === "recurrence") {
       params[key] = values[0];
       return;
    }

    // C. Standard Filters (Assets, Status, Priority, etc.)
    let suffix = "OneOf";
    switch (condition) {
      case "One of": suffix = "OneOf"; break;
      case "None of": suffix = "NoneOf"; break;
      case "Contains": suffix = "Contains"; break;
      case "Does not contain": suffix = "DoesNotContain"; break;
      default: suffix = "OneOf";
    }

    // Set the valid value (overwriting the null from Step 1)
    params[`${key}${suffix}`] = values.join(",");
  });

  return params;
}

// 2️⃣ API Params (URL) -> UI State
export function parseUrlParamsToFilterState(searchParams: URLSearchParams): Record<string, FilterStateItem> {
  const state: Record<string, FilterStateItem> = {};

  searchParams.forEach((value, key) => {
    if (['page', 'limit', 'title'].includes(key)) return;

    // A. Dates
    if (key.endsWith("Preset")) {
      const realKey = key.replace("Preset", "");
      state[realKey] = { condition: "One of", values: [value] };
      return;
    }

    // B. Standard Suffixes
    let filterKey = key;
    let condition = "One of";
    let values = value.includes(',') ? value.split(',') : [value];

    if (key.endsWith("OneOf")) { filterKey = key.replace("OneOf", ""); condition = "One of"; }
    else if (key.endsWith("NoneOf")) { filterKey = key.replace("NoneOf", ""); condition = "None of"; }
    else if (key.endsWith("IsEmpty")) { filterKey = key.replace("IsEmpty", ""); condition = "Is empty"; values = []; }
    else if (key.endsWith("IsNotEmpty")) { filterKey = key.replace("IsNotEmpty", ""); condition = "Is not empty"; values = []; }
    else if (key.endsWith("Contains")) { filterKey = key.replace("Contains", ""); condition = "Contains"; }
    else if (key.endsWith("DoesNotContain")) { filterKey = key.replace("DoesNotContain", ""); condition = "Does not contain"; }
    else if (key === "recurrence") { filterKey = "recurrence"; condition = "One of"; }

    state[filterKey] = { condition, values };
  });

  return state;
}