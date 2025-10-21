"use client";

import React from "react";
import { PartDynamicSelect, type PartSelectOption } from "./PartDynamicSelect";

const PartType = ({
  newItem,
  setNewItem,
}: {
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const DUMMY_PART_TYPES: PartSelectOption[] = [
    { id: "normal", name: "Normal" },
    { id: "critical", name: "Critical" },
    { id: "non_critical", name: "Non-Critical" },
  ];

  const [typeOptions, setTypeOptions] = React.useState<PartSelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [selectedTypeLabel, setSelectedTypeLabel] = React.useState<string>("");

  const fetchTypeOptions = React.useCallback(() => {
    if (typeOptions.length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setTypeOptions(DUMMY_PART_TYPES);
      setLoading(false);

      if (newItem.partsType?.length) {
        const matched = DUMMY_PART_TYPES.find(
          (opt) => opt.id === newItem.partsType[0]
        );
        if (matched) setSelectedTypeLabel(matched.name);
      }
    }, 400);
  }, [typeOptions.length, newItem.partsType]);

  const handleSelect = (val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setNewItem((s: any) => ({ ...s, partsType: id ? [id] : [] }));
    const matched = typeOptions.find((opt) => opt.id === id);
    if (matched) setSelectedTypeLabel(matched.name);
  };

  const selectedType = Array.isArray(newItem.partsType)
    ? newItem.partsType[0] ?? ""
    : "";

  const mergedTypeOptions = React.useMemo(() => {
    if (!selectedType || typeOptions.some((opt) => opt.id === selectedType)) {
      return typeOptions;
    }
    return [
      { id: selectedType, name: selectedTypeLabel || "Selected (Pending)" },
      ...typeOptions,
    ];
  }, [typeOptions, selectedType, selectedTypeLabel]);

  return (
    <section className="flex flex-col gap-2 max-w-sm mt-6">
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">
        Part Type
      </label>
      <PartDynamicSelect
        options={mergedTypeOptions}
        value={selectedType}
        onSelect={handleSelect}
        onFetch={fetchTypeOptions}
        loading={loading}
        placeholder={selectedTypeLabel || "Select Part Type"}
        name="part_type"
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
      />
    </section>
  );
};

export default PartType;
