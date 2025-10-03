import type { Dispatch, SetStateAction } from "react";

type ContactState = { email: string; phone: string; };
interface VendorContactInputProps { contact: ContactState; setContact: Dispatch<SetStateAction<ContactState>>; showInputs: boolean; setShowInputs: Dispatch<SetStateAction<boolean>>; }

export function VendorContactInput({ contact, setContact, showInputs, setShowInputs }: VendorContactInputProps) {
  return (
    <div className="px-6 pt-6">
      <label className="block text-base font-medium text-gray-700">Contact List</label>
      <button type="button" onClick={() => setShowInputs((prev) => !prev)} className="mt-2 inline-flex h-8 w-fit items-center rounded border border-gray-300 bg-white px-2 py-1 text-sm font-normal text-orange-600 transition-all duration-150 hover:border-gray-400 hover:bg-gray-50">+ New Contact</button>
      {showInputs && (<div className="mt-4 flex flex-col gap-2"><input type="email" placeholder="Email" className="rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500" value={contact.email} onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))} /><input type="tel" placeholder="Phone" className="rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500" value={contact.phone} onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))} /></div>)}
    </div>
  );
}