INSERT INTO barbers (name)
SELECT seed.name
FROM (VALUES ('Marco'), ('Dee'), ('Sam')) AS seed(name)
WHERE NOT EXISTS (SELECT 1 FROM barbers);

INSERT INTO services (name, default_price_cents)
SELECT seed.name, seed.default_price_cents
FROM (
  VALUES
    ('Haircut', 3000),
    ('Skin fade', 3500),
    ('Beard trim', 1500),
    ('Haircut + beard', 4000),
    ('Kids cut', 2000),
    ('Line-up', 1000)
) AS seed(name, default_price_cents)
WHERE NOT EXISTS (SELECT 1 FROM services);
