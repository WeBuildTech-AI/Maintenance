"use client";
import { Button } from "../../ui/button";
import { Paperclip } from "lucide-react";

export function PartFilesSection() {
  return (
    <section className="space-y-2 mt-6">
      <h3 className="text-sm font-semibold text-gray-800">Files</h3>
      <Button className="gap-2 h-9 bg-white hover:bg-orange-50 text-orange-600 border border-orange-300">
        <Paperclip className="h-4 w-4" />
        Attach files
      </Button>
    </section>
  );
}
