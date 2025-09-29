import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { StepBack } from "lucide-react";
import { useNavigate } from "react-router-dom";

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-orange-500",
];

export default function CreateTeamForm() {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [teamColor, setTeamColor] = useState(colors[0]);
  const [escalation, setEscalation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      teamName,
      description,
      teamColor,
      escalation,
    });
  };

  const navigate = useNavigate();

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white rounded-md shadow p-6 space-y-6"
    >
      <header className="border-border bg-card px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {/* Clickable header row */}
            <div
              onClick={() => navigate(-1)}
              className="flex items-center gap-4 cursor-pointer select-none"
            >
              <StepBack className="h-4 w-4" /> {/* smaller icon */}
              <h1 className="text-2xl font-semibold">Create Team</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Avatar placeholder */}
      <div className="flex justify-center">
        <div className="relative h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer">
          <span className="text-blue-600 text-2xl">📷</span>
        </div>
      </div>

      {/* Team Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Team Name <span className="text-red-500">(Required)</span>
        </label>
        <Input
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          placeholder="What's this group about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none"
        />
      </div>

      {/* Team Colors */}
      <div>
        <label className="block text-sm font-medium mb-2">Team Color</label>
        <div className="flex gap-3">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={`h-6 w-6 rounded-full ${c} border-2 ${
                teamColor === c ? "border-black" : "border-transparent"
              }`}
              onClick={() => setTeamColor(c)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" className="text-blue-600">
          Cancel
        </Button>
        <Button type="submit" className="bg-orange-600" disabled={!teamName}>
          Create Team
        </Button>
      </div>
    </form>
  );
}
