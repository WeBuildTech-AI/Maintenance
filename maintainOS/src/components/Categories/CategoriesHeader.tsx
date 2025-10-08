import React from "react";
import { Button } from "../ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "../ui/input";

const CategoriesHeader = ({ setNewFormCategories }) => {
  return (
    <header className=" border-border bg-card px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex item-center gap-6">
            <h1 className="text-2xl font-semibold">Categories</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative border-orange-600 focus:border-orange-600  ">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600" />
            <Input
              placeholder="Search Locations "
              className="w-96 pl-9 bg-white border-orange-600  "
              // value={searchQuery}
              // onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="gap-2 cursor-pointer bg-orange-600 hover:outline-none"
            onClick={() => {
              setNewFormCategories(true); // 👈 Function call without 'true'
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Categories
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CategoriesHeader;
