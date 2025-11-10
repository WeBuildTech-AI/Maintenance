import type { FieldData, ConditionData, ProcedureSettingsState } from "../types";

// --- Helper: Maps UI field types to backend field types (FIXED) ---
function mapFieldType(type: string): string {
  const map: Record<string, string> = {
    "Text Field": "text_field",
    "Number Field": "number_field",
    "Amount ($)": "amount", // <-- FIX: Was 'amount_field'
    "Yes, No, N/A": "yes_no_NA",
    "Inspection Check": "inspection_check",
    Checklist: "checklist",
    "Multiple Choice": "mulitple_choice", // <-- FIX: Match API typo
    "Meter Reading": "meter_reading",
    "Picture/File Field": "picture_file",
    "Signature Block": "signature_block",
    Date: "Date", // <-- FIX: Was 'date_field'
    Checkbox: "checkbox", // <-- Added for clarity
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
  
  // --- Pass condition ID (for preview) ---
  targetCondition.id = condition.id;

  if (["one_of", "not_one_of", "contains"].includes(targetCondition.type)) {
    targetCondition.values = [condition.conditionValue];
  } else if (targetCondition.type === "between") {
    targetCondition.value = Number(condition.conditionValue);
    targetCondition.value2 = Number(condition.conditionValue2);
  } else if (["is_checked", "is_not_checked"].includes(targetCondition.type)) {
    // No value needed
  } else if (condition.conditionValue) {
    const numericValue = Number(condition.conditionValue);
    if (!isNaN(numericValue)) {
      targetCondition.value = numericValue;
    } else {
      targetCondition.value = condition.conditionValue;
    }
  }
  
  return targetCondition;
}

// --- Helper: Transforms a single UI field to the target JSON field ---
function transformField(field: FieldData, order: number): any {
  const targetField: any = {
    id: field.id, // <-- Pass the original ID (for preview)
    fieldName: field.label,
    fieldType: mapFieldType(field.selectedType), // <-- Uses FIXED map
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
    
    field.conditions.forEach(condition => {
      let conditionalOrder = 1;
      condition.fields.forEach((conditionalItem) => {
        
        if (conditionalItem.blockType === "field") {
          const targetChildField = transformField(conditionalItem, conditionalOrder++);
          targetChildField.condition = mapCondition(condition, field.selectedType);
          targetField.children.push(targetChildField);

        } else if (conditionalItem.blockType === "heading") {
          targetField.children.push({
            id: conditionalItem.id, // <-- Pass the original ID (for preview)
            fieldName: conditionalItem.label,
            fieldType: "heading",
            required: false,
            order: conditionalOrder++,
            condition: mapCondition(condition, field.selectedType),
          });
        }
      });
    });
  }
  
  return targetField;
}


// --- Main Export Function ---
export function convertStateToJSON(
  fieldsState: FieldData[], 
  settings: ProcedureSettingsState,
  procedureName: string, 
  procedureDescription: string
) {
  const result: any = {
    title: procedureName,
    description: procedureDescription,
        
    // --- 3. MAP SETTINGS TO JSON ---
    assetIds: settings.assets, 
    teamsInCharge: settings.teamsInCharge, 
    locationIds: settings.locations, 
    visibility: settings.visibility,

    rootFields: [],
    sections: []
  };

  const rootItems: any[] = [];
  const sectionsList: any[] = [];

  fieldsState.forEach(item => {
    if (item.blockType === "section") {
      // --- Handle Section ---
      const newSection: any = {
        id: item.id, // <-- Pass the original ID (for preview)
        sectionName: item.label,
        order: sectionsList.length + 1,
        fields: []
      };

      if (item.fields) {
        let fieldOrder = 1;
        item.fields.forEach((sectionItem) => {
          if (sectionItem.blockType === "field") {
            newSection.fields.push(transformField(sectionItem, fieldOrder++));
          } else if (sectionItem.blockType === "heading") {
            newSection.fields.push({
              id: sectionItem.id, // <-- Pass the original ID (for preview)
              fieldName: sectionItem.label,
              fieldType: "heading",
              required: false,
              order: fieldOrder++,
            });
          }
        });
      }
      sectionsList.push(newSection);

    } else if (item.blockType === "field") {
      // --- Handle Root Field ---
      rootItems.push(transformField(item, rootItems.length + 1));
    } else if (item.blockType === "heading") {
      // --- Handle Root Heading ---
      rootItems.push({
        id: item.id, // <-- Pass the original ID (for preview)
        fieldName: item.label,
        fieldType: "heading",
        required: false,
        order: rootItems.length + 1
      });
    }
  });

  result.rootFields = rootItems;
  result.sections = sectionsList;
  
  // --- Re-organize children to match API structure ---
  // This logic moves conditional fields from 'children' to the correct 'fields' array
  
  const allFields: any[] = [...result.rootFields];
  result.sections.forEach((s: any) => allFields.push(...s.fields));

  const childFields: any[] = [];

  allFields.forEach(f => {
    if (f.children) {
      f.children.forEach((child: any) => {
        child.parentId = f.id; // Set parentId
        childFields.push(child);
      });
      delete f.children; // Remove children array
    }
  });

  // Add child-fields back into the correct list (rootFields or section.fields)
  childFields.forEach(child => {
    const parent = allFields.find(f => f.id === child.parentId);
    if (parent) {
      if (parent.sectionId) {
        // Parent is in a section
        const section = result.sections.find((s: any) => s.id === parent.sectionId);
        if (section) {
          child.sectionId = section.id;
          section.fields.push(child);
        }
      } else {
        // Parent is in rootFields
        result.rootFields.push(child);
      }
    }
  });

  return result;
}