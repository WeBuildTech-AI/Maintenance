import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  useMemo,
} from "react";
import {
  type FieldData,
  type ConditionData,
  type ProcedureSettingsState,
} from "./types";
import {
  FileText,
  Calendar,
  CheckSquare,
  Hash,
  DollarSign,
  ListChecks,
  Eye,
  Radio,
  Gauge,
} from "lucide-react";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { convertStateToJSON } from "./utils/conversion";

// --- 1. Define the Context Type (all state and handlers) ---
interface ProcedureBuilderContextType {
  name: string;
  description: string;
  fields: FieldData[];
  setFields: React.Dispatch<React.SetStateAction<FieldData[]>>;
  settings: ProcedureSettingsState;
  setSettings: React.Dispatch<React.SetStateAction<ProcedureSettingsState>>;
  activeField: FieldData | null;
  editingFieldId: number | null;
  setEditingFieldId: React.Dispatch<React.SetStateAction<number | null>>;
  activeContainerId: number | "root";
  setActiveContainerId: React.Dispatch<React.SetStateAction<number | "root">>;
  overContainerId: string | number | null;
  setOverContainerId: React.Dispatch<React.SetStateAction<string | number | null>>;
  dropdownOpen: number | null;
  setDropdownOpen: React.Dispatch<React.SetStateAction<number | null>>;

  // --- [NEW] Editable Name/Description in Context ---
  procedureName: string;
  setProcedureName: React.Dispatch<React.SetStateAction<string>>;
  procedureDescription: string;
  setProcedureDescription: React.Dispatch<React.SetStateAction<string>>;
  
  // --- [NEW] Yeh state LibDynamicSelect ke liye zaroori hai ---
  activeDropdown: string | null;
  setActiveDropdown: React.Dispatch<React.SetStateAction<string | null>>;
  
  editingSectionId: number | null;
  setEditingSectionId: React.Dispatch<React.SetStateAction<number | null>>;
  sectionMenuOpen: number | null;
  setSectionMenuOpen: React.Dispatch<React.SetStateAction<number | null>>;
  logicEditorOpen: number | null;
  setLogicEditorOpen: React.Dispatch<React.SetStateAction<number | null>>;
  conditionOperatorDropdownOpen: number | null;
  setConditionOperatorDropdownOpen: React.Dispatch<React.SetStateAction<number | null>>;
  conditionMenuOpen: number | null;
  setConditionMenuOpen: React.Dispatch<React.SetStateAction<number | null>>;
  fieldMenuOpen: number | null;
  setFieldMenuOpen: React.Dispatch<React.SetStateAction<number | null>>;
  isReorderModalOpen: boolean;
  setIsReorderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLinkModalOpen: { fieldId: number | null };
  setIsLinkModalOpen: React.Dispatch<React.SetStateAction<{ fieldId: number | null }>>;
  isAddConditionModalOpen: { fieldId: number | null }; // [NEW]
  setIsAddConditionModalOpen: React.Dispatch<React.SetStateAction<{ fieldId: number | null }>>; // [NEW]
  dropdownWidths: Record<number, number>;
  setDropdownWidths: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  collapsed: Record<number, boolean>;
  toggleCollapse: (id: number) => void;
  fieldTypes: { label: string; icon: React.ReactNode }[];
  totalFieldCount: number;
  dropdownRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  buttonRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  fieldBlockRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  sidebarRef: React.MutableRefObject<HTMLDivElement | null>;
  sectionBlockRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  sectionMenuButtonRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  sectionMenuPopoverRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  logicEditorButtonRefs: React.MutableRefObject<Record<number, HTMLButtonElement | null>>;
  logicEditorPanelRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  conditionOpButtonRefs: React.MutableRefObject<Record<number, HTMLButtonElement | null>>;
  conditionOpPanelRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  conditionMenuButtonRefs: React.MutableRefObject<Record<number, HTMLButtonElement | null>>;
  conditionMenuPanelRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  fieldMenuButtonRefs: React.MutableRefObject<Record<number, HTMLButtonElement | null>>;
  fieldMenuPanelRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  linkModalRef: React.MutableRefObject<HTMLDivElement | null>;
  findFieldRecursive: (fieldsList: FieldData[], id: number) => FieldData | undefined;
  updateFieldsRecursive: (fieldsList: FieldData[], updateFn: (field: FieldData) => FieldData) => FieldData[];
  handleAddField: () => void;
  handleAddHeading: () => void;
  handleAddSection: () => void;
  handleDeleteField: (id: number) => void;
  handleAddFieldInsideSection: (sectionId: number) => void;
  handleFieldPropChange: (id: number, prop: keyof FieldData, value: any) => void;
  handleLabelChange: (id: number, value: string) => void;
  handleAddOption: (id: number) => void;
  handleOptionChange: (id: number, index: number, value: string) => void;
  handleRemoveOption: (id: number, index: number) => void;
  handleTypeChange: (id: number, newType: string) => void;
  handleAddCondition: (fieldId: number) => void;
  handleAddConditionWithData: (fieldId: number, data: { operator: string; value: any; value2?: any; initialFields?: FieldData[] }) => void; // [NEW]
  handleToggleLogicEditor: (fieldId: number) => void;
  handleDeleteCondition: (fieldId: number, conditionId: number) => void;
  handleConditionChange: (fieldId: number, conditionId: number, prop: keyof ConditionData, value: any) => void;
  handleAddFieldInsideCondition: (fieldId: number, conditionId: number) => void;
  handleToggleConditionCollapse: (fieldId: number, conditionId: number) => void;
  logicEnabledFieldTypes: string[];
  handleToggleRequired: (fieldId: number, isChecked: boolean) => void;
  handleToggleDescription: (fieldId: number) => void;
  handleDuplicateField: (fieldId: number) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleFieldDragStart: (event: DragStartEvent) => void;
  handleFieldDragOver: (event: DragOverEvent) => void;
  handleFieldDragEnd: (event: DragEndEvent) => void;
}

// --- 2. Create Context ---
const ProcedureBuilderContext = createContext<
  ProcedureBuilderContextType | undefined
>(undefined);

// ... (findFieldAndParent, findAndAddRecursive, countFieldsRecursive helpers) ...
// --- Helper: Find any field and its parent array ---
type ParentArray = FieldData[] | ConditionData["fields"];
interface FieldLocation {
  field: FieldData;
  parent: ParentArray;
  index: number;
}
function findFieldAndParent(
  arr: ParentArray,
  id: number
): FieldLocation | null {
  for (let i = 0; i < arr.length; i++) {
    const field = arr[i];
    if (field.id === id) {
      return { field, parent: arr, index: i };
    }
    if (field.fields) {
      const found = findFieldAndParent(field.fields, id);
      if (found) return found;
    }
    if (field.conditions) {
      for (const c of field.conditions) {
        const found = findFieldAndParent(c.fields, id);
        if (found) return found;
      }
    }
  }
  return null;
}

// --- Helper: Recursively update fields ---
const updateFieldsRecursive = (
  fieldsList: FieldData[],
  updateFn: (field: FieldData) => FieldData
): FieldData[] => {
  return fieldsList.map((field) => {
    let updatedField = updateFn(field);

    if (updatedField.fields) {
      updatedField.fields = updateFieldsRecursive(
        updatedField.fields,
        updateFn
      );
    }

    if (updatedField.conditions) {
      updatedField.conditions = updatedField.conditions.map((c) => ({
        ...c,
        fields: updateFieldsRecursive(c.fields, updateFn),
      }));
    }

    return updatedField;
  });
};

// --- Helper: Find a field recursively ---
const findFieldRecursive = (
  fieldsList: FieldData[],
  id: number
): FieldData | undefined => {
  for (const field of fieldsList) {
    if (field.id === id) return field;
    if (field.fields) {
      const found = findFieldRecursive(field.fields, id);
      if (found) return found;
    }
    if (field.conditions) {
      for (const c of field.conditions) {
        const found = findFieldRecursive(c.fields, id);
        if (found) return found;
      }
    }
  }
  return undefined;
};


// --- NEW HELPER: Recursively find a container and add an item to it ---
const findAndAddRecursive = (
  fieldsList: FieldData[],
  containerId: number | "root",
  newItem: FieldData
): FieldData[] => {
  // This function is only for nested adds.

  return fieldsList.map((field) => {
    // Check if the current field is the container
    if (field.id === containerId && field.blockType === "section") {
      return {
        ...field,
        fields: [...(field.fields || []), newItem],
      };
    }

    // Recurse into section fields
    if (field.fields) {
      field.fields = findAndAddRecursive(field.fields, containerId, newItem);
    }

    // Recurse into condition fields
    if (field.conditions) {
      field.conditions = field.conditions.map((c) => {
        if (c.id === containerId) {
          return {
            ...c,
            fields: [...c.fields, newItem],
          };
        }
        // Recurse into this condition's fields
        return {
          ...c,
          fields: findAndAddRecursive(c.fields, containerId, newItem),
        };
      });
    }

    return field;
  });
};

// --- NEW HELPER: Recursively count fields ---
const countFieldsRecursive = (fieldsList: FieldData[]): number => {
  let count = 0;
  for (const field of fieldsList) {
    if (field.blockType === "field") {
      count += 1;
    }

    if (field.fields) {
      count += countFieldsRecursive(field.fields);
    }

    if (field.conditions) {
      for (const c of field.conditions) {
        count += countFieldsRecursive(c.fields);
      }
    }
  }
  return count;
};

// --- Helper: Ek default field banane ke liye ---
const createDefaultField = (): FieldData => ({
  id: Date.now(),
  selectedType: "Text Field",
  blockType: "field",
  label: "New Field",
  isRequired: false,
  hasDescription: false,
});

// --- Default settings state ---
const defaultSettingsState: ProcedureSettingsState = {
  categories: [],
  assets: [],
  locations: [],
  teamsInCharge: [],
  visibility: "private",
  priority: null, 
};

// --- ADDED PROPS FOR PROVIDER ---
interface ProcedureBuilderProviderProps {
  children: ReactNode;
  name: string;
  description: string;
  initialState?: {
    fields: FieldData[];
    settings: ProcedureSettingsState;
  };
}

// --- 3. Create Provider Component ---
export function ProcedureBuilderProvider({
  children,
  name,
  description,
  initialState, 
}: ProcedureBuilderProviderProps) {
  
  // --- State initialization (No Change) ---
  const [fields, setFields] = useState<FieldData[]>(() => 
    initialState?.fields || [createDefaultField()]
  );
  
  const [settings, setSettings] = useState<ProcedureSettingsState>(() => 
    initialState?.settings || defaultSettingsState
  );

  // --- [NEW] Name/Description State ---
  const [procedureName, setProcedureName] = useState(name);
  const [procedureDescription, setProcedureDescription] = useState(description);

  // --- Baaki saari state (No Change) ---
  const [activeContainerId, setActiveContainerId] = useState<number | "root">(
    "root"
  );
  const [activeField, setActiveField] = useState<FieldData | null>(null);
  const [overContainerId, setOverContainerId] = useState<
    string | number | null
  >(null);
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  
  // --- [NEW] State for LibDynamicSelect ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionMenuOpen, setSectionMenuOpen] = useState<number | null>(null);
  const [logicEditorOpen, setLogicEditorOpen] = useState<number | null>(null);
  const [conditionOperatorDropdownOpen, setConditionOperatorDropdownOpen] =
    useState<number | null>(null);
  const [conditionMenuOpen, setConditionMenuOpen] = useState<number | null>(
    null
  );
  const [fieldMenuOpen, setFieldMenuOpen] = useState<number | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [dropdownWidths, setDropdownWidths] = useState<Record<number, number>>(
    {}
  );
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<{
    fieldId: number | null;
  }>({ fieldId: null });

  // --- [NEW] Add Condition Modal State ---
  const [isAddConditionModalOpen, setIsAddConditionModalOpen] = useState<{
    fieldId: number | null;
  }>({ fieldId: null });
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  // --- Saare Refs (No Change) ---
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const buttonRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const fieldBlockRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sectionBlockRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const sectionMenuButtonRefs = useRef<Record<number, HTMLDivElement | null>>(
    {}
  );
  const sectionMenuPopoverRefs = useRef<Record<number, HTMLDivElement | null>>(
    {}
  );
  const logicEditorButtonRefs = useRef<
    Record<number, HTMLButtonElement | null>
  >({});
  const logicEditorPanelRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const conditionOpButtonRefs = useRef<
    Record<number, HTMLButtonElement | null>
  >({});
  const conditionOpPanelRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const conditionMenuButtonRefs = useRef<
    Record<number, HTMLButtonElement | null>
  >({});
  const conditionMenuPanelRefs = useRef<
    Record<number, HTMLDivElement | null>
  >({});
  const fieldMenuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>(
    {}
  );
  const fieldMenuPanelRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const linkModalRef = useRef<HTMLDivElement | null>(null);

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fieldTypes = [
    { label: "Checkbox", icon: <CheckSquare size={16} color="#3b82f6" /> },
    { label: "Text Field", icon: <FileText size={16} color="#10b981" /> },
    { label: "Number Field", icon: <Hash size={16} color="#f59e0b" /> },
    { label: "Amount ($)", icon: <DollarSign size={16} color="#ef4444" /> },
    { label: "Multiple Choice", icon: <Radio size={16} color="#ef4444" /> },
    { label: "Checklist", icon: <ListChecks size={16} color="#6366f1" /> },
    { label: "Inspection Check", icon: <Eye size={16} color="#06b6d4" /> },
    { label: "Yes, No, N/A", icon: <CheckSquare size={16} color="#eab308" /> },
    {
      label: "Picture/File Field",
      icon: <FileText size={16} color="#22c55e" />,
    },
    {
      label: "Signature Block",
      icon: <FileText size={16} color="#ec4899" />,
    },
    { label: "Date", icon: <Calendar size={16} color="#2563eb" /> },
    { label: "Meter Reading", icon: <Gauge size={16} color="#6366f1" /> },
  ];

  const logicEnabledFieldTypes = [
    "Checkbox",
    "Number Field",
    "Amount ($)",
    "Multiple Choice",
    "Checklist",
    "Inspection Check",
    "Yes, No, N/A",
    "Meter Reading",
  ];

  useEffect(() => {
    if (dropdownOpen && buttonRefs.current[dropdownOpen]) {
      const width = buttonRefs.current[dropdownOpen]?.offsetWidth || 260;
      setDropdownWidths((prev) => ({ ...prev, [dropdownOpen]: width }));
    }
  }, [dropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 1. Close Field Dropdowns
      const isOutsideDropdowns = Object.values(dropdownRefs.current).every(
        (ref) => !ref || !ref.contains(event.target as Node)
      );
      const isOutsideButtons = Object.values(buttonRefs.current).every(
        (ref) => !ref || !ref.contains(event.target as Node)
      );
      // --- [NEW] Add check for LibDynamicSelect ---
      const isOutsideActiveDropdown = activeDropdown === null; 
      
      if (isOutsideDropdowns && isOutsideButtons && isOutsideActiveDropdown) {
        setDropdownOpen(null);
      }

      // 2. Close Section Menus
      const isOutsideSectionButtons = Object.values(
        sectionMenuButtonRefs.current
      ).every((ref) => !ref || !ref.contains(event.target as Node));
      const isOutsideSectionPopovers = Object.values(
        sectionMenuPopoverRefs.current
      ).every((ref) => !ref || !ref.contains(event.target as Node));
      if (isOutsideSectionButtons && isOutsideSectionPopovers) {
        setSectionMenuOpen(null);
      }

      // 3. Close Logic Editors
      if (logicEditorOpen) {
        const parentFieldCardRef = fieldBlockRefs.current[logicEditorOpen];
        const isClickInsideParentCard =
          parentFieldCardRef &&
          parentFieldCardRef.contains(event.target as Node);

        const isClickInsideLogicPanel =
          logicEditorPanelRefs.current[logicEditorOpen] &&
          logicEditorPanelRefs.current[logicEditorOpen]!.contains(
            event.target as Node
          );

        const isClickOnLogicButton =
          logicEditorButtonRefs.current[logicEditorOpen] &&
          logicEditorButtonRefs.current[logicEditorOpen]!.contains(
            event.target as Node
          );

        if (
          !isClickInsideParentCard &&
          !isClickInsideLogicPanel &&
          !isClickOnLogicButton
        ) {
          setLogicEditorOpen(null);
        }
      }

      // 4. Collapse Editing Fields
      const sidebarClicked =
        sidebarRef.current &&
        sidebarRef.current.contains(event.target as Node);

      if (editingFieldId) {
        const activeFieldRef = fieldBlockRefs.current[editingFieldId];
        if (
          activeFieldRef &&
          !activeFieldRef.contains(event.target as Node) &&
          !sidebarClicked &&
          // --- [NEW] Add check for LibDynamicSelect ---
          isOutsideActiveDropdown
        ) {
          let clickInsideLogicPanel = false;
          Object.values(logicEditorPanelRefs.current).forEach((panel) => {
            if (panel && panel.contains(event.target as Node)) {
              clickInsideLogicPanel = true;
            }
          });

          let clickOnLogicButton = false;
          Object.values(logicEditorButtonRefs.current).forEach((button) => {
            if (button && button.contains(event.target as Node)) {
              clickOnLogicButton = true;
            }
          });

          const clickInsideLinkModal =
            linkModalRef.current &&
            linkModalRef.current.contains(event.target as Node);

          if (
            !clickInsideLogicPanel &&
            !clickOnLogicButton &&
            !clickInsideLinkModal
          ) {
            setEditingFieldId(null);
            setActiveContainerId("root");
          }
        }
      }

      // 5. Collapse Editing Sections
      if (editingSectionId) {
        const activeSectionRef = sectionBlockRefs.current[editingSectionId];
        if (
          activeSectionRef &&
          !activeSectionRef.contains(event.target as Node) &&
          !sidebarClicked
        ) {
          setEditingSectionId(null);
          setActiveContainerId("root");
        }
      }

      const activeLogicPanelRef =
        logicEditorOpen && logicEditorPanelRefs.current[logicEditorOpen];
      if (
        activeLogicPanelRef &&
        activeLogicPanelRef.contains(event.target as Node)
      ) {
        return;
      }

      // 6. Close Condition Operator Dropdowns
      const isOutsideCondOpButtons = Object.values(
        conditionOpButtonRefs.current
      ).every((ref) => !ref || !ref.contains(event.target as Node));
      const isOutsideCondOpPanels = Object.values(
        conditionOpPanelRefs.current
      ).every((ref) => !ref || !ref.contains(event.target as Node));
      if (isOutsideCondOpButtons && isOutsideCondOpPanels) {
        setConditionOperatorDropdownOpen(null);
      }

      // 7. Close Condition Menus
      const isOutsideCondMenuButtons = Object.values(
        conditionMenuButtonRefs.current
      ).every((ref) => !ref || !ref.contains(event.target as Node));
      const isOutsideCondMenuPanels = Object.values(
        conditionMenuPanelRefs.current
      ).every((ref) => !ref || !ref.contains(event.target as Node));
      if (isOutsideCondMenuButtons && isOutsideCondMenuPanels) {
        setConditionMenuOpen(null);
      }

      // 8. Close Field Menus
      const isOutsideFieldMenuButtons = Object.values(
        fieldMenuButtonRefs.current
      ).every((ref) => !ref || !ref.contains(event.target as Node));
      const isOutsideFieldMenuPanels = Object.values(
        fieldMenuPanelRefs.current
      ).every((ref) => !ref || !ref.contains(event.target as Node));
      if (isOutsideFieldMenuButtons && isOutsideFieldMenuPanels) {
        setFieldMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    editingFieldId,
    editingSectionId,
    dropdownOpen,
    logicEditorOpen,
    conditionOperatorDropdownOpen,
    conditionMenuOpen,
    fieldMenuOpen,
    // --- [NEW] Add dependency ---
    activeDropdown,
  ]);

  // --- NEW: Calculate total field count ---
  const totalFieldCount = useMemo(() => {
    return countFieldsRecursive(fields);
  }, [fields]);
  // --- END NEW ---

  // --- UPDATED: LOG JSON ON EVERY CHANGE (fields OR settings) ---
  useEffect(() => {
    const finalJSON = convertStateToJSON(fields, settings, name, description);
    console.clear();
    console.log("--- LIVE PROCEDURE JSON (Updates on change) ---");
    console.log(JSON.stringify(finalJSON, null, 2));
  }, [fields, settings, name, description]); // <-- ADDED settings
  // --- END NEW ---


  // --- HANDLERS (MODIFIED) ---

  const handleAddField = () => {
    const newId = Date.now();
    const newField: FieldData = {
      id: newId,
      selectedType: "Text Field",
      blockType: "field",
      label: "New Field",
      isRequired: false,
      hasDescription: false,
    };

    if (activeContainerId === "root") {
      setFields((prev) => [...prev, newField]);
    } else {
      setFields((prev) =>
        findAndAddRecursive(prev, activeContainerId, newField)
      );
    }

    setEditingFieldId(newId);
    setDropdownOpen(null);
  };

  const handleAddHeading = () => {
    const newId = Date.now();
    const newHeading: FieldData = {
      id: newId,
      selectedType: "Heading",
      blockType: "heading",
      label: "New Heading",
    };

    if (activeContainerId === "root") {
      setFields((prev) => [...prev, newHeading]);
    } else {
      setFields((prev) =>
        findAndAddRecursive(prev, activeContainerId, newHeading)
      );
    }

    setEditingFieldId(newId);
    setDropdownOpen(null);
  };

  const handleAddSection = () => {
    const newId = Date.now();
    const newSubFieldId = newId + 1;
    const sectionNumber =
      fields.filter((f) => f.blockType === "section").length + 1;

    const newSection: FieldData = {
      id: newId,
      blockType: "section",
      label: `Section #${sectionNumber}`,
      description: "",
      fields: [
        {
          id: newSubFieldId,
          selectedType: "Text Field",
          blockType: "field",
          label: "New Field",
          isRequired: false,
          hasDescription: false,
        },
      ],
    };

    setFields((prev) => [...prev, newSection]);

    setEditingSectionId(newId);
    setEditingFieldId(newSubFieldId);
    setDropdownOpen(null);
  };

  const handleDeleteField = (id: number) => {
    const deleteRecursive = (fieldsList: FieldData[]): FieldData[] => {
      const filtered = fieldsList.filter((f) => f.id !== id);

      if (filtered.length === fieldsList.length) {
        return fieldsList.map((f) => {
          let newFields = f.fields;
          if (f.blockType === "section" && f.fields) {
            newFields = deleteRecursive(f.fields);
          }
          let newConditions = f.conditions;
          if (f.conditions) {
            newConditions = f.conditions.map((c) => ({
              ...c,
              fields: deleteRecursive(c.fields),
            }));
          }
          return { ...f, fields: newFields, conditions: newConditions };
        });
      }
      return filtered;
    };

    setFields((prev) => deleteRecursive(prev));

    if (dropdownRefs.current[id]) delete dropdownRefs.current[id];
    if (buttonRefs.current[id]) delete buttonRefs.current[id];
    if (fieldBlockRefs.current[id]) delete fieldBlockRefs.current[id];
    if (sectionBlockRefs.current[id]) delete sectionBlockRefs.current[id];
    if (sectionMenuButtonRefs.current[id])
      delete sectionMenuButtonRefs.current[id];
    if (sectionMenuPopoverRefs.current[id])
      delete sectionMenuPopoverRefs.current[id];
    if (logicEditorButtonRefs.current[id])
      delete logicEditorButtonRefs.current[id];
    if (logicEditorPanelRefs.current[id])
      delete logicEditorPanelRefs.current[id];

    if (conditionOpButtonRefs.current[id])
      delete conditionOpButtonRefs.current[id];
    if (conditionOpPanelRefs.current[id])
      delete conditionOpPanelRefs.current[id];
    if (conditionMenuButtonRefs.current[id])
      delete conditionMenuButtonRefs.current[id];
    if (conditionMenuPanelRefs.current[id])
      delete conditionMenuPanelRefs.current[id];

    if (fieldMenuButtonRefs.current[id])
      delete fieldMenuButtonRefs.current[id];
    if (fieldMenuPanelRefs.current[id])
      delete fieldMenuPanelRefs.current[id];

    setCollapsed((prev) => {
      const copy = { ...prev };
      if (copy[id] !== undefined) delete copy[id];
      return copy;
    });
  };

  const handleAddFieldInsideSection = (sectionId: number) => {
    const newId = Date.now();
    setFields((prev) =>
      prev.map((s) =>
        s.id === sectionId && s.fields
          ? {
              ...s,
              fields: [
                ...s.fields,
                {
                  id: newId,
                  selectedType: "Text Field",
                  blockType: "field",
                  label: "New Field",
                  isRequired: false,
                  hasDescription: false,
                },
              ],
            }
          : s
      )
    );
    setEditingFieldId(newId);
    setEditingSectionId(null);
    setDropdownOpen(null);
  };

  const handleFieldPropChange = (
    id: number,
    prop: keyof FieldData,
    value: any
  ) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === id) {
          return { ...field, [prop]: value };
        }
        return field;
      })
    );
  };

  const handleLabelChange = (id: number, value: string) => {
    handleFieldPropChange(id, "label", value);
  };

  const handleAddOption = (id: number) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === id) {
          return {
            ...field,
            options: [
              ...(field.options || []),
              `Option ${field.options?.length ? field.options.length + 1 : 1}`,
            ],
          };
        }
        return field;
      })
    );
  };

  const handleOptionChange = (id: number, index: number, value: string) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === id) {
          return {
            ...field,
            options: field.options?.map((opt, i) => (i === index ? value : opt)),
          };
        }
        return field;
      })
    );
  };

  const handleRemoveOption = (id: number, index: number) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === id) {
          return {
            ...field,
            options: field.options?.filter((_, i) => i !== index),
          };
        }
        return field;
      })
    );
  };

  const handleTypeChange = (id: number, newType: string) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === id) {
          let defaultOptions: string[] = [];
          if (newType === "Multiple Choice" || newType === "Checklist") {
            if (!field.options || field.options.length === 0) {
              defaultOptions = ["Option 1"];
            } else {
              defaultOptions = field.options;
            }
          }

          return {
            ...field,
            selectedType: newType,
            options: defaultOptions,
            meterUnit: undefined,
            selectedMeter: undefined,
            description: undefined,
            hasDescription: false,
            conditions: [],
          };
        }
        return field;
      })
    );
    setDropdownOpen(null);
  };

  // --- [NO CHANGE] Yeh function waisa hi hai, "Add Another" ke liye ---
  const handleAddCondition = (fieldId: number) => {
    const newCondition: ConditionData = {
      id: Date.now(),
      conditionOperator: null,
      conditionValue: null,
      conditionValue2: null,
      fields: [
        {
          id: Date.now() + 1,
          selectedType: "Text Field",
          blockType: "field",
          label: "New Field",
          isRequired: false,
          hasDescription: false,
        },
      ],
      isCollapsed: false,
    };

    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            conditions: [...(field.conditions || []), newCondition],
          };
        }
        return field;
      })
    );
  };

  // --- [NEW] Add Condition WITH DATA (Called by Modal) ---
  const handleAddConditionWithData = (
    fieldId: number, 
    data: { operator: string; value: any; value2?: any; initialFields?: FieldData[] }
  ) => {
    // If no initial fields provided, default to one text field
    const defaultFields: FieldData[] = [
        {
          id: Date.now() + 1,
          selectedType: "Text Field",
          blockType: "field",
          label: "New Field",
          isRequired: false,
          hasDescription: false,
        },
    ];

    const newCondition: ConditionData = {
      id: Date.now(),
      conditionOperator: data.operator,
      conditionValue: data.value,
      conditionValue2: data.value2 || null, // Ensure explicit null
      fields: data.initialFields && data.initialFields.length > 0 ? data.initialFields : defaultFields,
      isCollapsed: false,
    };

    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            conditions: [...(field.conditions || []), newCondition],
          };
        }
        return field;
      })
    );
    // Explicitly open the logic editor panel so the new condition is visible
    setLogicEditorOpen(fieldId);
  };
  
  // --- 👇 [CHANGE] YEH NAYA FUNCTION HAI JO BUG FIX KAREGA ---
  const handleToggleLogicEditor = (fieldId: number) => {
    // Pehle, panel ko toggle karein (open ya close)
    setLogicEditorOpen(prevOpenId => (prevOpenId === fieldId ? null : fieldId));

    // Agar panel *band* ho raha hai, toh kuch na karein
    if (logicEditorOpen === fieldId) {
      return;
    }
    
    // Agar panel *khul* raha hai, toh state ko check karein
    setFields(prevFields => {
      // Hamesha latest state (prevFields) se field dhoondein
      const field = findFieldRecursive(prevFields, fieldId);

      // Check karein ki field hai aur conditions *waqai* 0 hain
      if (field && (!field.conditions || field.conditions.length === 0)) {
        // Nayi condition banayein
        const newCondition: ConditionData = {
          id: Date.now(),
          conditionOperator: null,
          conditionValue: null,
          conditionValue2: null,
          fields: [
            {
              id: Date.now() + 1,
              selectedType: "Text Field",
              blockType: "field",
              label: "New Field",
              isRequired: false,
              hasDescription: false,
            },
          ],
          isCollapsed: false,
        };
        
        // State ko update karein (sirf agar zaroorat hai)
        return updateFieldsRecursive(prevFields, f => 
          f.id === fieldId 
            ? { ...f, conditions: [newCondition] } 
            : f
        );
      }

      // Agar conditions pehle se hain, toh state change na karein
      return prevFields;
    });
  };
  // --- END OF NEW FUNCTION ---

  const handleDeleteCondition = (fieldId: number, conditionId: number) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            conditions: field.conditions?.filter((c) => c.id !== conditionId),
          };
        }
        return field;
      })
    );
    setConditionMenuOpen(null);
  };

  const handleConditionChange = (
    fieldId: number,
    conditionId: number,
    prop: keyof ConditionData,
    value: any
  ) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            conditions: field.conditions?.map((c) =>
              c.id === conditionId
                ? {
                    ...c,
                    [prop]: value,
                    ...(prop === "conditionOperator" && {
                      conditionValue: null,
                      conditionValue2: null,
                    }),
                  }
                : c
            ),
          };
        }
        return field;
      })
    );
    if (prop === "conditionOperator") {
      setConditionOperatorDropdownOpen(null);
    }
  };

  const handleAddFieldInsideCondition = (
    fieldId: number,
    conditionId: number
  ) => {
    const newSubFieldId = Date.now();
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            conditions: field.conditions?.map((c) =>
              c.id === conditionId
                ? {
                    ...c,
                    fields: [
                      ...c.fields,
                      {
                        id: newSubFieldId,
                        selectedType: "Text Field",
                        blockType: "field",
                        label: "New Field",
                        isRequired: false,
                        hasDescription: false,
                      },
                    ],
                  }
                : c
            ),
          };
        }
        return field;
      })
    );
    setEditingSectionId(null);
    setDropdownOpen(null);
  };

  const handleToggleConditionCollapse = (
    fieldId: number,
    conditionId: number
  ) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === fieldId && field.conditions) {
          return {
            ...field,
            conditions: field.conditions.map((c) =>
              c.id === conditionId
                ? { ...c, isCollapsed: !c.isCollapsed }
                : c
            ),
          };
        }
        return field;
      })
    );
  };

  const handleToggleRequired = (fieldId: number, isChecked: boolean) => {
    handleFieldPropChange(fieldId, "isRequired", isChecked);
  };

  const handleToggleDescription = (fieldId: number) => {
    setFields((prev) =>
      updateFieldsRecursive(prev, (field) => {
        if (field.id === fieldId) {
          return { ...field, hasDescription: !field.hasDescription };
        }
        return field;
      })
    );
    setFieldMenuOpen(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over!.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDuplicateField = (fieldId: number) => {
    const duplicateRecursive = (field: FieldData): FieldData => {
      const newId = Date.now() + Math.random();
      const newField = { ...field, id: newId };

      if (newField.options) {
        newField.options = [...newField.options];
      }
      if (newField.fields) {
        newField.fields = newField.fields.map(duplicateRecursive);
      }
      if (newField.conditions) {
        newField.conditions = newField.conditions.map((c) => {
          const newCondId = Date.now() + Math.random();
          return {
            ...c,
            id: newCondId,
            fields: c.fields.map(duplicateRecursive),
          };
        });
      }
      return newField;
    };

    let fieldToDuplicate: FieldData | undefined;
    let parentArray: FieldData[] | undefined;
    let originalIndex: number = -1;

    const findAndSet = (arr: FieldData[], id: number) => {
      for (let i = 0; i < arr.length; i++) {
        const field = arr[i];
        if (field.id === id) {
          fieldToDuplicate = field;
          parentArray = arr;
          originalIndex = i;
          return true;
        }
        if (field.fields && findAndSet(field.fields, id)) return true;
        if (field.conditions) {
          for (const c of field.conditions) {
            if (findAndSet(c.fields, id)) return true;
          }
        }
      }
      return false;
    };

    findAndSet(fields, fieldId);

    if (fieldToDuplicate && parentArray && originalIndex !== -1) {
      const newField = duplicateRecursive(fieldToDuplicate);
      parentArray.splice(originalIndex + 1, 0, newField);
      setFields([...fields]);
    }
    setFieldMenuOpen(null);
  };

  // --- NEW: Field Drag-n-Drop Handlers ---
  const handleFieldDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const field = findFieldRecursive(fields, active.id as number);
    if (field) {
      setActiveField(field);
    }
  };

  const handleFieldDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const containerId = over.data?.current?.sortable?.containerId || null;
      setOverContainerId(containerId);
    } else {
      setOverContainerId(null);
    }
  };

  const handleFieldDragEnd = (event: DragEndEvent) => {
    setActiveField(null);
    setOverContainerId(null);

    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    setFields((prevFields) => {
      const newFields = JSON.parse(JSON.stringify(prevFields)) as FieldData[];
      const activeLocation = findFieldAndParent(
        newFields,
        active.id as number
      );
      let overLocation = findFieldAndParent(newFields, over.id as number);

      if (!activeLocation) return prevFields;

      if (!overLocation) {
        // --- Case 1: Dropped on a container, not an item ---
        const overContainerId = over.data?.current?.sortable?.containerId;

        let targetContainer: ParentArray | undefined;
        if (overContainerId === "root") {
          targetContainer = newFields;
        } else if (overContainerId.startsWith("section-")) {
          const id = Number(overContainerId.split("-")[1]);
          targetContainer = findFieldRecursive(newFields, id)?.fields;
        } else if (overContainerId.startsWith("condition-")) {
          const id = Number(overContainerId.split("-")[1]);
          const findCond = (arr: FieldData[]): ConditionData | undefined => {
            for (const f of arr) {
              if (f.conditions) {
                const cond = f.conditions.find((c) => c.id === id);
                if (cond) return cond;
              }
              if (f.fields) {
                const cond = findCond(f.fields);
                if (cond) return cond;
              }
            }
          };
          targetContainer = findCond(newFields)?.fields;
        }

        if (targetContainer && targetContainer !== activeLocation.parent) {
          // --- 庁 FIX: Enforce "No Nested Sections" rule ---
          if (activeLocation.field.blockType === "section") {
            return prevFields; // Abort drop
          }
          const [movedItem] = activeLocation.parent.splice(
            activeLocation.index,
            1
          );
          targetContainer.push(movedItem);
          return newFields;
        }
        return prevFields; // No valid drop
      }

      // --- Case 2: Dropped on an item ---
      if (activeLocation.parent === overLocation.parent) {
        // --- Subcase 2a: Same container reorder ---
        const reordered = arrayMove(
          activeLocation.parent,
          activeLocation.index,
          overLocation.index
        );

        if (activeLocation.parent === newFields) {
          return reordered;
        }

        activeLocation.parent.splice(
          0,
          activeLocation.parent.length,
          ...reordered
        );
        return newFields;
      } else {
        // --- Subcase 2b: Move between containers ---

        // --- 庁 FIX: Enforce "No Nested Sections" rule ---
        if (activeLocation.field.blockType === "section") {
          return prevFields; // Abort drop
        }
        const [movedItem] = activeLocation.parent.splice(
          activeLocation.index,
          1
        );
        overLocation.parent.splice(overLocation.index, 0, movedItem);
        return newFields;
      }
    });
  };

  // --- 5. Provide Context Value ---
  const contextValue: ProcedureBuilderContextType = {
    name,
    description,
    fields,
    setFields,
    settings,
    setSettings,
    activeField,
    editingFieldId,
    setEditingFieldId,
    activeContainerId,
    setActiveContainerId,
    overContainerId,
    setOverContainerId,
    dropdownOpen,
    setDropdownOpen,
    
    // --- [NEW] State ko provide karein ---
    activeDropdown,
    setActiveDropdown,

    editingSectionId,
    setEditingSectionId,
    sectionMenuOpen,
    setSectionMenuOpen,
    logicEditorOpen,
    setLogicEditorOpen,
    conditionOperatorDropdownOpen,
    setConditionOperatorDropdownOpen,
    conditionMenuOpen,
    setConditionMenuOpen,
    fieldMenuOpen,
    setFieldMenuOpen,
    isReorderModalOpen,
    setIsReorderModalOpen,
    isLinkModalOpen,
    setIsLinkModalOpen,
    isAddConditionModalOpen, // [NEW]
    setIsAddConditionModalOpen, // [NEW]
    dropdownWidths,
    setDropdownWidths,
    collapsed,
    toggleCollapse,
    fieldTypes,
    totalFieldCount,
    dropdownRefs,
    buttonRefs,
    fieldBlockRefs,
    sidebarRef,
    sectionBlockRefs,
    sectionMenuButtonRefs,
    sectionMenuPopoverRefs,
    logicEditorButtonRefs,
    logicEditorPanelRefs,
    conditionOpButtonRefs,
    conditionOpPanelRefs,
    conditionMenuButtonRefs,
    conditionMenuPanelRefs,
    fieldMenuButtonRefs,
    fieldMenuPanelRefs,
    linkModalRef,
    findFieldRecursive,
    updateFieldsRecursive,
    handleAddField,
    handleAddHeading,
    handleAddSection,
    handleDeleteField,
    handleAddFieldInsideSection,
    handleFieldPropChange,
    handleLabelChange,
    handleAddOption,
    handleOptionChange,
    handleRemoveOption,
    handleTypeChange,
    handleAddCondition,
    handleAddConditionWithData, // [NEW]
    // --- 👇 [CHANGE] Naya function pass karein ---
    handleToggleLogicEditor,
    handleDeleteCondition,
    handleConditionChange,
    handleAddFieldInsideCondition,
    handleToggleConditionCollapse,
    logicEnabledFieldTypes,
    handleToggleRequired,
    handleToggleDescription,
    handleDuplicateField,
    handleDragEnd,
    handleFieldDragStart,
    handleFieldDragOver,
    handleFieldDragEnd,
    // --- [NEW] Include new state in context value ---
    procedureName,
    setProcedureName,
    procedureDescription,
    setProcedureDescription,
  };

  return (
    <ProcedureBuilderContext.Provider value={contextValue}>
      {children}
    </ProcedureBuilderContext.Provider>
  );
}

// --- 4. Create Custom Hook ---
export function useProcedureBuilder() {
  const context = useContext(ProcedureBuilderContext);
  if (context === undefined) {
    throw new Error(
      "useProcedureBuilder must be used within a ProcedureBuilderProvider"
    );
  }
  return context;
}