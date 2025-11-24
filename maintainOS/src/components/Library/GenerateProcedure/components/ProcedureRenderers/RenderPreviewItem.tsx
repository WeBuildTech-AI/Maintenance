import React, { memo } from "react";
import { PreviewField } from "./PreviewField";
import { PreviewSection } from "./PreviewSection";
import type { RenderItemProps } from "../ProcedureFormTypes";

export const RenderPreviewItem = memo(function RenderPreviewItem(props: RenderItemProps) {
  const { item } = props;

  let blockType = item.blockType;
  if (!blockType) {
    if (item.sectionName) blockType = "section";
    else if (item.text || item.fieldType === "heading") blockType = "heading";
    else blockType = "field";
  }

  switch (blockType) {
    case "field": return <PreviewField {...props} />;
    case "section": return <PreviewSection {...props} />;
    case "heading":
      return (
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginTop: "16px", paddingBottom: "8px" }}>
          {item.text || item.label || item.fieldName}
        </h3>
      );
    default:
      return null;
  }
});