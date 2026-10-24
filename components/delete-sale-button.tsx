"use client";

import { useState, useTransition } from "react";
import { deleteSale } from "@/app/actions/sales";

export function DeleteSaleButton({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-12 shrink-0 rounded-xl px-3 text-base font-medium text-pole underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pole"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <p className="text-right text-base">Delete this sale? This can&apos;t be undone.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="min-h-12 rounded-xl border border-steel/60 px-4 text-base font-medium"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await deleteSale(id);
            });
          }}
          className="min-h-12 rounded-xl bg-pole px-4 text-base font-semibold text-white disabled:opacity-40"
        >
          {pending ? "Deleting…" : "Delete sale"}
        </button>
      </div>
    </div>
  );
}
