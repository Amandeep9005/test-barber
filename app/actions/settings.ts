"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { toCents } from "@/lib/money";
import { requireSession } from "@/lib/session";

export type SettingsResult = { ok: true } | { ok: false; error: string };

function readId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/report");
  revalidatePath("/settings");
}

export async function addBarber(formData: FormData): Promise<SettingsResult> {
  await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Enter a name." };
  if (name.length > 80) return { ok: false, error: "That name is too long." };

  await sql`INSERT INTO barbers (name) VALUES (${name})`;
  refresh();
  return { ok: true };
}

export async function setBarberActive(formData: FormData) {
  await requireSession();
  const id = readId(formData.get("id"));
  if (!id) return;
  const active = String(formData.get("active") ?? "") === "true";
  await sql`UPDATE barbers SET active = ${active} WHERE id = ${id}`;
  refresh();
}

export async function addService(formData: FormData): Promise<SettingsResult> {
  await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Enter a name." };
  if (name.length > 80) return { ok: false, error: "That name is too long." };

  let priceCents: number;
  try {
    priceCents = toCents(String(formData.get("price") ?? ""));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enter an amount like 25 or 25.50.";
    return { ok: false, error: message };
  }

  await sql`
    INSERT INTO services (name, default_price_cents)
    VALUES (${name}, ${priceCents})
  `;
  refresh();
  return { ok: true };
}

export async function updateServicePrice(
  formData: FormData,
): Promise<SettingsResult> {
  await requireSession();
  const id = readId(formData.get("id"));
  if (!id) return { ok: false, error: "That service wasn't found." };

  let priceCents: number;
  try {
    priceCents = toCents(String(formData.get("price") ?? ""));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enter an amount like 25 or 25.50.";
    return { ok: false, error: message };
  }

  const updated = await sql`
    UPDATE services
    SET default_price_cents = ${priceCents}
    WHERE id = ${id}
    RETURNING id
  `;
  if (!updated[0]) return { ok: false, error: "That service wasn't found." };

  refresh();
  return { ok: true };
}

export async function setServiceActive(formData: FormData) {
  await requireSession();
  const id = readId(formData.get("id"));
  if (!id) return;
  const active = String(formData.get("active") ?? "") === "true";
  await sql`UPDATE services SET active = ${active} WHERE id = ${id}`;
  refresh();
}
