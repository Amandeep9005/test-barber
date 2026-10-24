"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { formatCents, toCents } from "@/lib/money";
import {
  BARBER_COOKIE,
  barberCookieOptions,
  requireSession,
} from "@/lib/session";

export type SaleResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function readId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

export async function createSale(formData: FormData): Promise<SaleResult> {
  await requireSession();

  const barberId = readId(formData.get("barberId"));
  const serviceId = readId(formData.get("serviceId"));
  const payment = String(formData.get("payment") ?? "");

  if (!barberId) return { ok: false, error: "Choose a barber." };
  if (!serviceId) return { ok: false, error: "Choose a service." };
  if (payment !== "cash" && payment !== "card") {
    return { ok: false, error: "Choose cash or card." };
  }

  let priceCents: number;
  let tipCents: number;
  try {
    priceCents = toCents(String(formData.get("price") ?? ""));
    const tipRaw = String(formData.get("tip") ?? "").trim();
    tipCents = tipRaw === "" ? 0 : toCents(tipRaw);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Enter an amount like 25 or 25.50.";
    return { ok: false, error: message };
  }

  if (priceCents < 0 || tipCents < 0) {
    return { ok: false, error: "Amounts can't be negative." };
  }

  const barbers = await sql`
    SELECT id, name
    FROM barbers
    WHERE id = ${barberId} AND active = TRUE
  `;
  const services = await sql`
    SELECT id, name
    FROM services
    WHERE id = ${serviceId} AND active = TRUE
  `;
  const barber = barbers[0];
  const service = services[0];
  if (!barber) return { ok: false, error: "That barber isn't available." };
  if (!service) return { ok: false, error: "That service isn't available." };

  await sql`
    INSERT INTO sales (barber_id, service_id, price_cents, tip_cents, payment_method)
    VALUES (${barberId}, ${serviceId}, ${priceCents}, ${tipCents}, ${payment})
  `;

  const jar = await cookies();
  jar.set(BARBER_COOKIE, String(barberId), barberCookieOptions());

  revalidatePath("/today");
  revalidatePath("/report");

  return {
    ok: true,
    message: `Saved: ${barber.name}, ${service.name}, ${formatCents(priceCents)} + ${formatCents(tipCents)} tip, ${payment}`,
  };
}

export async function rememberBarber(barberId: number) {
  await requireSession();
  if (!Number.isInteger(barberId) || barberId < 1) return;
  const jar = await cookies();
  jar.set(BARBER_COOKIE, String(barberId), barberCookieOptions());
}

export async function deleteSale(id: number) {
  await requireSession();
  if (!Number.isInteger(id) || id < 1) return;

  await sql`DELETE FROM sales WHERE id = ${id}`;
  revalidatePath("/today");
  revalidatePath("/report");
}
