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
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={onCreate}>Create</Button>
            </div>
        </div>

    );
}
