import { type FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { type Vendor } from "./vendors.types";

export function ContactFormDialog({
  vendor,
  setVendors,
}: {
  vendor: Vendor;
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendor.id
          ? {
              ...v,
              contacts: [
                ...v.contacts,
                { name: form.name, role: form.role, email: form.email, phone: form.phone, color: "#2563eb" },
              ],
            }
          : v
      )
    );

    setOpen(false);
    setForm({ name: "", role: "", email: "", phone: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="link" size="sm" className="px-0 text-primary" onClick={() => setOpen(true)}>
        + New Contact
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b p-6">
          <DialogTitle>New Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <DialogFooter className="border-t p-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Contact</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
