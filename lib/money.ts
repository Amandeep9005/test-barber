export function toCents(input: string): number {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("Enter an amount like 25 or 25.50.");
  }

  const [dollars, fraction = ""] = cleaned.split(".");
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) {
    throw new Error("That amount is too large.");
  }
  return cents;
}

export function formatCents(cents: number): string {
  const negative = cents < 0;
  const absolute = Math.abs(Math.trunc(cents));
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  return `${negative ? "-" : ""}$${dollars}.${String(remainder).padStart(2, "0")}`;
}

export function centsToInput(cents: number): string {
  const absolute = Math.abs(Math.trunc(cents));
  return `${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}

export function asCents(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.trunc(parsed);
}
