import type { FieldData, ProcedureSettingsState } from "../types";

// --- API Response Types (Jo JSON aapne diya) ---
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
  includeTime?: boolean; // (Yeh add kar raha hoon, Date type ke liye)
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
  priority?: string | null; // (Yeh Priority ke liye hai)
  fields: ApiField[];
  headings: ApiHeading[];
  sections: ApiSection[];
  assets: string[]; // (Yeh 'assets' hai, 'assetIds' nahi)
  locations: string[];
  teams: string[];
  categories: string[];
}

// --- Reverse Maps (API se UI) ---

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

// --- Helper Functions ---

/**
 * API Field ko Builder State Field mein convert karta hai (bina nesting)
 */
function mapApiFieldToStateField(apiField: ApiField): FieldData {
  const { config } = apiField;
  
  return {
    id: Number(apiField.id.replace(/-/g, "").substring(0, 10)) || Date.now() + Math.random(), // Simple numeric ID for builder
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
    links: [], // (Yeh API response mein nahi hai)
    attachments: [], // (Yeh API response mein nahi hai)
    conditions: [], // (Yeh Pass 2 mein fill hoga)
    fields: [], // (Yeh Sections ke liye hai, yahaan empty)
  };
}

/**
 * API Condition ko Builder State Condition object mein convert karta hai
 */
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

/**
 * API Heading ko Builder State Heading (FieldData) mein convert karta hai
 */
function mapApiHeadingToStateField(apiHeading: ApiHeading): FieldData {
  return {
    id: Number(apiHeading.id.replace(/-/g, "").substring(0, 10)) || Date.now() + Math.random(),
    label: apiHeading.text,
    selectedType: "Heading",
    blockType: "heading",
  };
}

/**
 * API Section ko Builder State Section (FieldData) mein convert karta hai
 */
function mapApiSectionToStateField(apiSection: ApiSection): FieldData {
  return {
    id: Number(apiSection.id.replace(/-/g, "").substring(0, 10)) || Date.now() + Math.random(),
    label: apiSection.sectionName,
    selectedType: "Section",
    blockType: "section",
    description: "", // (API response mein description nahi hai)
    fields: [], // (Yeh Pass 3 mein fill hoga)
  };
}


// --- Main Conversion Function ---

export function convertJSONToState(apiJson: ApiProcedureResponse): {
  fields: FieldData[];
  settings: ProcedureSettingsState;
} {
  
  // 1. Settings State ko map karein
  const settings: ProcedureSettingsState = {
    visibility: apiJson.visibility || "private",
    priority: apiJson.priority || null,
    categories: apiJson.categories || [],
    assets: apiJson.assets || [],
    locations: apiJson.locations || [],
    teamsInCharge: apiJson.teams || [],
  };

  // 2. Fields State ko map karein (Nesting ke saath)

  const stateFieldMap = new Map<string, FieldData>();
  const allApiFields: ApiField[] = [...apiJson.fields];
  apiJson.sections.forEach(s => allApiFields.push(...s.fields));

  // --- Pass 1: Sabhi fields ko create karein aur Map mein store karein ---
  for (const apiField of allApiFields) {
    // API ID (string) ko State Field (object) se map karein
    stateFieldMap.set(apiField.id, mapApiFieldToStateField(apiField));
  }

  // --- Pass 2: Nesting (conditions) ko handle karein ---
  for (const apiField of allApiFields) {
    if (apiField.parentId && apiField.condition) {
      const childStateField = stateFieldMap.get(apiField.id);
      const parentStateField = stateFieldMap.get(apiField.parentId);

      if (childStateField && parentStateField) {
        // Condition ko UI format mein convert karein
        const uiCond = transformApiCondition(apiField.condition);
        
        // Parent par existing condition group dhoondein
        let condGroup = parentStateField.conditions?.find(
          c => c.conditionOperator === uiCond.operator && c.conditionValue === uiCond.value
        );

        if (!condGroup) {
          // Naya condition group banayein
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
        
        // Child field ko parent ke condition group mein add karein
        condGroup.fields.push(childStateField);
      }
    }
  }

  // --- Pass 3: Final root array ko build karein ---
  const rootState: FieldData[] = [];
  
  // Root fields (jo 'fields' array mein hain aur jinka parentId nahi hai)
  apiJson.fields.forEach(apiField => {
    if (!apiField.parentId && !apiField.sectionId) {
      rootState.push(stateFieldMap.get(apiField.id)!);
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
    
    // Section ke items ko collect karein
    const sectionItems: FieldData[] = [];

    // Fields (jo section ke hain aur jinka parentId nahi hai)
    apiSection.fields.forEach(apiField => {
      if (!apiField.parentId) {
        sectionItems.push(stateFieldMap.get(apiField.id)!);
      }
    });

    // Headings
    apiSection.headings.forEach(apiHeading => {
      sectionItems.push(mapApiHeadingToStateField(apiHeading));
    });

    // Order ke hisaab se sort karein
    const apiItems = [...apiSection.fields.filter(f => !f.parentId), ...apiSection.headings];
    sectionStateField.fields = sectionItems.sort((a, b) => {
        const orderA = apiItems.find(item => item.id.includes(a.id.toString()))?.order ?? 0;
        const orderB = apiItems.find(item => item.id.includes(b.id.toString()))?.order ?? 0;
        return orderA - orderB;
    });

    rootState.push(sectionStateField);
  });

  // Final root list ko order ke hisaab se sort karein
  const finalFields = rootState.sort((a, b) => {
      const allRootItems = [...apiJson.fields.filter(f => !f.parentId && !f.sectionId), ...apiJson.headings.filter(h => !h.sectionId), ...apiJson.sections];
      const orderA = allRootItems.find(item => item.id.includes(a.id.toString()))?.order ?? 0;
      const orderB = allRootItems.find(item => item.id.includes(b.id.toString()))?.order ?? 0;
      return orderA - orderB;
  });

  return {
    fields: finalFields,
    settings: settings,
  };
}