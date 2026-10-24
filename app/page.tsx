import { cookies } from "next/headers";
import { connection } from "next/server";
import { SaleForm } from "@/components/sale-form";
import { sql } from "@/lib/db";
import { asCents } from "@/lib/money";
import { BARBER_COOKIE, requireSession } from "@/lib/session";

export default async function HomePage() {
  await connection();
  await requireSession();

  const [barberRows, serviceRows, jar] = await Promise.all([
    sql`SELECT id, name FROM barbers WHERE active = TRUE ORDER BY id`,
    sql`
      SELECT id, name, default_price_cents
      FROM services
      WHERE active = TRUE
      ORDER BY id
    `,
    cookies(),
  ]);

  const barbers = barberRows.map((row) => ({
    id: asCents(row.id),
    name: String(row.name),
  }));
  const services = serviceRows.map((row) => ({
    id: asCents(row.id),
    name: String(row.name),
    defaultPriceCents: asCents(row.default_price_cents),
  }));
  const remembered = asCents(jar.get(BARBER_COOKIE)?.value);
  const initialBarberId = barbers.some((barber) => barber.id === remembered)
    ? remembered
    : null;

  return (
    <SaleForm
      barbers={barbers}
      services={services}
      initialBarberId={initialBarberId}
    />
  );
}
