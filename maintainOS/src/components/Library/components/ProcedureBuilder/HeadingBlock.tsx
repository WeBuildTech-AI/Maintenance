import { FieldData } from "./types";

interface HeadingBlockProps {
  field: FieldData;
  onUpdate: (id: number, updates: Partial<FieldData>) => void;
}

export default function HeadingBlock({ field, onUpdate }: HeadingBlockProps) {
  return (
    <div key={field.id} className="mb-6">
      {field.isEditing ? (
        <input
          type="text"
          placeholder="Heading Title"
          value={field.label || ""}
          onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          onBlur={() => onUpdate(field.id, { isEditing: false })}
          className="w-full bg-transparent border-b border-gray-200 text-gray-700 text-lg font-medium placeholder-gray-400 outline-none py-1 focus:border-blue-400"
        />
      ) : (
        <h3
          className="text-gray-800 text-lg font-semibold cursor-pointer"
          onClick={() => onUpdate(field.id, { isEditing: true })}
        >
          {field.label || "Heading Title"}
        </h3>
      )}
    </div>
  );
}
