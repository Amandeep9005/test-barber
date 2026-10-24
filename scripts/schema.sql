CREATE TABLE IF NOT EXISTS barbers (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id                  SERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  default_price_cents INTEGER NOT NULL CHECK (default_price_cents >= 0),
  active              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sales (
  id             SERIAL PRIMARY KEY,
  barber_id      INTEGER NOT NULL REFERENCES barbers(id),
  service_id     INTEGER NOT NULL REFERENCES services(id),
  price_cents    INTEGER NOT NULL CHECK (price_cents >= 0),
  tip_cents      INTEGER NOT NULL DEFAULT 0 CHECK (tip_cents >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sales_created_at_idx ON sales (created_at);
