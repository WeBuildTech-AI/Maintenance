import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { FieldData, ConditionData, logicConditionTypes } from "./types";
import {
  Link2,
  Trash2,
  Plus,
  Type,
  Layout,
  FileText,
  Search,
  ChevronDown,
  Calendar,
  CheckSquare,
  Hash,
  DollarSign,
  ListChecks,
  Eye,
  MoreVertical,
  Radio,
  GripVertical,
  Gauge,
  X,
  Share2,
  Pencil,
  ChevronRight,
} from "lucide-react";
// --- NEW IMPORTS ---
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// --- 1. Define the Context Type (all state and handlers) ---
interface ProcedureBuilderContextType {
  fields: FieldData[];
  setFields: React.Dispatch<React.SetStateAction<FieldData[]>>;
  editingFieldId: number | null;
  setEditingFieldId: React.Dispatch<React.SetStateAction<number | null>>;
  dropdownOpen: number | null;
  setDropdownOpen: React.Dispatch<React.SetStateAction<number | null>>;
  editingSectionId: number | null;
  setEditingSectionId: React.Dispatch<React.SetStateAction<number | null>>;
  sectionMenuOpen: number | null;
  setSectionMenuOpen: React.Dispatch<React.SetStateAction<number | null>>;
  logicEditorOpen: number | null;
  setLogicEditorOpen: React.Dispatch<React.SetStateAction<number | null>>;
  conditionOperatorDropdownOpen: number | null;
  setConditionOperatorDropdownOpen: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  conditionMenuOpen: number | null;
  setConditionMenuOpen: React.Dispatch<React.SetStateAction<number | null>>;
  fieldMenuOpen: number | null;
  setFieldMenuOpen: React.Dispatch<React.SetStateAction<number | null>>;
  isReorderModalOpen: boolean; // <-- ADDED
  setIsReorderModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // <-- ADDED
  dropdownWidths: Record<number, number>;
  setDropdownWidths: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  collapsed: Record<number, boolean>;
  toggleCollapse: (id: number) => void;
  fieldTypes: { label: string; icon: ReactNode }[];

  // --- Refs ---
  dropdownRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  buttonRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  fieldBlockRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  sidebarRef: React.RefObject<HTMLDivElement>;
  sectionBlockRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  sectionMenuButtonRefs: React.MutableRefObject<
    Record<number, HTMLDivElement | null>
  >;
  sectionMenuPopoverRefs: React.MutableRefObject<
    Record<number, HTMLDivElement | null>
  >;
  logicEditorButtonRefs: React.MutableRefObject<
    Record<number, HTMLButtonElement | null>
  >;
  logicEditorPanelRefs: React.MutableRefObject<
    Record<number, HTMLDivElement | null>
  >;
  conditionOpButtonRefs: React.MutableRefObject<
    Record<number, HTMLButtonElement | null>
  >;
  conditionOpPanelRefs: React.MutableRefObject<
    Record<number, HTMLDivElement | null>
  >;
  conditionMenuButtonRefs: React.MutableRefObject<
    Record<number, HTMLButtonElement | null>
  >;
  conditionMenuPanelRefs: React.MutableRefObject<
    Record<number, HTMLDivElement | null>
  >;
  fieldMenuButtonRefs: React.MutableRefObject<
    Record<number, HTMLButtonElement | null>
  >;
  fieldMenuPanelRefs: React.MutableRefObject<
    Record<number, HTMLDivElement | null>
  >;

  // --- Handlers ---
  findFieldRecursive: (
    fieldsList: FieldData[],
    id: number
  ) => FieldData | undefined;
  updateFieldsRecursive: (
    fieldsList: FieldData[],
    updateFn: (field: FieldData) => FieldData
  ) => FieldData[];
  handleAddField: () => void;
  handleAddHeading: () => void;
  handleAddSection: () => void;
  handleDeleteField: (id: number) => void;
  handleAddFieldInsideSection: (sectionId: number) => void;
  handleFieldPropChange: (
    id: number,
    prop: keyof FieldData,
    value: any
  ) => void;
  handleLabelChange: (id: number, value: string) => void;
  handleAddOption: (id: number) => void;
  handleOptionChange: (id: number, index: number, value: string) => void;
  handleRemoveOption: (id: number, index: number) => void;
  handleTypeChange: (id: number, newType: string) => void;
  handleAddCondition: (fieldId: number) => void;
  handleDeleteCondition: (fieldId: number, conditionId: number) => void;
  handleConditionChange: (
    fieldId: number,
    conditionId: number,
    prop: keyof ConditionData,
    value: any
  ) => void;
  handleAddFieldInsideCondition: (
    fieldId: number,
    conditionId: number
  ) => void;
  handleToggleConditionCollapse: (fieldId: number, conditionId: number) => void;
  logicEnabledFieldTypes: string[];
  handleToggleRequired: (fieldId: number, isChecked: boolean) => void;
  handleToggleDescription: (fieldId: number) => void;
  handleDuplicateField: (fieldId: number) => void;
  handleDragEnd: (event: DragEndEvent) => void; // <-- ADDED
}

// --- 2. Create Context ---
const ProcedureBuilderContext = createContext<
  ProcedureBuilderContextType | undefined
>(undefined);

// --- 3. Create Provider Component ---
export function ProcedureBuilderProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState<FieldData[]>([
    {
      id: 1,
      selectedType: "Text Field",
      blockType: "field",
      label: "Field Name",
      selectedMeter: "fdxghjbkl;",
      meterUnit: "Feet",
      conditions: [],
      isRequired: false,
      hasDescription: false,
    },
    {
      id: 2,
      blockType: "section",
      label: "Section #1",
      description: "",
      fields: [
        {
          id: 3,
          selectedType: "Text Field",
          blockType: "field",
          label: "New Field",
          conditions: [],
          isRequired: false,
          hasDescription: false,
        },
      ],
    },
  ]);

  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionMenuOpen, setSectionMenuOpen] = useState<number | null>(null);
  const [logicEditorOpen, setLogicEditorOpen] = useState<number | null>(null);
  const [conditionOperatorDropdownOpen, setConditionOperatorDropdownOpen] =
    useState<number | null>(null);
  const [conditionMenuOpen, setConditionMenuOpen] = useState<number | null>(
    null
  );
  const [fieldMenuOpen, setFieldMenuOpen] = useState<number | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false); // <-- ADDED
  const [dropdownWidths, setDropdownWidths] = useState<Record<number, number>>(
    {}
  );
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const buttonRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const fieldBlockRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
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
  const conditionMenuPanelRefs = useRef<Record<number, HTMLDivElement | null>>(
    {}
  );
  const fieldMenuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>(
    {}
  );
  const fieldMenuPanelRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
      if (isOutsideDropdowns && isOutsideButtons) {
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
          !sidebarClicked
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

          if (!clickInsideLogicPanel && !clickOnLogicButton) {
            setEditingFieldId(null);
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
  ]);

  // --- Helper function to recursively update fields ---
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

  // --- Helper function to find a field recursively ---
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

  // --- HANDLERS ---

  const handleAddField = () => {
    const newId = Date.now();
    setFields([
      ...fields,
      {
        id: newId,
        selectedType: "Text Field",
        blockType: "field",
        label: "New Field",
        isRequired: false,
        hasDescription: false,
      },
    ]);
    setEditingFieldId(newId);
    setDropdownOpen(null);
  };

  const handleAddHeading = () => {
    const newId = Date.now();
    setFields([
      ...fields,
      {
        id: newId,
        selectedType: "Heading",
        blockType: "heading",
        label: "New Heading",
      },
    ]);
    setEditingFieldId(newId);
    setDropdownOpen(null);
  };

  const handleAddSection = () => {
    const newId = Date.now();
    const newSubFieldId = newId + 1;
    const sectionNumber =
      fields.filter((f) => f.blockType === "section").length + 1;
    setFields([
      ...fields,
      {
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
      },
    ]);
    setEditingSectionId(newId);
    setEditingFieldId(null);
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
          return {
            ...field,
            selectedType: newType,
            options: [],
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

  // --- NEW: DND-Kit Drag Handler ---
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


  // --- 5. Provide Context Value ---
  const contextValue: ProcedureBuilderContextType = {
    fields,
    setFields,
    editingFieldId,
    setEditingFieldId,
    dropdownOpen,
    setDropdownOpen,
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
    isReorderModalOpen, // <-- ADDED
    setIsReorderModalOpen, // <-- ADDED
    dropdownWidths,
    setDropdownWidths,
    collapsed,
    toggleCollapse,
    fieldTypes,
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
    handleDeleteCondition,
    handleConditionChange,
    handleAddFieldInsideCondition,
    handleToggleConditionCollapse,
    logicEnabledFieldTypes,
    handleToggleRequired,
    handleToggleDescription,
    handleDuplicateField,
    handleDragEnd, // <-- ADDED
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