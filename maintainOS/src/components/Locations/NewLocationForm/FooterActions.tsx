"use client";

import { Button } from "../../ui/button";

type FooterActionsProps = {
  onCancel: () => void;
  onCreate: () => void;
};

export function FooterActions({ onCancel, onCreate }: FooterActionsProps) {
  return (
    <div className="flex border-t p-4 flex-none">
      <div className="ml-auto flex gap-2">
        <Button
          className="gap-2 bg-white cursor-pointer text-orange-600 border border-orange-600 hover:bg-orange-50"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button className="gap-2 cursor-pointer bg-orange-600 hover:bg-orange-700" onClick={onCreate}>Create</Button>
      </div>
    </div>
  );
}
