import { FieldData } from "../types";
import { HeadingBlock } from "./HeadingBlock";
import { SectionBlock } from "./SectionBlock";
import { FieldBlock } from "./FieldBlock";

interface ProcedureBlockProps {
  field: FieldData;
  index: number;
  parentSectionId?: number;
  isNested?: boolean;
}

export function ProcedureBlock({
  field,
  index,
  parentSectionId,
  isNested,
}: ProcedureBlockProps) {
  if (field.blockType === "heading") {
    return <HeadingBlock field={field} />;
  }

  if (field.blockType === "section") {
    return <SectionBlock field={field} />;
  }

  // Default is 'field'
  return (
    <FieldBlock
      field={field}
      parentSectionId={parentSectionId}
      isNested={isNested}
    />
  );
}