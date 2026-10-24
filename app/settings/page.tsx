import { connection } from "next/server";
import { BarberSettings, ServiceSettings } from "@/components/settings-forms";
import { sql } from "@/lib/db";
import { asCents } from "@/lib/money";
import { requireSession } from "@/lib/session";

export default async function SettingsPage() {
  await connection();
  await requireSession();

  const [barberRows, serviceRows] = await Promise.all([
    sql`
      SELECT id, name, active
      FROM barbers
      ORDER BY active DESC, name
    `,
    sql`
      SELECT id, name, default_price_cents, active
      FROM services
      ORDER BY active DESC, name
    `,
  ]);

  const barbers = barberRows.map((row) => ({
    id: asCents(row.id),
    name: String(row.name),
    active: row.active === true,
  }));
  const services = serviceRows.map((row) => ({
    id: asCents(row.id),
    name: String(row.name),
    defaultPriceCents: asCents(row.default_price_cents),
    active: row.active === true,
  }));

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <BarberSettings barbers={barbers} />
      <ServiceSettings services={services} />
    </div>
  );
}
