"use client";
import * as React from "react";
import type { NewItem } from "../inventory.types";
import { PartPicturesInput } from "./PartPicturesInput";

export function PartBasicDetails({
  newItem,
  setNewItem,
}: {
  newItem: NewItem;
  setNewItem: React.Dispatch<React.SetStateAction<NewItem>>;
}) {
  return (
    <section className="space-y-8">
      {/* Part Name */}
      <input
        type="text"
        placeholder="Enter Part Name"
        value={newItem.name || ""}
        onChange={(e) => setNewItem((s) => ({ ...s, name: e.target.value }))}
        className="w-full border-0 border-b border-gray-300 focus:border-orange-500 focus:ring-0 text-lg text-gray-700 placeholder-gray-400 px-0 py-2 outline-none transition-all"
      />

      {/* Pictures */}
      <PartPicturesInput
        files={newItem.pictures || []}
        setFiles={(files) => setNewItem((s) => ({ ...s, pictures: files }))}
      />


      {/* Unit Cost */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Unit Cost
        </label>
        <input
          type="number"
          value={newItem.unitCost || ""}
          onChange={(e) =>
            setNewItem((s) => ({ ...s, unitCost: Number(e.target.value) }))
          }
          placeholder="Enter cost"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Description
        </label>
        <textarea
          value={newItem.description || ""}
          onChange={(e) =>
            setNewItem((s) => ({ ...s, description: e.target.value }))
          }
          placeholder="Add a description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </section>
  );
}
