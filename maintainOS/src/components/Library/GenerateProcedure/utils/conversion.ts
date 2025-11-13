import type { FieldData, ConditionData, ProcedureSettingsState } from "../types";

// --- Helper: Maps UI field types to backend field types (FIXED) ---
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
// --- UPDATED: This function no longer processes "heading" types ---
function transformField(field: FieldData, order: number): any {
  const targetField: any = {
    id: field.id, 
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
    
    field.conditions.forEach(condition => {
      let conditionalOrder = 1;
      condition.fields.forEach((conditionalItem) => {
        
        // --- FIX: Only process "field" blockTypes ---
        // Conditional headings are not supported by the new API structure
        if (conditionalItem.blockType === "field") {
          const targetChildField = transformField(conditionalItem, conditionalOrder++);
          targetChildField.condition = mapCondition(condition, field.selectedType);
          targetField.children.push(targetChildField);
        }
        // --- Removed "heading" blockType processing ---
      });
    });
  }
  
  return targetField;
}


// --- Main Export Function ---
// --- UPDATED: This function now correctly separates fields and headings ---
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

    // --- FIX: Initialize all new arrays ---
    headings: [],
    rootFields: [],
    sections: []
  };

  // --- FIX: Add a continuous order counter for root items ---
  let rootOrder = 1;

  fieldsState.forEach(item => {
    if (item.blockType === "section") {
      // --- Handle Section ---
      const newSection: any = {
        id: item.id,
        sectionName: item.label,
        order: result.sections.length + 1, // Section order is separate
        
        // --- FIX: Add separate heading/field arrays ---
        headings: [],
        fields: []
      };

      if (item.fields) {
        // --- FIX: Add continuous order counter for section items ---
        let sectionOrder = 1;
        
        item.fields.forEach((sectionItem) => {
          if (sectionItem.blockType === "field") {
            newSection.fields.push(transformField(sectionItem, sectionOrder++));
          } else if (sectionItem.blockType === "heading") {
            // --- FIX: Create correct heading object ---
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
  
  // --- This logic for flattening conditional fields remains the same ---
  // It correctly operates on rootFields and section.fields,
  // leaving the new headings arrays untouched.
  const allFields: any[] = [...result.rootFields];
  result.sections.forEach((s: any) => {
    // Add sectionId to fields for easier parent lookup
    s.fields.forEach((f: any) => {
        f.sectionId = s.id;
        allFields.push(f);
    });
  });

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