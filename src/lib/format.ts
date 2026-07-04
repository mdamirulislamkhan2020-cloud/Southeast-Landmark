/**
 * Formatting helpers used across public pages. Kept dependency-free so any
 * component (not just admin) can safely import them.
 */

export function formatBdtShort(value: number, currency = "BDT"): string {
  if (!value || Number.isNaN(value)) return "";
  const symbol = currency === "BDT" ? "৳" : currency;
  if (value >= 10_000_000) return `${symbol} ${(value / 10_000_000).toFixed(value % 10_000_000 === 0 ? 0 : 2)} Cr`;
  if (value >= 100_000) return `${symbol} ${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 2)} Lac`;
  if (value >= 1_000) return `${symbol} ${value.toLocaleString("en-IN")}`;
  return `${symbol} ${value}`;
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}