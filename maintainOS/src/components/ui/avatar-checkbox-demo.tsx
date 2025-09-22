"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { AvatarCheckbox } from "./avatar-checkbox";

const PEOPLE = [
  { id: "1", name: "Rita Kumar" },
  { id: "2", name: "Lauren Ortiz" },
  { id: "3", name: "Marcus Green" },
];

export function AvatarCheckboxDemo() {
  const [selected, setSelected] = React.useState<string[]>(["1"]);

  const handleToggle = (id: string) => (checked: boolean) => {
    setSelected((prev) => {
      if (checked) {
        return [...new Set([...prev, id])];
      }
      return prev.filter((value) => value !== id);
    });
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Avatar Checkbox Prototype</CardTitle>
        <CardDescription>
          Hover to reveal the checkbox state. Click to select or deselect an avatar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          {PEOPLE.map((person) => (
            <div key={person.id} className="flex flex-col items-center gap-2">
              <AvatarCheckbox
                name={person.name}
                checked={selected.includes(person.id)}
                onCheckedChange={handleToggle(person.id)}
              />
              <span className="text-sm font-medium text-slate-600">{person.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
