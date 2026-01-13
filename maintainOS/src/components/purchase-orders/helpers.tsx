import type { Address } from "./po.types";

/* -------------------------------- Helpers -------------------------------- */
// ✅ FIXED: Changed to Indian Rupee (INR)
export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    isFinite(n) ? n : 0
  );

export const addressToLine = (a?: Address) =>
  a ? `${a.street}, ${a.city}, ${a.stateProvince}, ${a.ZIP}, ${a.country}` : "-";

export function cryptoId() {
  // tiny id generator that works in browser/node without extra deps
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 10);
}