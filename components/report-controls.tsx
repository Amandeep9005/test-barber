"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function ReportControls({
  date,
  today,
  previous,
  next,
  yesterday,
}: {
  date: string;
  today: string;
  previous: string;
  next: string;
  yesterday: string;
}) {
  const router = useRouter();
  const nextDisabled = date >= today;
  const linkClass =
    "inline-flex min-h-12 items-center justify-center rounded-xl border border-steel/60 px-3 text-base font-medium";

  return (
    <div className="no-print flex flex-col gap-3">
      <input
        type="date"
        value={date}
        max={today}
        aria-label="Report date"
        onChange={(event) => {
          if (event.target.value) {
            router.push(`/report?date=${event.target.value}`);
          }
        }}
        className="min-h-12 w-full rounded-xl border border-steel/60 bg-paper px-3 text-base text-ink"
      />
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/report?date=${previous}`} className={linkClass}>
          Previous day
        </Link>
        {nextDisabled ? (
          <span className={`${linkClass} text-steel opacity-50`}>Next day</span>
        ) : (
          <Link href={`/report?date=${next}`} className={linkClass}>
            Next day
          </Link>
        )}
        <Link href={`/report?date=${yesterday}`} className={linkClass}>
          Yesterday
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ink px-4 text-base font-semibold text-paper"
        >
          Print
        </button>
      </div>
    </div>
  );
}
