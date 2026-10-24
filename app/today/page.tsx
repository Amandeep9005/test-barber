import Link from "next/link";
import { connection } from "next/server";
import { DeleteSaleButton } from "@/components/delete-sale-button";
import { sql } from "@/lib/db";
import { formatShopTime, shopTimeZone, shopToday } from "@/lib/dates";
import { asCents, formatCents } from "@/lib/money";
import { requireSession } from "@/lib/session";

type SaleRow = {
  id: number | string;
  price_cents: number | string;
  tip_cents: number | string;
  payment_method: string;
  created_at: string;
  barber_id: number | string;
  barber_name: string;
  service_name: string;
};

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ barber?: string }>;
}) {
  await connection();
  await requireSession();

  const params = await searchParams;
  const date = shopToday();
  const timeZone = shopTimeZone();
  const requestedBarber = Number(params.barber);
  const filterId =
    Number.isInteger(requestedBarber) && requestedBarber > 0
      ? requestedBarber
      : null;

  const rows = (await sql`
    SELECT
      s.id,
      s.price_cents,
      s.tip_cents,
      s.payment_method,
      s.created_at,
      b.id AS barber_id,
      b.name AS barber_name,
      sv.name AS service_name
    FROM sales s
    JOIN barbers b ON b.id = s.barber_id
    JOIN services sv ON sv.id = s.service_id
    WHERE s.created_at >= (${date}::date)::timestamp AT TIME ZONE ${timeZone}
      AND s.created_at < (${date}::date + 1)::timestamp AT TIME ZONE ${timeZone}
    ORDER BY s.created_at DESC, s.id DESC
  `) as SaleRow[];

  const sales = rows.map((row) => ({
    id: asCents(row.id),
    priceCents: asCents(row.price_cents),
    tipCents: asCents(row.tip_cents),
    payment: row.payment_method,
    createdAt: row.created_at,
    barberId: asCents(row.barber_id),
    barberName: row.barber_name,
    serviceName: row.service_name,
  }));

  const barbers = Array.from(
    new Map(sales.map((sale) => [sale.barberId, sale.barberName])).entries(),
  );
  const visible = filterId
    ? sales.filter((sale) => sale.barberId === filterId)
    : sales;
  const totalSales = visible.reduce((sum, sale) => sum + sale.priceCents, 0);
  const totalTips = visible.reduce((sum, sale) => sum + sale.tipCents, 0);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Today</h1>

      <dl className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-steel/50 px-3 py-3">
          <dt className="text-sm text-steel">Sales</dt>
          <dd className="text-xl font-semibold tabular-nums">{visible.length}</dd>
        </div>
        <div className="rounded-2xl border border-steel/50 px-3 py-3">
          <dt className="text-sm text-steel">Total sales</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {formatCents(totalSales)}
          </dd>
        </div>
        <div className="rounded-2xl border border-steel/50 px-3 py-3">
          <dt className="text-sm text-steel">Total tips</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {formatCents(totalTips)}
          </dd>
        </div>
      </dl>

      {barbers.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          <Link
            href="/today"
            className={`inline-flex min-h-12 shrink-0 items-center rounded-full px-4 text-base font-medium ${
              filterId === null ? "bg-pole text-white" : "border border-steel/60"
            }`}
          >
            All
          </Link>
          {barbers.map(([id, name]) => (
            <Link
              key={id}
              href={`/today?barber=${id}`}
              className={`inline-flex min-h-12 shrink-0 items-center rounded-full px-4 text-base font-medium ${
                filterId === id ? "bg-pole text-white" : "border border-steel/60"
              }`}
            >
              {name}
            </Link>
          ))}
        </div>
      ) : null}

      {sales.length === 0 ? (
        <p className="text-lg">
          No sales yet today.{" "}
          <Link href="/" className="font-semibold text-pole underline">
            Log the first one.
          </Link>
        </p>
      ) : visible.length === 0 ? (
        <p className="text-lg">
          No sales for this barber today.{" "}
          <Link href="/today" className="font-semibold text-pole underline">
            Show everyone.
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((sale) => (
            <li
              key={sale.id}
              className="rounded-2xl border border-steel/50 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base text-steel">
                    {formatShopTime(sale.createdAt)} ·{" "}
                    {sale.payment === "card" ? "Card" : "Cash"}
                  </p>
                  <p className="text-lg font-medium">
                    {sale.barberName} · {sale.serviceName}
                  </p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatCents(sale.priceCents)}{" "}
                    <span className="text-base font-medium text-steel">
                      + {formatCents(sale.tipCents)} tip
                    </span>
                  </p>
                </div>
                <DeleteSaleButton id={sale.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
