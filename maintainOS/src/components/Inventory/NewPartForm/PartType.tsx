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
  // Dummy options
  const DUMMY_PART_TYPES: PartSelectOption[] = [
    { id: "normal", name: "Normal" },
    { id: "critical", name: "Critical" },
    { id: "non_critical", name: "Non-Critical" },
  ];

  const [typeOptions, setTypeOptions] = React.useState<PartSelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  // Fetch options (simulate async)
  const fetchTypeOptions = React.useCallback(() => {
    if (typeOptions.length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setTypeOptions(DUMMY_PART_TYPES); // ✅ show all
      setLoading(false);
    }, 400);
  }, [typeOptions.length]);

  const handleSelect = (val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setNewItem((s: any) => ({ ...s, partsType: id ? [id] : [] }));
  };

  const selectedType = Array.isArray(newItem.partsType)
    ? newItem.partsType[0] ?? ""
    : "";

  return (
    <section className="flex flex-col gap-2 max-w-sm mt-6">
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">
        Part Type
      </label>
      <PartDynamicSelect
        options={typeOptions}
        value={selectedType}
        onSelect={handleSelect}
        onFetch={fetchTypeOptions}
        loading={loading}
        placeholder="Select Part Type"
        name="part_type"
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
      />
    </section>
  );
};

export default PartType;
