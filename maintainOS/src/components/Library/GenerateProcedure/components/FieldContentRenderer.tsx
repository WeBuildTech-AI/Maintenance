import {
  Calendar,
  CheckSquare,
  GripVertical,
  Gauge,
  X,
  ChevronDown,
} from "lucide-react";
import { useProcedureBuilder } from "../ProcedureBuilderContext";
import { FieldData } from "../types";

interface FieldContentRendererProps {
  field: FieldData;
  isEditing: boolean;
  parentSectionId?: number;
}

export function FieldContentRenderer({
  field,
  isEditing,
  parentSectionId,
}: FieldContentRendererProps) {
  const {
    handleFieldPropChange,
    handleOptionChange,
    handleRemoveOption,
    handleAddOption,
  } = useProcedureBuilder();

  const ReadingPlaceholder = ({
    unit,
    className,
  }: {
    unit?: string;
    className?: string;
  }) => (
    <div className={`relative ${className}`}>
      <textarea
        placeholder="Reading will be entered here"
        disabled
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 italic placeholder-gray-400 resize-none h-24 bg-gray-50 cursor-not-allowed"
      />
      {unit && (
        <span className="absolute top-3 right-4 text-gray-500 font-medium text-sm">
          {unit}
        </span>
      )}
    </div>
  );

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
          disabled
          className="mt-3 w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 cursor-not-allowed"
        />
      );

    case "Number Field":
      return (
        <textarea
          placeholder="Number will be entered here"
          disabled
          className="mt-3 w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 italic placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 cursor-not-allowed"
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
            disabled
            className="w-full border border-gray-200 rounded-md px-3 py-2 pl-7 text-sm text-gray-600 italic placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 cursor-not-allowed"
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
                      handleOptionChange(field.id, index, e.target.value)
                    }
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => handleRemoveOption(field.id, index)}
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
              onClick={() => handleAddOption(field.id)}
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
        <div className="w-full border border-dashed border-yellow-400 rounded-md mt-3">
          <div className="bg-white text-gray-600 text-center py-4 rounded-md">
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
            disabled
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 cursor-not-allowed"
          />
          <Calendar
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      );

    case "Meter Reading":
      if (isEditing) {
        return (
          <div className="mt-3 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Select Meter
              </label>
              <div className="flex items-center border border-gray-200 rounded-md px-3 py-1.5 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                <Gauge size={20} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Start typing..."
                  value={field.selectedMeter || ""}
                  onChange={(e) =>
                    handleFieldPropChange(
                      field.id,
                      "selectedMeter",
                      e.target.value
                    )
                  }
                  className="flex-1 p-0 border-none outline-none text-sm text-gray-800 placeholder-gray-400"
                />
                {field.selectedMeter && (
                  <button
                    onClick={() =>
                      handleFieldPropChange(field.id, "selectedMeter", "")
                    }
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
                <ChevronDown size={16} className="text-gray-500 ml-2" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Unit
              </label>
              <input
                type="text"
                placeholder="e.g., Feet, kWh, Volts"
                value={field.meterUnit || ""}
                onChange={(e) =>
                  handleFieldPropChange(field.id, "meterUnit", e.target.value)
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <ReadingPlaceholder unit={field.meterUnit} className="mt-2" />
          </div>
        );
      } else {
        return (
          <>
            {field.selectedMeter && (
              <p className="text-blue-600 text-sm mb-3">
                {field.selectedMeter}
              </p>
            )}
            <ReadingPlaceholder unit={field.meterUnit} className="mt-2" />
          </>
        );
      }

    default:
      return null;
  }
}