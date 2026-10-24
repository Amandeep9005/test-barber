import { connection } from "next/server";
import { ReportControls } from "@/components/report-controls";
import { sql } from "@/lib/db";
import {
  formatShopDate,
  formatShopTime,
  isShopDate,
  shiftDate,
  shopTimeZone,
  shopToday,
} from "@/lib/dates";
import { asCents, formatCents } from "@/lib/money";
import { requireSession } from "@/lib/session";

type SummaryRow = {
  barber_id: number | string | null;
  barber_name: string | null;
  clients: number | string;
  sales_cents: number | string;
  tips_cents: number | string;
  cash_cents: number | string;
  card_cents: number | string;
  total_cents: number | string;
};

type SaleRow = {
  id: number | string;
  price_cents: number | string;
  tip_cents: number | string;
  payment_method: string;
  created_at: string;
  barber_name: string;
  service_name: string;
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await connection();
  await requireSession();

  const params = await searchParams;
  const today = shopToday();
  const date =
    params.date && isShopDate(params.date) ? params.date : today;
  const timeZone = shopTimeZone();

  const summaryRows = (await sql`
    SELECT *
    FROM (
      SELECT
        b.id AS barber_id,
        b.name AS barber_name,
        COUNT(*)::int AS clients,
        COALESCE(SUM(s.price_cents), 0)::int AS sales_cents,
        COALESCE(SUM(s.tip_cents), 0)::int AS tips_cents,
        COALESCE(SUM(CASE WHEN s.payment_method = 'cash' THEN s.price_cents + s.tip_cents ELSE 0 END), 0)::int AS cash_cents,
        COALESCE(SUM(CASE WHEN s.payment_method = 'card' THEN s.price_cents + s.tip_cents ELSE 0 END), 0)::int AS card_cents,
        COALESCE(SUM(s.price_cents + s.tip_cents), 0)::int AS total_cents
      FROM sales s
      JOIN barbers b ON b.id = s.barber_id
      WHERE s.created_at >= (${date}::date)::timestamp AT TIME ZONE ${timeZone}
        AND s.created_at < (${date}::date + 1)::timestamp AT TIME ZONE ${timeZone}
      GROUP BY GROUPING SETS ((b.id, b.name), ())
    ) summary
    ORDER BY (barber_id IS NULL), total_cents DESC, barber_name
  `) as SummaryRow[];

  const saleRows = (await sql`
    SELECT
      s.id,
      s.price_cents,
      s.tip_cents,
      s.payment_method,
      s.created_at,
      b.name AS barber_name,
      sv.name AS service_name
    FROM sales s
    JOIN barbers b ON b.id = s.barber_id
    JOIN services sv ON sv.id = s.service_id
    WHERE s.created_at >= (${date}::date)::timestamp AT TIME ZONE ${timeZone}
      AND s.created_at < (${date}::date + 1)::timestamp AT TIME ZONE ${timeZone}
    ORDER BY s.created_at DESC, s.id DESC
  `) as SaleRow[];

  const lines = summaryRows.map((row) => ({
    id: row.barber_id == null ? null : asCents(row.barber_id),
    name: row.barber_id == null ? "Shop total" : String(row.barber_name),
    clients: asCents(row.clients),
    salesCents: asCents(row.sales_cents),
    tipsCents: asCents(row.tips_cents),
    cashCents: asCents(row.cash_cents),
    cardCents: asCents(row.card_cents),
    totalCents: asCents(row.total_cents),
  }));
  const barberLines = lines.filter((line) => line.id !== null);
  const shopTotal = lines.find((line) => line.id === null) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Report</h1>
        <p className="mt-1 text-lg">{formatShopDate(date)}</p>
      </div>

      <ReportControls
        date={date}
        today={today}
        previous={shiftDate(date, -1)}
        next={shiftDate(date, 1)}
        yesterday={shiftDate(today, -1)}
      />

      {barberLines.length === 0 ? (
        <p className="text-lg">No sales on this date.</p>
      ) : (
        <>
          <div className="max-md:hidden overflow-x-auto print:block">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-steel/60 text-sm text-steel">
                  <th className="py-2 pr-3 font-medium">Barber</th>
                  <th className="py-2 pr-3 text-right font-medium">Clients</th>
                  <th className="py-2 pr-3 text-right font-medium">Sales</th>
                  <th className="py-2 pr-3 text-right font-medium">Tips</th>
                  <th className="py-2 pr-3 text-right font-medium">Cash</th>
                  <th className="py-2 pr-3 text-right font-medium">Card</th>
                  <th className="py-2 text-right font-medium">Total (sales + tips)</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {barberLines.map((line) => (
                  <tr key={line.id} className="border-b border-steel/30">
                    <td className="py-3 pr-3 font-medium">{line.name}</td>
                    <td className="py-3 pr-3 text-right">{line.clients}</td>
                    <td className="py-3 pr-3 text-right">
                      {formatCents(line.salesCents)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatCents(line.tipsCents)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatCents(line.cashCents)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatCents(line.cardCents)}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {formatCents(line.totalCents)}
                    </td>
                  </tr>
                ))}
                {shopTotal ? (
                  <tr className="font-semibold">
                    <td className="py-3 pr-3">Shop total</td>
                    <td className="py-3 pr-3 text-right">{shopTotal.clients}</td>
                    <td className="py-3 pr-3 text-right">
                      {formatCents(shopTotal.salesCents)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatCents(shopTotal.tipsCents)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatCents(shopTotal.cashCents)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatCents(shopTotal.cardCents)}
                    </td>
                    <td className="py-3 text-right">
                      {formatCents(shopTotal.totalCents)}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden print:hidden">
            {barberLines.map((line) => (
              <article
                key={line.id}
                className="rounded-2xl border border-steel/50 px-4 py-3"
              >
                <h2 className="text-lg font-semibold">{line.name}</h2>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-base tabular-nums">
                  <dt className="text-steel">Clients</dt>
                  <dd className="text-right">{line.clients}</dd>
                  <dt className="text-steel">Sales</dt>
                  <dd className="text-right">{formatCents(line.salesCents)}</dd>
                  <dt className="text-steel">Tips</dt>
                  <dd className="text-right">{formatCents(line.tipsCents)}</dd>
                  <dt className="text-steel">Cash</dt>
                  <dd className="text-right">{formatCents(line.cashCents)}</dd>
                  <dt className="text-steel">Card</dt>
                  <dd className="text-right">{formatCents(line.cardCents)}</dd>
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-right text-lg font-semibold">
                    {formatCents(line.totalCents)}
                  </dd>
                </dl>
              </article>
            ))}
            {shopTotal ? (
              <article className="rounded-2xl bg-ink px-4 py-3 text-paper">
                <h2 className="text-lg font-semibold">Shop total</h2>
                <dl className="mt-2 grid grid-cols-2 gap-y-1 tabular-nums">
                  <dt>Clients</dt>
                  <dd className="text-right">{shopTotal.clients}</dd>
                  <dt>Sales</dt>
                  <dd className="text-right">{formatCents(shopTotal.salesCents)}</dd>
                  <dt>Tips</dt>
                  <dd className="text-right">{formatCents(shopTotal.tipsCents)}</dd>
                  <dt>Cash</dt>
                  <dd className="text-right">{formatCents(shopTotal.cashCents)}</dd>
                  <dt>Card</dt>
                  <dd className="text-right">{formatCents(shopTotal.cardCents)}</dd>
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-right text-xl font-semibold">
                    {formatCents(shopTotal.totalCents)}
                  </dd>
                </dl>
              </article>
            ) : null}
          </div>

          <details className="rounded-2xl border border-steel/50 px-4 py-2">
            <summary className="min-h-12 cursor-pointer py-3 text-base font-semibold">
              Individual sales ({saleRows.length})
            </summary>
            <ul className="flex flex-col gap-3 pb-3">
              {saleRows.map((row) => (
                <li key={asCents(row.id)} className="border-t border-steel/30 pt-3">
                  <p className="text-steel">
                    {formatShopTime(row.created_at)} ·{" "}
                    {row.payment_method === "card" ? "Card" : "Cash"}
                  </p>
                  <p className="text-lg">
                    {row.barber_name} · {row.service_name}
                  </p>
                  <p className="tabular-nums">
                    {formatCents(asCents(row.price_cents))} +{" "}
                    {formatCents(asCents(row.tip_cents))} tip
                  </p>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}
