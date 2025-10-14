"use client";

export function PartHeader({ isEditing }: { isEditing: boolean }) {
  return (
    <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-gray-800">
        {isEditing ? "Edit Part" : "New Part"}
      </h2>
    </div>
  );
}