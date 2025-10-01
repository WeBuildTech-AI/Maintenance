"use client";

import { useState } from "react";

export default function InvitePanel({ setPanel }: { setPanel: (p: any) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleInvite = () => {
    if (email && name) {
      console.log("✅ Inviting:", { email, name });
      setEmail("");
      setName("");
      setPanel("form"); // back to form after invite
    }
  };

  const handleCancel = () => {
    setEmail("");
    setName("");
    setPanel("form"); // go back to form
  };

  return (
    <div className="relative w-full h-full bg-white flex flex-col">
      {/* Content */}
      <div className="p-8 flex-1 overflow-y-auto">
        {/* Email Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@example.com"
            className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Name Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Name"
            className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Footer - pinned at bottom */}
      <div className="border-t px-8 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          We'll send an invite to join your account.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={!email || !name}
            style={{
              padding: "8px 24px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: email && name ? "pointer" : "not-allowed",
              backgroundColor: email && name ? "#1f2937" : "#e5e7eb", // gray-900 vs gray-200
              color: email && name ? "#ffffff" : "#6b7280", // white vs gray-500
              border: "none",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (email && name) e.currentTarget.style.backgroundColor = "#111827"; // darker gray
            }}
            onMouseLeave={(e) => {
              if (email && name) e.currentTarget.style.backgroundColor = "#1f2937";
            }}
          >
            Invite and Assign
          </button>

        </div>
      </div>
    </div>
  );
}
