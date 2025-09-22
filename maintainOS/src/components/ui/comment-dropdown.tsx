"use client";

import * as React from "react";
import { createPortal } from "react-dom";

// ---------- Dropdown Context ----------
type DropdownContextValue = {
  open: boolean;
  setOpen: (o: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdown(component: string) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error(`${component} must be used within <Dropdown>`);
  return ctx;
}

function Dropdown({ children }: { children: React.ReactNode }) {
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DropdownContext.Provider>
  );
}

function DropdownTrigger({ children }: { children: React.ReactNode }) {
  const { open, setOpen, triggerRef } = useDropdown("DropdownTrigger");
  return (
    <button
      ref={triggerRef as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={() => setOpen(!open)}
      className="px-4 py-2 rounded bg-orange-600 text-white"
    >
      {children}
    </button>
  );
}

function DropdownContent({ children }: { children: React.ReactNode }) {
  const { open, setOpen, triggerRef } = useDropdown("DropdownContent");
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      className="absolute bottom-16 right-4 w-[400px] p-4 bg-white border rounded-md shadow-lg"
    >
      {children}
    </div>,
    document.body
  );
}

// ---------- CommentDropdown Component ----------
export function CommentDropdown({
  onSend,
}: {
  onSend: (text: string, file?: File) => void;
}) {
  const [text, setText] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  return (
    <Dropdown>
      <DropdownTrigger>Comment</DropdownTrigger>
      <DropdownContent>
        <div className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your comment..."
            className="w-full min-h-[100px] border rounded p-2 text-sm"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <button
            onClick={() => {
              onSend(text, file || undefined);
              setText("");
              setFile(null);
            }}
            className="self-end px-4 py-2 rounded bg-green-600 text-white"
          >
            Send
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
