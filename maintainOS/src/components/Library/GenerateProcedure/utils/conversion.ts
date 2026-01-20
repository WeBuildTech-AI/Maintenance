import type { FieldData, ConditionData, ProcedureSettingsState } from "../types";

// --- Helper: Maps UI field types to backend field types ---
function mapFieldType(type: string): string {
  const map: Record<string, string> = {
    "Text Field": "text_field",
    "Number Field": "number_field",
    "Amount ($)": "amount",
    "Yes, No, N/A": "yes_no_NA",
    "Inspection Check": "inspection_check",
    Checklist: "checklist",
    "Multiple Choice": "mulitple_choice", // Match API typo
    "Meter Reading": "meter_reading",
    "Picture/File Field": "picture_file",
    "Signature Block": "signature_block",
    Date: "Date",
    Checkbox: "checkbox",
  };
  return map[type] || type?.toLowerCase() || "unknown";
}

// --- Helper: Maps UI condition to backend condition format ---
function mapCondition(condition: ConditionData, parentType: string): any {
  const targetCondition: any = {};

  const operatorMap: Record<string, string> = {
    "is": "one_of",
    "is not": "not_one_of",
    "higher than": "higher_than",
    "lower than": "lower_than",
    "equal to": "equal_to",
    "not equal to": "not_equal_to",
    "between": "between",
    "contains": "contains",
    "is checked": "is_checked",
    "is not checked": "is_not_checked",
  };

  targetCondition.type = operatorMap[condition.conditionOperator || ""] || "unknown";
  
  // targetCondition.id = condition.id; // REMOVED: Backend does not want condition IDs in payload

  if (["one_of", "not_one_of", "contains"].includes(targetCondition.type)) {
    targetCondition.values = [condition.conditionValue || ""];
  } else if (targetCondition.type === "between") {
    targetCondition.value = Number(condition.conditionValue) || 0;
    targetCondition.value2 = Number(condition.conditionValue2) || 0;
  } else if (["is_checked", "is_not_checked"].includes(targetCondition.type)) {
    // No value needed
  } else {
     // For higher_than, lower_than, equal_to, not_equal_to
     // We MUST provide a value. If it's missing, default to 0 for numbers, or "" for others.
     // Since these usually come from Number Field / Amount, we default to 0.
     const num = Number(condition.conditionValue);
     if (!isNaN(num)) {
        targetCondition.value = num;
     } else {
        targetCondition.value = condition.conditionValue || ""; 
     }
  }
  
  return targetCondition;
}

// --- Helper: Transforms a single UI field to the target JSON field ---
function transformField(field: FieldData, order: number): any {
  const targetField: any = {
    // id: field.id, // REMOVED: Backend does not want internal numeric IDs
    fieldName: field.label,
    fieldType: mapFieldType(field.selectedType),
    required: !!field.isRequired, 
    order: order,
  };

  if (field.hasDescription && field.description) {
    targetField.fieldDescription = field.description;
  }

  // --- Handle Config ---
  const config: any = {};
  if (field.options && field.options.length > 0) {
    config.options = field.options;
  }
  if (field.selectedMeter) {
    config.meterId = field.selectedMeter; 
  }
  if (field.meterUnit) {
    config.meterUnit = field.meterUnit;
  }
  if (Object.keys(config).length > 0) {
    targetField.config = config;
  }
  
  // --- Handle Children (Conditional Fields) ---
  if (field.conditions && field.conditions.length > 0) {
    targetField.children = [];
    
    // DEBUG: Log conditions being processed
    // console.log("Processing conditions for field:", field.label, field.conditions);

    field.conditions.forEach(condition => {
      let conditionalOrder = 1;
      condition.fields.forEach((conditionalItem) => {
        
        if (conditionalItem.blockType === "field") {
          const targetChildField = transformField(conditionalItem, conditionalOrder++);
          
          // Debug: Check if mapCondition returns a valid object
          const mappedCondition = mapCondition(condition, field.selectedType);
          
          // Force explicit object construction to ensure condition property availability
          const finalChildField = {
             fieldName: targetChildField.fieldName,
             fieldType: targetChildField.fieldType,
             required: targetChildField.required,
             order: targetChildField.order,
             config: targetChildField.config,
             // Add any other properties from targetChildField if they exist (like fieldDescription)
             ...(targetChildField.fieldDescription && { fieldDescription: targetChildField.fieldDescription }),
             ...(targetChildField.children && { children: targetChildField.children }),
             
             condition: mappedCondition
          };
          
          targetField.children.push(finalChildField);
        }
      });
    });
  }
  
  return targetField;
}


// --- Main Export Function 1: (STATE -> JSON) ---
export function convertStateToJSON(
  fieldsState: FieldData[], 
  settings: ProcedureSettingsState,
  procedureName: string, 
  procedureDescription: string
) {
  const result: any = {
    title: procedureName,
    description: procedureDescription,
        
    assetIds: settings.assets, 
    teamsInCharge: settings.teamsInCharge, 
    locationIds: settings.locations, 
    visibility: settings.visibility,
    // ✅ FIX: Changed 'categories' to 'categoryIds'
    categoryIds: settings.categories, 

    // --- Conditionally add 'priority' ---
    ...(settings.priority && { priority: settings.priority }),

    headings: [],
    rootFields: [],
    sections: []
  };

  // --- Add a continuous order counter for root items ---
  let rootOrder = 1;

  fieldsState.forEach(item => {
    if (item.blockType === "section") {
      // --- Handle Section ---
      const newSection: any = {
        id: item.id,
        sectionName: item.label,
        order: result.sections.length + 1, // Section order is separate
        headings: [],
        fields: []
      };

      if (item.fields) {
        let sectionOrder = 1;
        item.fields.forEach((sectionItem) => {
          if (sectionItem.blockType === "field") {
            newSection.fields.push(transformField(sectionItem, sectionOrder++));
          } else if (sectionItem.blockType === "heading") {
            newSection.headings.push({
              id: sectionItem.id,
              text: sectionItem.label,
              order: sectionOrder++,
            });
          }
        });
      }
      result.sections.push(newSection);

    } else if (item.blockType === "field") {
      // --- Handle Root Field ---
      result.rootFields.push(transformField(item, rootOrder++));
      
    } else if (item.blockType === "heading") {
      // --- Handle Root Heading ---
      result.headings.push({
        id: item.id,
        text: item.label,
        order: rootOrder++,
      });
    }
  });
  
  // --- REMOVED FLATTENING LOGIC ---
  // The backend now accepts nested 'children' arrays as generated by transformField.
  // We no longer need to flatten everything and re-assign parentIds/sectionIds manually
  // for the children. transformField already handles the nesting.
  
  // However, we DO need to ensure root fields that belong to sections (but are not nested
  // inside other fields) are correctly assigned to their sections if not already handled.
  // In the current logic:
  // - Fields inside sections are already added to 'newSection.fields'.
  // - Root fields are added to 'result.rootFields'.
  // - Nested children are inside 'children' array of their parent.
  
  // So, simply returning 'result' should be sufficient if 'transformField' is correct.


  return result;
}


// --- Main Export Function 2: (JSON -> STATE) ---
// (This is the code for converting API response to builder state)

// --- API Response Types ---
interface ApiCondition {
  type: string;
  values: string[];
  value?: number | string;
  value2?: number | string;
}

interface ApiField {
  id: string;
  fieldName: string;
  fieldType: string;
  required: boolean;
  config: {
    options?: string[];
    meterId?: string;
    meterUnit?: string;
    placeholder?: string;
  } | null;
  order: number;
  sectionId: string | null;
  fieldDescription: string;
  condition: ApiCondition | null;
  parentId: string | null;
  includeTime?: boolean;
}

interface ApiHeading {
  id: string;
  text: string;
  order: number;
  sectionId: string | null;
}

interface ApiSection {
  id: string;
  sectionName: string;
  order: number;
  fields: ApiField[];
  headings: ApiHeading[];
}

interface ApiProcedureResponse {
  id: string;
  title: string;
  description: string;
  visibility: "private" | "public";
  priority?: string | null; 
  fields: ApiField[];
  headings: ApiHeading[];
  sections: ApiSection[];
  // ✅ FIX: Allow these to be string[] (IDs) OR Object[] (Populated)
  assets: (string | { id: string })[]; 
  locations: (string | { id: string })[];
  teams: (string | { id: string })[];
  categories: (string | { id: string })[];
}

// --- Reverse Maps (API to UI) ---

const reverseFieldTypeMap: Record<string, string> = {
  text_field: "Text Field",
  number_field: "Number Field",
  amount: "Amount ($)",
  yes_no_NA: "Yes, No, N/A",
  inspection_check: "Inspection Check",
  checklist: "Checklist",
  mulitple_choice: "Multiple Choice",
  meter_reading: "Meter Reading",
  picture_file: "Picture/File Field",
  signature_block: "Signature Block",
  Date: "Date",
  checkbox: "Checkbox",
};

const reverseConditionMap: Record<string, string> = {
  one_of: "is",
  not_one_of: "is not",
  higher_than: "higher than",
  lower_than: "lower than",
  equal_to: "equal to",
  not_equal_to: "not equal to",
  between: "between",
  contains: "contains",
  is_checked: "is checked",
  is_not_checked: "is not checked",
};

// --- Helper Functions (JSON -> STATE) ---

// ✅ HELPER: Safely extract IDs from mixed Array (String IDs or Objects)
function extractIds(items: (string | { id: string })[] | undefined): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null && 'id' in item) return item.id;
    return '';
  }).filter(id => id !== '');
}

function mapApiFieldToStateField(apiField: ApiField): FieldData {
  const { config } = apiField;
  
  return {
    id: Number(apiField.id.replace(/-/g, "").substring(0, 10)) || Date.now() + Math.random(), 
    label: apiField.fieldName,
    selectedType: reverseFieldTypeMap[apiField.fieldType] || "Text Field",
    blockType: "field",
    isRequired: apiField.required,
    description: apiField.fieldDescription,
    hasDescription: !!apiField.fieldDescription,
    options: config?.options || [],
    meterUnit: config?.meterUnit,
    selectedMeter: config?.meterId,
    includeTime: apiField.includeTime || false,
    links: [], 
    attachments: [], 
    conditions: [], 
    fields: [], 
  };
}

function transformApiCondition(apiCond: ApiCondition | null) {
  if (!apiCond) {
    return { operator: null, value: null, value2: null };
  }

  const operator = reverseConditionMap[apiCond.type];
  let value = apiCond.value;
  let value2 = apiCond.value2;

  if (apiCond.values && apiCond.values.length > 0) {
    value = apiCond.values[0];
  }

  return {
    operator: operator || null,
    value: value?.toString() || null,
    value2: value2?.toString() || null,
  };
}

function mapApiHeadingToStateField(apiHeading: ApiHeading): FieldData {
  return {
    id: Number(apiHeading.id.replace(/-/g, "").substring(0, 10)) || Date.now() + Math.random(),
    label: apiHeading.text,
    selectedType: "Heading",
    blockType: "heading",
  };
}

function mapApiSectionToStateField(apiSection: ApiSection): FieldData {
  return {
    id: Number(apiSection.id.replace(/-/g, "").substring(0, 10)) || Date.now() + Math.random(),
    label: apiSection.sectionName,
    selectedType: "Section",
    blockType: "section",
    description: "", 
    fields: [], 
  };
}


export function convertJSONToState(apiJson: ApiProcedureResponse): {
  fields: FieldData[];
  settings: ProcedureSettingsState;
} {
  
  // 1. Map Settings State
  // ✅ FIX: Use extractIds to ensure we only store UUID strings in state
  const settings: ProcedureSettingsState = {
    visibility: apiJson.visibility || "private",
    priority: apiJson.priority || null,
    categories: extractIds(apiJson.categories),
    assets: extractIds(apiJson.assets),
    locations: extractIds(apiJson.locations),
    teamsInCharge: extractIds(apiJson.teams),
  };

  // 2. Map Fields State (with Nesting)

  const stateFieldMap = new Map<string, FieldData>();
  const allApiFields: ApiField[] = [...apiJson.fields];
  apiJson.sections.forEach(s => allApiFields.push(...s.fields));

  // --- Pass 1: Create all fields and store in Map ---
  for (const apiField of allApiFields) {
    stateFieldMap.set(apiField.id, mapApiFieldToStateField(apiField));
  }

  // --- Pass 2: Handle nesting (conditions) ---
  for (const apiField of allApiFields) {
    if (apiField.parentId && apiField.condition) {
      const childStateField = stateFieldMap.get(apiField.id);
      const parentStateField = stateFieldMap.get(apiField.parentId);

      if (childStateField && parentStateField) {
        const uiCond = transformApiCondition(apiField.condition);
        
        let condGroup = parentStateField.conditions?.find(
          c => c.conditionOperator === uiCond.operator && c.conditionValue === uiCond.value
        );

        if (!condGroup) {
          condGroup = {
            id: Date.now() + Math.random(),
            conditionOperator: uiCond.operator,
            conditionValue: uiCond.value,
            conditionValue2: uiCond.value2,
            fields: [],
            isCollapsed: false,
          };
          if (!parentStateField.conditions) {
            parentStateField.conditions = [];
          }
          parentStateField.conditions.push(condGroup);
        }
        
        condGroup.fields.push(childStateField);
      }
    }
  }

  // --- Pass 3: Build the final root array ---
  const rootState: FieldData[] = [];
  
  // Root fields
  apiJson.fields.forEach(apiField => {
    if (!apiField.parentId && !apiField.sectionId) {
      const field = stateFieldMap.get(apiField.id);
      if (field) rootState.push(field);
    }
  });

  // Root headings
  apiJson.headings.forEach(apiHeading => {
    if (!apiHeading.sectionId) {
      rootState.push(mapApiHeadingToStateField(apiHeading));
    }
  });

  // Sections
  apiJson.sections.forEach(apiSection => {
    const sectionStateField = mapApiSectionToStateField(apiSection);
    
    const sectionItems: FieldData[] = [];

    // Fields in section
    // 1. From apiSection.fields (if nested)
    apiSection.fields.forEach(apiField => {
      if (!apiField.parentId) {
        const field = stateFieldMap.get(apiField.id);
        if (field) sectionItems.push(field);
      }
    });

    // 2. From allApiFields (if flat) - avoid duplicates
    allApiFields.forEach(apiField => {
      if (apiField.sectionId === apiSection.id && !apiField.parentId) {
         // Check if already added
         if (!sectionItems.find(existing => existing.id === stateFieldMap.get(apiField.id)?.id)) {
            const field = stateFieldMap.get(apiField.id);
            if (field) sectionItems.push(field);
         }
      }
    });

    // Headings in section
    apiSection.headings.forEach(apiHeading => {
      sectionItems.push(mapApiHeadingToStateField(apiHeading));
    });

    // Sort items within the section
    const apiItems = [...apiSection.fields.filter(f => !f.parentId), ...apiSection.headings];
    
    const findApiItem = (id: number) => {
        return apiItems.find(item => {
            const numId = Number(item.id.replace(/-/g, "").substring(0, 10)) || 0;
            return numId === id;
        });
    }

    sectionStateField.fields = sectionItems.sort((a, b) => {
        const itemA = findApiItem(a.id);
        const itemB = findApiItem(b.id);
        return (itemA?.order || 0) - (itemB?.order || 0);
    });

    rootState.push(sectionStateField);
  });

  // Sort the final root list
  const allRootApiItems = [
      ...apiJson.fields.filter(f => !f.parentId && !f.sectionId), 
      ...apiJson.headings.filter(h => !h.sectionId), 
      ...apiJson.sections
  ];

  const findRootApiItem = (id: number) => {
      return allRootApiItems.find(item => {
          const numId = Number(item.id.replace(/-/g, "").substring(0, 10)) || 0;
          return numId === id;
      });
  }

  const finalFields = rootState.sort((a, b) => {
    const itemA = findRootApiItem(a.id);
    const itemB = findRootApiItem(b.id);
    return (itemA?.order || 0) - (itemB?.order || 0);
  });

  return {
    fields: finalFields,
    settings: settings,
  };
}