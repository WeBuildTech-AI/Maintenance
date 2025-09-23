"use client";

import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { SearchWithDropdown } from "./SearchWithDropdown"; // Import your search component

export function NewLocationForm({ onCancel, onCreate }) {
    // Handle search functions
    const handleTeamsSearch = (searchValue) => {
        console.log("Searching teams:", searchValue);
        // Add your teams search logic here
    };

    const handleTeamsFilter = (filter) => {
        console.log("Teams filter:", filter);
        // Add your teams filter logic here
    };

    const handleVendorsSearch = (searchValue) => {
        console.log("Searching vendors:", searchValue);
        // Add your vendors search logic here
    };

    const handleVendorsFilter = (filter) => {
        console.log("Vendors filter:", filter);
        // Add your vendors filter logic here
    };

    const handleParentLocationSearch = (searchValue) => {
        console.log("Searching parent locations:", searchValue);
        // Add your parent location search logic here
    };

    const handleParentLocationFilter = (filter) => {
        console.log("Parent location filter:", filter);
        // Add your parent location filter logic here
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header (Fixed) */}
            <div className="p-4 border-b flex-none">
                <h2 className="text-lg font-semibold">New Location</h2>
            </div>

            {/* Scrollable Middle Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
                <div className="space-y-1">
                    <input
                        type="text"
                        placeholder="Enter Location Name"
                        className="w-full px-0 py-2 text-gray-400 placeholder-gray-400 bg-transparent border-0 border-b-4 border-blue-500 focus:outline-none"
                    />
                </div>

                <div className="border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer">
                    <Upload className="mx-auto mb-2 h-6 w-6" />
                    <p>Add or drag pictures</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                        Address
                    </label>
                    <input
                        type="text"
                        placeholder="Enter address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                        Description
                    </label>
                    <textarea
                        placeholder="Add a description"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                </div>
                {/* Replace Teams input with SearchWithDropdown */}
                <div>
                    <SearchWithDropdown
                        title="Teams in Charge"
                        placeholder="Start typing..."
                        dropdownOptions={["All Teams", "Development", "Marketing", "Operations", "Sales"]}
                        onSearch={handleTeamsSearch}
                        onDropdownSelect={handleTeamsFilter}
                        className="mb-0"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                        QR Code/Barcode
                    </label>
                    <input
                        type="text"
                        placeholder="Enter or scan code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">or</span>
                        <button className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer underline">
                            Generate Code
                        </button>
                    </div>
                </div>
                <div>
                    <label className="font-medium">Files</label>
                    <Button variant="outline">Attach files</Button>
                </div>

                {/* Replace Vendors input with SearchWithDropdown */}
                <div>
                    <SearchWithDropdown
                        title="Vendors"
                        placeholder="Start typing..."
                        dropdownOptions={["All Vendors", "Active", "Inactive", "Preferred", "New"]}
                        onSearch={handleVendorsSearch}
                        onDropdownSelect={handleVendorsFilter}
                        className="mb-0"
                    />
                </div>

                {/* Replace Parent Location input with SearchWithDropdown */}
                <div>
                    <SearchWithDropdown
                        title="Parent Location"
                        placeholder="Start typing..."
                        dropdownOptions={["All Locations", "Buildings", "Floors", "Rooms", "Areas"]}
                        onSearch={handleParentLocationSearch}
                        onDropdownSelect={handleParentLocationFilter}
                        className="mb-0"
                    />
                </div>
            </div>

            {/* Footer (Fixed) */}
            <div className="flex justify-end gap-2 border-t p-4 flex-none">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={onCreate}>Create</Button>
            </div>
        </div>
    );
}