"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createSale, rememberBarber } from "@/app/actions/sales";
import { centsToInput, formatCents } from "@/lib/money";

type Barber = { id: number; name: string };
type Service = { id: number; name: string; defaultPriceCents: number };

const choice =
  "min-h-14 rounded-2xl border px-4 py-3 text-left text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pole";

export function SaleForm({
  barbers,
  services,
  initialBarberId,
}: {
  barbers: Barber[];
  services: Service[];
  initialBarberId: number | null;
}) {
  const [barberId, setBarberId] = useState<number | null>(initialBarberId);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [tip, setTip] = useState("0");
  const [payment, setPayment] = useState<"cash" | "card" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function chooseBarber(id: number) {
    setBarberId(id);
    setNotice(null);
    void rememberBarber(id);
  }

  function chooseService(service: Service) {
    setServiceId(service.id);
    setPrice(centsToInput(service.defaultPriceCents));
    setNotice(null);
    setError(null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!barberId || !serviceId || !payment || pending) return;
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await createSale(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(result.message);
      setServiceId(null);
      setPrice("");
      setTip("0");
      setPayment(null);
    });
  }

  const ready = Boolean(barberId && serviceId && payment);
  const tipCentsPreview = tip === "5" || tip === "10" || tip === "15" ? tip : null;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Log sale</h1>

      {notice ? (
        <p
          role="status"
          className="rounded-2xl bg-mint-bg px-4 py-3 text-lg font-medium text-mint"
        >
          {notice}
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-base font-semibold">Barber</legend>
        {barbers.length === 0 ? (
          <p className="text-lg text-steel">
            No active barbers. Add one in Settings.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {barbers.map((barber) => {
              const selected = barberId === barber.id;
              return (
                <button
                  key={barber.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseBarber(barber.id)}
                  className={`${choice} ${
                    selected
                      ? "border-pole bg-pole text-white"
                      : "border-steel/60 bg-paper text-ink"
                  }`}
                >
                  {barber.name}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-base font-semibold">Service</legend>
        {services.length === 0 ? (
          <p className="text-lg text-steel">
            No active services. Add one in Settings.
          </p>
        ) : (
          <div className="grid gap-3">
            {services.map((service) => {
              const selected = serviceId === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseService(service)}
                  className={`${choice} flex items-center justify-between gap-3 ${
                    selected
                      ? "border-pole bg-pole text-white"
                      : "border-steel/60 bg-paper text-ink"
                  }`}
                >
                  <span>{service.name}</span>
                  <span className="tabular-nums">
                    {formatCents(service.defaultPriceCents)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-base font-semibold">Price</span>
        <input
          name="price"
          inputMode="decimal"
          autoComplete="off"
          value={price}
          onChange={(event) => {
            setPrice(event.target.value);
            setNotice(null);
            setError(null);
          }}
          className="min-h-14 rounded-2xl border border-steel/60 bg-paper px-4 text-3xl tabular-nums text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pole"
        />
      </label>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-base font-semibold">Tip</span>
          <input
            name="tip"
            inputMode="decimal"
            autoComplete="off"
            value={tip}
            onChange={(event) => {
              setTip(event.target.value);
              setNotice(null);
              setError(null);
            }}
            className="min-h-14 rounded-2xl border border-steel/60 bg-paper px-4 text-3xl tabular-nums text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pole"
          />
        </label>
        <div className="grid grid-cols-3 gap-3">
          {["5", "10", "15"].map((amount) => {
            const selected = tipCentsPreview === amount;
            return (
              <button
                key={amount}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setTip(amount);
                  setNotice(null);
                }}
                className={`min-h-12 rounded-2xl border text-lg font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pole ${
                  selected
                    ? "border-pole bg-pole text-white"
                    : "border-steel/60 bg-paper text-ink"
                }`}
              >
                ${amount}
              </button>
            );
          })}
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-base font-semibold">Payment</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["cash", "card"] as const).map((method) => {
            const selected = payment === method;
            return (
              <button
                key={method}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setPayment(method);
                  setNotice(null);
                  setError(null);
                }}
                className={`${choice} text-center capitalize ${
                  selected
                    ? "border-pole bg-pole text-white"
                    : "border-steel/60 bg-paper text-ink"
                }`}
              >
                {method}
              </button>
            );
          })}
        </div>
      </fieldset>

      <input type="hidden" name="barberId" value={barberId ?? ""} />
      <input type="hidden" name="serviceId" value={serviceId ?? ""} />
      <input type="hidden" name="payment" value={payment ?? ""} />

      {error ? (
        <p role="alert" className="text-lg font-medium text-pole">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!ready || pending}
        className="min-h-14 rounded-2xl bg-pole px-4 text-lg font-semibold text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {pending ? "Saving…" : "Save sale"}
      </button>
    </form>
  );
}
