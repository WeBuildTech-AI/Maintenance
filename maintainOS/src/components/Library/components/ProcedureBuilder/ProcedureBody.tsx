import { Plus, Type, Layout, FileText, CheckSquare, Hash, DollarSign, ListChecks, Eye, Calendar } from "lucide-react";
import { useState } from "react";
import { FieldData, ProcedureBodyProps } from "./types";
import HeadingBlock from "./HeadingBlock";
import SectionBlock from "./SectionBlock";
import FieldBlock from "./FieldBlock";

export default function ProcedureBody({ name, description }: ProcedureBodyProps) {
  const [fields, setFields] = useState<FieldData[]>([]);

  const fieldTypes = [
    { label: "Checkbox", icon: <CheckSquare size={16} color="#3b82f6" /> },
    { label: "Text Field", icon: <FileText size={16} color="#10b981" /> },
    { label: "Number Field", icon: <Hash size={16} color="#f59e0b" /> },
    { label: "Amount ($)", icon: <DollarSign size={16} color="#ef4444" /> },
    { label: "Multiple Choice", icon: <ListChecks size={16} color="#ef4444" /> },
    { label: "Checklist", icon: <ListChecks size={16} color="#6366f1" /> },
    { label: "Inspection Check", icon: <Eye size={16} color="#06b6d4" /> },
    { label: "Date", icon: <Calendar size={16} color="#2563eb" /> },
  ];

  const addField = () =>
    setFields([...fields, { id: Date.now(), selectedType: "Text Field", blockType: "field" }]);

  const addHeading = () =>
    setFields([...fields, { id: Date.now(), blockType: "heading", isEditing: true }]);

  const addSection = () => {
    const num = fields.filter((f) => f.blockType === "section").length + 1;
    setFields([
      ...fields,
      {
        id: Date.now(),
        blockType: "section",
        label: `Section #${num}`,
        fields: [{ id: Date.now() + 1, selectedType: "Text Field", blockType: "field" }],
      },
    ]);
  };

  const updateField = (id: number, updates: Partial<FieldData>) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));

  const addFieldInside = (sectionId: number) =>
    setFields((prev) =>
      prev.map((f) =>
        f.id === sectionId && f.fields
          ? {
              ...f,
              fields: [
                ...f.fields,
                { id: Date.now(), selectedType: "Text Field", blockType: "field" },
              ],
            }
          : f
      )
    );

  const renderFieldContent = (field: FieldData) => {
    switch (field.selectedType) {
      case "Text Field":
        return (
          <textarea
            placeholder="Text will be entered here"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-1 bg-gray-50">
      <div className="flex-1 px-8 py-8 flex justify-center">
        <div className="flex-1 max-w-3xl bg-white rounded-lg shadow-sm p-10">
          <h2 className="text-2xl font-semibold mb-1">{name}</h2>
          <p className="text-gray-500 mb-6">{description}</p>

          {fields.map((field) => {
            if (field.blockType === "heading")
              return <HeadingBlock key={field.id} field={field} onUpdate={updateField} />;

            if (field.blockType === "section")
              return (
                <SectionBlock
                  key={field.id}
                  field={field}
                  fieldTypes={fieldTypes}
                  renderFieldContent={renderFieldContent}
                  onAddField={addFieldInside}
                  onTypeChange={(sid, fid, t) =>
                    setFields((prev) =>
                      prev.map((sec) =>
                        sec.id === sid
                          ? {
                              ...sec,
                              fields: sec.fields?.map((sf) =>
                                sf.id === fid ? { ...sf, selectedType: t } : sf
                              ),
                            }
                          : sec
                      )
                    )
                  }
                />
              );

            return (
              <FieldBlock
                key={field.id}
                field={field}
                fieldTypes={fieldTypes}
                onTypeChange={(t) => updateField(field.id, { selectedType: t })}
                renderFieldContent={renderFieldContent}
                onDelete={() => setFields((prev) => prev.filter((f) => f.id !== field.id))}
              />
            );
          })}
        </div>
      </div>

      <div className="fixed right-6 bottom-20 bg-white rounded-xl shadow-lg p-3 flex flex-col items-center gap-3 w-[85px]">
        <p className="text-gray-700 font-medium text-sm mb-1">New Item</p>

        <button onClick={addField} className="flex flex-col items-center text-gray-800 text-sm hover:text-blue-600">
          <Plus size={20} color="#10b981" />
          <span>Field</span>
        </button>

        <button onClick={addHeading} className="flex flex-col items-center text-gray-800 text-sm hover:text-blue-600">
          <Type size={20} color="#2563eb" />
          <span>Heading</span>
        </button>

        <button onClick={addSection} className="flex flex-col items-center text-gray-800 text-sm hover:text-blue-600">
          <Layout size={20} color="#2563eb" />
          <span>Section</span>
        </button>

        <button className="flex flex-col items-center text-gray-800 text-sm hover:text-blue-600">
          <FileText size={20} color="#2563eb" />
          <span>Procedure</span>
        </button>
      </div>
    </div>
  );
}
