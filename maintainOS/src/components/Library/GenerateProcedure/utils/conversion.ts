import type { FieldData, ConditionData, ProcedureSettingsState } from "../types"; // <-- 1. IMPORT SETTINGS TYPE

// --- Helper: Maps UI field types to backend field types ---
function mapFieldType(type: string): string {
  const map: Record<string, string> = {
    "Text Field": "text_field",
    "Number Field": "number_field",
    "Amount ($)": "amount_field",
    "Yes, No, N/A": "yes_no_NA",
    "Inspection Check": "inspection_check",
    Checklist: "checklist",
    "Multiple Choice": "multiple_choice",
    "Meter Reading": "meter_reading",
    "Picture/File Field": "picture_file",
    "Signature Block": "signature_block",
    Date: "date_field",
  };
  // FIX: Added optional chaining and a nullish coalescing operator for safety
  // This prevents the 'toLowerCase' crash if type is undefined or null.
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

  if (["one_of", "not_one_of", "contains"].includes(targetCondition.type)) {
    targetCondition.values = [condition.conditionValue];
  } else if (targetCondition.type === "between") {
    targetCondition.value = Number(condition.conditionValue);
    targetCondition.value2 = Number(condition.conditionValue2);
  } else if (["is_checked", "is_not_checked"].includes(targetCondition.type)) {
    // No value needed
  } else if (condition.conditionValue) {
    // For higher_than, lower_than, equal_to, etc.
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
    // In a real app, you might map this name to an ID
    config.meterId = field.selectedMeter; 
  }
  if (Object.keys(config).length > 0) {
    targetField.config = config;
  }
  
  // --- Handle Children (Conditional Fields) ---
  if (field.conditions && field.conditions.length > 0) {
    targetField.children = [];
    
    field.conditions.forEach(condition => {
      // --- 💡 FIX: This loop now correctly handles different block types ---
      // It no longer assumes every child is a 'field' block.
      let conditionalOrder = 1;
      condition.fields.forEach((conditionalItem) => {
        
        if (conditionalItem.blockType === "field") {
          // Process nested fields
          const targetChildField = transformField(conditionalItem, conditionalOrder++);
          targetChildField.condition = mapCondition(condition, field.selectedType);
          targetField.children.push(targetChildField);

        } else if (conditionalItem.blockType === "heading") {
          // Process nested headings
          targetField.children.push({
            fieldName: conditionalItem.label,
            fieldType: "heading",
            required: false,
            order: conditionalOrder++,
            condition: mapCondition(condition, field.selectedType),
          });
        }
        // Nested 'section' blocks are not processed, preventing the crash.
      });
    });
  }
  
  return targetField;
}


// --- Main Export Function ---
export function convertStateToJSON(
  fieldsState: FieldData[], 
  settings: ProcedureSettingsState, // <-- 2. ADD SETTINGS PARAM
  procedureName: string, 
  procedureDescription: string
) {
  const result: any = {
    title: procedureName,
    description: procedureDescription,
    organizationId: "60f16350-3552-47e1-81eb-a77cd43f9a81", // Placeholder
    
    // --- 3. MAP SETTINGS TO JSON ---
    assetIds: settings.assets, 
    teamsInCharge: settings.teamsInCharge, 
    locationIds: settings.locations, 
    visibility: settings.visibility,
    // categories: settings.categories, // Add this if your target JSON needs it
    // --- END SETTINGS ---

    rootFields: [],
    sections: []
  };

  const rootItems: any[] = [];
  const sectionsList: any[] = [];

  fieldsState.forEach(item => {
    if (item.blockType === "section") {
      // --- Handle Section ---
      const newSection: any = {
        sectionName: item.label,
        order: sectionsList.length + 1,
        fields: []
      };

      if (item.fields) {
        let fieldOrder = 1;
        item.fields.forEach((sectionItem) => {
          // Handle fields OR headings inside a section
          if (sectionItem.blockType === "field") {
            newSection.fields.push(transformField(sectionItem, fieldOrder++));
          } else if (sectionItem.blockType === "heading") {
            newSection.fields.push({
              fieldName: sectionItem.label,
              fieldType: "heading", // Custom type
              required: false,
              order: fieldOrder++,
            });
          }
          // This logic correctly ignores nested sections, preventing a crash.
        });
      }
      sectionsList.push(newSection);

    } else if (item.blockType === "field") {
      // --- Handle Root Field ---
      rootItems.push(transformField(item, rootItems.length + 1));
    } else if (item.blockType === "heading") {
      // --- Handle Root Heading ---
      rootItems.push({
        fieldName: item.label,
        fieldType: "heading", // Custom type
        required: false,
        order: rootItems.length + 1
      });
    }
  });

  result.rootFields = rootItems;
  result.sections = sectionsList;
  
  return result;
}