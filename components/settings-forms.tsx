"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  addBarber,
  addService,
  setBarberActive,
  setServiceActive,
  updateServicePrice,
} from "@/app/actions/settings";
import { centsToInput, formatCents } from "@/lib/money";

type Barber = { id: number; name: string; active: boolean };
type Service = {
  id: number;
  name: string;
  defaultPriceCents: number;
  active: boolean;
};

const field =
  "min-h-12 w-full rounded-xl border border-steel/60 bg-paper px-3 text-lg text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pole";
const button =
  "inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-base font-semibold";

export function BarberSettings({ barbers }: { barbers: Barber[] }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await addBarber(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Barbers</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Barber name</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className={field}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className={`${button} bg-ink text-paper disabled:opacity-40`}
        >
          Add barber
        </button>
      </form>
      {error ? <p className="font-medium text-pole">{error}</p> : null}
      <ul className="flex flex-col gap-3">
        {barbers.length === 0 ? (
          <li className="text-lg text-steel">No barbers yet.</li>
        ) : (
          barbers.map((barber) => (
            <li
              key={barber.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-steel/50 px-4 py-3"
            >
              <div>
                <p className="text-lg font-medium">{barber.name}</p>
                {barber.active ? null : (
                  <p className="text-sm text-steel">Inactive</p>
                )}
              </div>
              <form action={setBarberActive}>
                <input type="hidden" name="id" value={barber.id} />
                <input
                  type="hidden"
                  name="active"
                  value={barber.active ? "false" : "true"}
                />
                <button
                  type="submit"
                  className={`${button} border border-steel/60`}
                >
                  {barber.active ? "Deactivate" : "Reactivate"}
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export function ServiceSettings({ services }: { services: Service[] }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await addService(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      setPrice("");
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Services</h2>
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
        <label>
          <span className="sr-only">Service name</span>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className={field}
          />
        </label>
        <label>
          <span className="sr-only">Default price</span>
          <input
            name="price"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="30.00"
            className={`${field} tabular-nums`}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className={`${button} bg-ink text-paper disabled:opacity-40`}
        >
          Add service
        </button>
      </form>
      {error ? <p className="font-medium text-pole">{error}</p> : null}
      <ul className="flex flex-col gap-3">
        {services.length === 0 ? (
          <li className="text-lg text-steel">No services yet.</li>
        ) : (
          services.map((service) => (
            <li
              key={service.id}
              className="flex flex-col gap-3 rounded-2xl border border-steel/50 px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-lg font-medium">{service.name}</p>
                <p className="text-lg tabular-nums">
                  {formatCents(service.defaultPriceCents)}
                </p>
              </div>
              {service.active ? null : (
                <p className="text-sm text-steel">Inactive</p>
              )}
              <ServicePriceForm
                id={service.id}
                price={centsToInput(service.defaultPriceCents)}
              />
              <form action={setServiceActive}>
                <input type="hidden" name="id" value={service.id} />
                <input
                  type="hidden"
                  name="active"
                  value={service.active ? "false" : "true"}
                />
                <button
                  type="submit"
                  className={`${button} border border-steel/60`}
                >
                  {service.active ? "Deactivate" : "Reactivate"}
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function ServicePriceForm({ id, price }: { id: number; price: string }) {
  const [value, setValue] = useState(price);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await updateServicePrice(formData);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="id" value={id} />
      <label className="flex-1">
        <span className="sr-only">New default price</span>
        <input
          name="price"
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={`${field} tabular-nums`}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className={`${button} bg-ink text-paper disabled:opacity-40`}
      >
        Save price
      </button>
      {error ? <p className="font-medium text-pole">{error}</p> : null}
    </form>
  );
}
