"use client";

import { type FormEvent, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { type NewItem } from "../inventory.types";

export function LocationFormDialog({
    newItem,
    setNewItem,
}: {
    newItem: NewItem;
    setNewItem: React.Dispatch<React.SetStateAction<NewItem>>;
}) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        name: "",
        area: "",
        unitInStock: "",
        minInStock: "",
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        const newLocation = {
            locationId: crypto.randomUUID(),
            locationName: form.name,
            area: form.area,
            unitInStock: form.unitInStock,
            minInStock: form.minInStock,
        };

        setNewItem((prev) => ({
            ...prev,
            locations: [...(prev.locations || []), newLocation],
        }));

        setForm({ name: "", area: "", unitInStock: "", minInStock: "" });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* ✅ Proper Trigger Button */}
            <DialogTrigger asChild>
                <Button
                    variant="link"
                    size="sm"
                    className="px-0 text-black font-medium"
                >
                    + Add Location
                </Button>
            </DialogTrigger>

            {/* Modal */}
            <DialogContent className="max-w-md bg-white rounded-xl shadow-lg z-[9999]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Add New Location
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                    {/* Location Name */}
                    <div className="flex flex-col gap-2 mt-4">
                        <Label className="text-sm font-medium text-gray-900">
                            Location Name
                        </Label>
                        <Input
                            className="bg-gray-50 border border-yellow-200 rounded-md focus:ring-yellow-400 focus:border-yellow-400 placeholder:text-gray-400"
                            placeholder="Enter location name"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Area */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-gray-900">Area</Label>
                        <Input
                            className="bg-gray-50 border border-yellow-200 rounded-md focus:ring-yellow-400 focus:border-yellow-400 placeholder:text-gray-400"
                            placeholder="Enter area"
                            value={form.area}
                            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                        />
                    </div>

                    {/* Stock Inputs */}
                    <div className="grid grid-cols-2 gap-x-6">
                        <div className="flex flex-col gap-2 mr-2">
                            <Label className="text-sm font-medium text-gray-900">
                                Units in Stock
                            </Label>
                            <Input
                                type="number"
                                className="bg-gray-50 border border-yellow-200 rounded-md focus:ring-yellow-400 focus:border-yellow-400 placeholder:text-gray-400"
                                placeholder="Enter units"
                                value={form.unitInStock}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, unitInStock: e.target.value }))
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-medium text-gray-900">
                                Minimum in Stock
                            </Label>
                            <Input
                                type="number"
                                className="bg-gray-50 border border-yellow-200 rounded-md focus:ring-yellow-400 focus:border-yellow-400 placeholder:text-gray-400"
                                placeholder="Enter minimum"
                                value={form.minInStock}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, minInStock: e.target.value }))
                                }
                            />
                        </div>
                    </div>


                    {/* Footer Buttons */}
                    <DialogFooter className="flex justify-end gap-3 pt-4 pb-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border border-yellow-400 text-gray-900 font-medium hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="border border-yellow-400 text-gray-900 font-medium bg-white hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400"
                        >
                            Add Location
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
