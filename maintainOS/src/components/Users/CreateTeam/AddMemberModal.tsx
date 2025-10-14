import { Search, X } from "lucide-react";
import React from "react";

interface AddMemberProps {
  handleCloseModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AddMemberModal: React.FC<AddMemberProps> = ({
  handleCloseModal,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex w-full items-center justify-center p-4 z-50"
    >
      <div className="bg-card rounded-lg shadow-md w-130 h-full flex flex-col ">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-normal text-foreground">
            Add Members to the Team
          </h2>
          <button
            onClick={handleCloseModal}
            aria-label="Close add members"
            className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search Input */}
          <div>
            <input
              type="text"
              placeholder="Start typing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-transparent text-foreground placeholder:text-muted-foreground bg-transparent"
            />
          </div>

          <div className="py-6 flex flex-col items-center justify-center">
            <div className="mb-2">
              <Search size={50} className="text-blue-400" strokeWidth={1.5} />
            </div>
            <p className="text-orange-600 text-sm font-normal">
              No one else to add.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            onClick={handleCloseModal}
            className="px-6 py-2 text-black bg-orange-600 cursor-pointer rounded-md font-normal transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
