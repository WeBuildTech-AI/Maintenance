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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Added lucide-react icons that were missing (Radio, GripVertical)
// You might need to add: npm install lucide-react

interface ProcedureBodyProps {
  name: string;
  description: string;
}

interface FieldData {
  id: number;
  selectedType: string;
  options?: string[];
  blockType: "field" | "heading" | "section";
  label: string;
  fields?: FieldData[];
}

export default function ProcedureBody({ name, description }: ProcedureBodyProps) {
  const [fields, setFields] = useState<FieldData[]>([
    {
      id: 1,
      selectedType: "Text Field",
      blockType: "field",
      label: "Field Name",
    },
  ]);

  const [editingFieldId, setEditingFieldId] = useState<number | null>(
    fields[0]?.id || null
  );
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // --- FIX 1: Changed from array [] to object {} ---
  // This lets us use the field's 'id' as a key (e.g., refs[1678886400000])
  // instead of a giant array index.
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const buttonRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const fieldTypes = [
    { label: "Checkbox", icon: <CheckSquare size={16} color="#3b82f6" /> },
    { label: "Text Field", icon: <FileText size={16} color="#10b981" /> },
    { label: "Number Field", icon: <Hash size={16} color="#f59e0b" /> },
    { label: "Amount ($)", icon: <DollarSign size={16} color="#ef4444" /> },
    { label: "Multiple Choice", icon: <Radio size={16} color="#ef4444" /> },
    { label: "Checklist", icon: <ListChecks size={16} color="#6366f1" /> },
    { label: "Inspection Check", icon: <Eye size={16} color="#06b6d4" /> },
    { label: "Yes, No, N/A", icon: <CheckSquare size={16} color="#eab308" /> },
    { label: "Picture/File Field", icon: <FileText size={16} color="#22c55e" /> },
    { label: "Signature Block", icon: <FileText size={16} color="#ec4899" /> },
    { label: "Date", icon: <Calendar size={16} color="#2563eb" /> },
  ];

  // close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // --- FIX 2: Changed from .every() to Object.values().every() ---
      // This correctly loops over the keys of our new ref *object*
      const isOutsideDropdowns = Object.values(dropdownRefs.current).every(
        (ref) => !ref || !ref.contains(event.target as Node)
      );
      const isOutsideButtons = Object.values(buttonRefs.current).every(
        (ref) => !ref || !ref.contains(event.target as Node)
      );

      if (isOutsideDropdowns && isOutsideButtons) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLER UPDATES ---

  const handleAddField = () => {
    const newId = Date.now();
    setFields([
      ...fields,
      {
        id: newId,
        selectedType: "Text Field",
        blockType: "field",
        label: "New Field",
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
        fields: [
          {
            id: newSubFieldId,
            selectedType: "Text Field",
            blockType: "field",
            label: "New Field",
          },
        ],
      },
    ]);
    setEditingFieldId(newSubFieldId);
    setDropdownOpen(null);
  };

  const handleDeleteField = (id: number) => {
    const deleteRecursive = (fieldsList: FieldData[]): FieldData[] => {
      const filtered = fieldsList.filter((f) => f.id !== id);
      if (filtered.length === fieldsList.length) {
        return fieldsList.map((f) => {
          if (f.blockType === "section" && f.fields) {
            return { ...f, fields: deleteRecursive(f.fields) };
          }
          return f;
        });
      }
      return filtered;
    };

    setFields((prev) => deleteRecursive(prev));

    // --- FIX 3: Clean up refs on delete to prevent memory leaks ---
    if (dropdownRefs.current[id]) {
      delete dropdownRefs.current[id];
    }
    if (buttonRefs.current[id]) {
      delete buttonRefs.current[id];
    }
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
                },
              ],
            }
          : s
      )
    );
    setEditingFieldId(newId);
    setDropdownOpen(null);
  };

  const handleLabelChange = (
    id: number,
    value: string,
    parentSectionId?: number
  ) => {
    const updateField = (field: FieldData): FieldData => {
      if (field.id === id) {
        return { ...field, label: value };
      }
      if (field.id === parentSectionId && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      if (!parentSectionId && field.blockType === "section" && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      return field;
    };
    setFields((prev) => prev.map(updateField));
  };

  const handleAddOption = (id: number, parentSectionId?: number) => {
    const updateField = (field: FieldData): FieldData => {
      if (field.id === id) {
        return {
          ...field,
          options: [
            ...(field.options || []),
            `Option ${field.options?.length ? field.options.length + 1 : 1}`,
          ],
        };
      }
      if (field.id === parentSectionId && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      if (!parentSectionId && field.blockType === "section" && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      return field;
    };
    setFields((prev) => prev.map(updateField));
  };

  const handleOptionChange = (
    id: number,
    index: number,
    value: string,
    parentSectionId?: number
  ) => {
    const updateField = (field: FieldData): FieldData => {
      if (field.id === id) {
        return {
          ...field,
          options: field.options?.map((opt, i) => (i === index ? value : opt)),
        };
      }
      if (field.id === parentSectionId && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      if (!parentSectionId && field.blockType === "section" && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      return field;
    };
    setFields((prev) => prev.map(updateField));
  };

  const handleRemoveOption = (
    id: number,
    index: number,
    parentSectionId?: number
  ) => {
    const updateField = (field: FieldData): FieldData => {
      if (field.id === id) {
        return {
          ...field,
          options: field.options?.filter((_, i) => i !== index),
        };
      }
      if (field.id === parentSectionId && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      if (!parentSectionId && field.blockType === "section" && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      return field;
    };
    setFields((prev) => prev.map(updateField));
  };

  const handleTypeChange = (
    id: number,
    newType: string,
    parentSectionId?: number
  ) => {
    const updateField = (field: FieldData): FieldData => {
      if (field.id === id) {
        return { ...field, selectedType: newType, options: [] };
      }
      if (field.id === parentSectionId && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      if (!parentSectionId && field.blockType === "section" && field.fields) {
        return { ...field, fields: field.fields.map(updateField) };
      }
      return field;
    };
    setFields((prev) => prev.map(updateField));
    setDropdownOpen(null);
  };

  // --- FIELD CONTENT RENDERER ---
  const renderFieldContent = (
    field: FieldData,
    isEditing: boolean,
    parentSectionId?: number
  ) => {
    switch (field.selectedType) {
      case "Checkbox":
        return (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id={`cb-${field.id}`}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`cb-${field.id}`} className="text-gray-700">
              {field.label || "Checkbox"}
            </label>
          </div>
        );

      case "Text Field":
        return (
          <textarea
            placeholder="Text will be entered here"
            className="mt-3 w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        );

      case "Number Field":
        return (
          <textarea
            placeholder="Number will be entered here"
            className="mt-3 w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 italic placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        );

      case "Amount ($)":
        return (
          <div className="relative mt-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
            <textarea
              placeholder="Amount will be entered here"
              className="w-full border border-gray-200 rounded-md px-3 py-2 pl-7 text-sm text-gray-600 italic placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        );

      case "Multiple Choice":
      case "Checklist":
        const options = field.options?.length ? field.options : ["Option 1"];
        const type =
          field.selectedType === "Multiple Choice" ? "radio" : "checkbox";

        return (
          <div className="mt-3">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center mb-2 gap-2">
                {isEditing ? (
                  <>
                    <div className="text-gray-400 cursor-grab">
                      <GripVertical size={16} />
                    </div>
                    <input
                      type="text"
                      value={opt}
                      placeholder={`Option ${index + 1}`}
                      onChange={(e) =>
                        handleOptionChange(
                          field.id,
                          index,
                          e.target.value,
                          parentSectionId
                        )
                      }
                      className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                      onClick={() =>
                        handleRemoveOption(field.id, index, parentSectionId)
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type={type}
                      id={`opt-${field.id}-${index}`}
                      name={`group-${field.id}`}
                      className={`h-4 w-4 ${
                        type === "radio" ? "rounded-full" : "rounded"
                      } border-gray-300 text-blue-600 focus:ring-blue-500`}
                    />
                    <label
                      htmlFor={`opt-${field.id}-${index}`}
                      className="text-gray-700"
                    >
                      {opt}
                    </label>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => handleAddOption(field.id, parentSectionId)}
                className="text-blue-600 text-sm font-medium mt-1"
              >
                + Add Option
              </button>
            )}
          </div>
        );

      case "Inspection Check":
        return (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-green-600 font-medium cursor-pointer hover:bg-gray-50">
              Pass
            </div>
            <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-orange-500 font-medium cursor-pointer hover:bg-gray-50">
              Flag
            </div>
            <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-red-600 font-medium cursor-pointer hover:bg-gray-50">
              Fail
            </div>
          </div>
        );

      case "Yes, No, N/A":
        return (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-50">
              Yes
            </div>
            <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-50">
              No
            </div>
            <div className="flex items-center justify-center border border-gray-200 rounded-md py-2 text-blue-600 font-medium cursor-pointer hover:bg-gray-50">
              N/A
            </div>
          </div>
        );

      case "Picture/File Field":
        return (
          <div className="w-full border border-dashed border-gray-300 rounded-md mt-3">
            <div className="bg-gray-50 text-gray-400 italic text-center py-10 rounded-md">
              Assignees will add a Picture/File here
            </div>
          </div>
        );

      case "Signature Block":
        return (
          <div className="w-full border border-dashed border-gray-300 rounded-md mt-3">
            <div className="bg-gray-50 text-gray-400 italic text-center py-10 rounded-md">
              Assignees will sign here
            </div>
          </div>
        );

      case "Date":
        return (
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <Calendar
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // --- MAIN BLOCK RENDERER ---
  const renderBlock = (field: FieldData, index: number) => {
    const isEditing = editingFieldId === field.id;

    // --- HEADING BLOCK ---
    if (field.blockType === "heading") {
      return (
        <div
          key={field.id}
          className="mb-6"
          onClick={() => {
            setEditingFieldId(field.id);
            setDropdownOpen(null);
          }}
        >
          {isEditing ? (
            <input
              type="text"
              placeholder="Heading Title"
              value={field.label || ""}
              onChange={(e) => handleLabelChange(field.id, e.target.value)}
              onBlur={() => {
                // We don't auto-blur anymore, click-away handles this
              }}
              autoFocus
              className="w-full bg-transparent border-b border-gray-300 text-gray-700 text-lg font-medium placeholder-gray-400 outline-none py-1 focus:border-blue-400"
            />
          ) : (
            <h3 className="text-gray-800 text-lg font-semibold cursor-pointer py-1 border-b border-transparent">
              {field.label || "Heading Title"}
            </h3>
          )}
          {isEditing && (
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleDeleteField(field.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      );
    }

    // --- SECTION BLOCK ---
    if (field.blockType === "section") {
      return (
        <div key={field.id} className="relative mb-8">
          {/* Section line and icon */}
          <div className="absolute left-0 top-4 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
              <Layout size={16} />
            </div>
            <div className="flex-1 w-px bg-gray-400 mt-1 mb-1"></div>
            <div className="w-2 h-2 rotate-45 bg-gray-400"></div>
          </div>

          <div className="ml-12">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {field.label}
              </h3>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* --- Section's inner fields --- */}
            {field.fields?.map((subField) => {
              const isSubFieldEditing = editingFieldId === subField.id;

              return (
                <div
                  key={subField.id}
                  className={`border ${
                    isSubFieldEditing
                      ? "border-blue-400 bg-white"
                      : "border-gray-200 bg-gray-50 hover:bg-white"
                  } rounded-lg p-4 mb-6 relative cursor-pointer`}
                  onClick={() => {
                    !isSubFieldEditing && setEditingFieldId(subField.id);
                    setDropdownOpen(null);
                  }}
                >
                  {isSubFieldEditing ? (
                    // --- EDIT MODE HEADER (Nested) ---
                    <div className="flex gap-3 mb-2 relative">
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={subField.label || ""}
                        onChange={(e) =>
                          handleLabelChange(
                            subField.id,
                            e.target.value,
                            field.id
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-[260px]"
                      />
                      <div
                        className="relative"
                        // Here we use the subField.id as the key for the ref
                        ref={(el) => (dropdownRefs.current[subField.id] = el)}
                      >
                        <div
                          ref={(el) => (buttonRefs.current[subField.id] = el)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(
                              dropdownOpen === subField.id ? null : subField.id
                            );
                          }}
                          className={`flex items-center border ${
                            dropdownOpen === subField.id
                              ? "border-blue-400 ring-1 ring-blue-200"
                              : "border-gray-200"
                          } rounded-md px-3 py-2 justify-between cursor-pointer bg-white hover:border-blue-400 transition w-[260px]`}
                        >
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Search size={16} className="text-gray-400" />
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                {
                                  fieldTypes.find(
                                    (f) => f.label === subField.selectedType
                                  )?.icon
                                }
                              </div>
                              <span>{subField.selectedType}</span>
                            </div>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-gray-500 transition-transform ${
                              dropdownOpen === subField.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        {dropdownOpen === subField.id && (
                          <div
                            className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-md z-50 w-full"
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {fieldTypes.map((type) => (
                              <div
                                key={type.label}
                                onClick={() => {
                                  handleTypeChange(
                                    subField.id,
                                    type.label,
                                    field.id
                                  );
                                }}
                                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                                  subField.selectedType === type.label
                                    ? "bg-blue-50 text-blue-700"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    subField.selectedType === type.label
                                      ? "bg-blue-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  {type.icon}
                                </div>
                                <span>{type.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-800 mb-2">
                      {subField.label || "Field Name"}
                    </p>
                  )}

                  <div onClick={(e) => isSubFieldEditing && e.stopPropagation()}>
                    {renderFieldContent(subField, isSubFieldEditing, field.id)}
                  </div>

                  {isSubFieldEditing && (
                    <div
                      className="flex justify-between items-center mt-4 text-gray-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-4">
                        <button className="hover:text-blue-600">
                          <Link2 size={18} />
                        </button>
                        <button className="hover:text-blue-600">
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteField(subField.id)}
                          className="hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Required</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                          <div className="absolute left-[2px] top-[2px] bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-4"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => handleAddFieldInsideSection(field.id)}
              className="text-blue-600 text-sm font-medium"
            >
              + Add Field
            </button>
          </div>
        </div>
      );
    }

    // --- REGULAR FIELD BLOCK ---
    return (
      <div
        key={field.id}
        className={`border ${
          isEditing
            ? "border-blue-400 bg-white"
            : "border-gray-200 bg-gray-50 hover:bg-white"
        } rounded-lg p-4 mb-6 relative cursor-pointer`}
        onClick={() => {
          !isEditing && setEditingFieldId(field.id);
          setDropdownOpen(null);
        }}
      >
        {isEditing ? (
          // --- EDIT MODE HEADER (Top-level) ---
          <div className="flex gap-3 mb-2 relative">
            <input
              type="text"
              placeholder="Field Name"
              value={field.label || ""}
              onChange={(e) => handleLabelChange(field.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-[260px]"
            />
            <div
              className="relative"
              // Here we use the field.id as the key for the ref
              ref={(el) => (dropdownRefs.current[field.id] = el)}
            >
              <div
                ref={(el) => (buttonRefs.current[field.id] = el)}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(dropdownOpen === field.id ? null : field.id);
                }}
                className={`flex items-center border ${
                  dropdownOpen === field.id
                    ? "border-blue-400 ring-1 ring-blue-200"
                    : "border-gray-200"
                } rounded-md px-3 py-2 justify-between cursor-pointer bg-white hover:border-blue-400 transition w-[260px]`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Search size={16} className="text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      {
                        fieldTypes.find((f) => f.label === field.selectedType)
                          ?.icon
                      }
                    </div>
                    <span>{field.selectedType}</span>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    dropdownOpen === field.id ? "rotate-180" : ""
                  }`}
                />
              </div>
              {dropdownOpen === field.id && (
                <div
                  className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-md z-50 w-full"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {fieldTypes.map((type) => (
                    <div
                      key={type.label}
                      onClick={() => handleTypeChange(field.id, type.label)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${
                        field.selectedType === type.label
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          field.selectedType === type.label
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {type.icon}
                      </div>
                      <span>{type.label}</span>
                    </div>
))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="font-medium text-gray-800 mb-2">
            {field.label || "Field Name"}
          </p>
        )}

        <div onClick={(e) => isEditing && e.stopPropagation()}>
          {renderFieldContent(field, isEditing)}
        </div>

        {isEditing && (
          <div
            className="flex justify-between items-center mt-4 text-gray-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-4">
              <button className="hover:text-blue-600">
                <Link2 size={18} />
              </button>
              <button className="hover:text-blue-600">
                <FileText size={18} />
              </button>
              <button
                onClick={() => handleDeleteField(field.id)}
                className="hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Required</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                <div className="absolute left-[2px] top-[2px] bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-4"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex flex-1 bg-gray-50">
      <div
        className="flex-1 overflow-y-auto px-8 py-8 flex justify-center items-start w-screen"
        style={{ marginRight: "90px" }}
      >
        <div className="flex-1 max-w-3xl bg-white rounded-lg shadow-sm p-10 self-start">
          <h2 className="text-2xl font-semibold mb-1">{name}</h2>
          <p className="text-gray-500 mb-6">{description}</p>

          {fields.map(renderBlock)}
        </div>
      </div>

      {/* Floating New Item */}
      <div
        style={{
          position: "fixed",
          right: "24px",
          bottom: "88px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "10px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          width: "85px",
          zIndex: 100,
        }}
      >
        <p className="text-gray-700 font-medium text-sm mb-1">New Item</p>

        <button
          onClick={handleAddField}
          className="flex flex-col items-center text-gray-800 text-sm font-medium hover:text-blue-600 transition-all mb-2"
        >
          <Plus size={20} color="#10b981" />
          <span className="mt-[2px]">Field</span>
        </button>

        <button
          onClick={handleAddHeading}
          className="flex flex-col items-center text-gray-800 text-sm font-medium hover:text-blue-600 transition-all mb-2"
        >
          <Type size={20} color="#2563eb" />
          <span className="mt-[2px]">Heading</span>
        </button>

        <button
          onClick={handleAddSection}
          className="flex flex-col items-center text-gray-800 text-sm font-medium hover:text-blue-600 transition-all mb-2"
        >
          <Layout size={20} color="#2563eb" />
          <span className="mt-[2px]">Section</span>
        </button>

        <button className="flex flex-col items-center text-gray-800 text-sm font-medium hover:text-blue-600 transition-all mb-2">
          <FileText size={20} color="#2563eb" />
          <span className="mt-[2px]">Procedure</span>
        </button>
      </div>
    </div>
  );
}