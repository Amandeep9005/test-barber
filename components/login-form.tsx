"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-base font-semibold">PIN</span>
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          required
          className="min-h-14 rounded-2xl border border-steel/60 bg-paper px-4 text-center text-3xl tracking-[0.3em] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pole"
        />
      </label>
      {state?.error ? (
        <p role="alert" className="text-lg font-medium text-pole">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-14 rounded-2xl bg-ink text-lg font-semibold text-paper disabled:opacity-40"
      >
        {pending ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
