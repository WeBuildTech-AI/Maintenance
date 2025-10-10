"use client";

import React from "react";
import { PartDynamicSelect } from "./PartDynamicSelect";


const PartType = () => {
  // Dummy Part Type options
  const DUMMY_PART_TYPES: PartSelectOption[] = [
    { id: "normal", name: "Normal" },
    { id: "critical", name: "Critical" },
    { id: "non_critical", name: "Non-Critical" },
  ];

  const [typeOptions, setTypeOptions] = React.useState<PartSelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<string>("");
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  // Fetch options (simulate async)
  const fetchTypeOptions = React.useCallback(() => {
    if (typeOptions.length > 0) return;
    setLoading(true);
    setTimeout(() => {
      // ✅ Only keep the “Critical” option
      const filtered = DUMMY_PART_TYPES.filter((t) => t.name === "Critical");
      setTypeOptions(filtered);
      setLoading(false);
    }, 400);
  }, [typeOptions.length]);

  const handleSelect = (val: string | string[]) => {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setSelectedType(id);
  };

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
