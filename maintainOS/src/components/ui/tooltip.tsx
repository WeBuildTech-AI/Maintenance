import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

export function Tooltip({ children, text }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    // 👇 Tooltip will appear BELOW the icon
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10, // 10px below icon
    });

    setVisible(true);
  };

  const hideTooltip = () => setVisible(false);

  return (
    <>
      <div
        ref={ref}
        style={{ display: "inline-flex" }}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.y,
              left: pos.x,
              transform: "translateX(-50%)",
              background: "#1f2937",
              padding: "6px 12px",
              color: "#fff",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "nowrap",
              zIndex: 999999999,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {text}

            {/* Arrow pointing UP (since tooltip is below icon) */}
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "6px solid #1f2937",
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}
