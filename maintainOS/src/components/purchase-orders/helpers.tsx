import type { Address } from "./po.types";

/* -------------------------------- Helpers -------------------------------- */
export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    isFinite(n) ? n : 0
  );

export const addressToLine = (a?: Address) =>
  a ? `${a.line1}, ${a.city}, ${a.state}, ${a.postalCode}, ${a.country}` : "-";

export function cryptoId() {
  // tiny id generator that works in browser/node without extra deps
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 10);
}