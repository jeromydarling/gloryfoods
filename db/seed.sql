-- Seed catalog for Glory Foods (codename) — Vibes Cuisine and Bakery.
-- Authoritative pricing lives here. Re-runnable: INSERT OR REPLACE by slug.
-- Keep amounts in sync with src/data/menu.ts (the display copy).

-- ---- Breads (one-time) ----------------------------------------------------
INSERT OR REPLACE INTO products
  (slug, name, tagline, description, category, price_cents, unit_label, image, is_subscription, sort, active)
VALUES
  ('himbasha', 'Himbasha', 'Cardamom celebration bread',
   'A tender, lightly sweet wheat bread scented with cardamom and scored in a sunburst — baked for the days that deserve a little ceremony.',
   'breads', 1400, 'round loaf', '/images/menu/himbasha.webp', 0, 10, 1),

  ('dabo', 'Dabo', 'Honey & nigella spice loaf',
   'Yemarina yewotet dabo. A soft honeyed loaf with nigella and cardamom — the bread that has welcomed guests to Ethiopian tables for generations.',
   'breads', 1200, 'loaf', '/images/menu/dabo.webp', 0, 20, 1),

  ('difo-dabo', 'Difo Dabo', 'The feast loaf',
   'A large, slow-risen celebration bread, big enough to break with a whole table. Made to order for gatherings.',
   'breads', 2200, 'large loaf', '/images/menu/difo-dabo.webp', 0, 30, 1),

  ('injera', 'Injera', 'Naturally fermented teff sourdough',
   'Five sheets of teff injera, fermented slowly for that signature gentle sour and lacy eyes. Naturally gluten-free grain.',
   'breads', 1100, '5 sheets', '/images/menu/injera.webp', 0, 40, 1),

  ('ambasha-berbere', 'Berbere Ambasha', 'Savory, spiced, golden',
   'Our himbasha''s bold cousin — enriched with niter kibbeh and a whisper of berbere. Wonderful torn warm and shared.',
   'breads', 1300, 'round loaf', '/images/menu/ambasha-berbere.webp', 0, 50, 1),

  ('kita', 'Kita', 'Everyday griddle flatbread',
   'Quick, unleavened daily bread, griddled until freckled. Four to a bundle — the bread of ordinary, generous days.',
   'breads', 700, '4-pack', '/images/menu/kita.webp', 0, 60, 1),

-- ---- Sweets ---------------------------------------------------------------
  ('mushabek', 'Mushabek', 'Saffron syrup spirals',
   'Crisp golden spirals soaked in a light cardamom-saffron syrup. Festive, fragrant, and impossible to eat just one.',
   'sweets', 1000, 'half dozen', '/images/menu/mushabek.webp', 0, 70, 1),

  ('buna-cookies', 'Buna Cookies', 'Coffee & cardamom shortbread',
   'Buttery shortbread rounds with ground Yirgacheffe coffee and cardamom — made to meet a cup of buna halfway.',
   'sweets', 800, 'dozen', '/images/menu/buna-cookies.webp', 0, 80, 1),

  ('dabo-kolo', 'Dabo Kolo', 'Little spiced crunch',
   'Hand-rolled, toasted nuggets of dough with a warm spice edge. The pocketable snack of road trips and long talks.',
   'sweets', 900, '2 bags', '/images/menu/dabo-kolo.webp', 0, 90, 1),

-- ---- Pantry ---------------------------------------------------------------
  ('buna', 'Buna', 'Ceremony-grade whole-bean coffee',
   'Single-origin Yirgacheffe, roasted in small batches for the brightness a proper coffee ceremony deserves. Whole bean, 12 oz.',
   'pantry', 1600, '12 oz bag', '/images/menu/buna.webp', 0, 100, 1);

-- ---- Subscriptions (recurring) -------------------------------------------
INSERT OR REPLACE INTO products
  (slug, name, tagline, description, category, price_cents, unit_label, image, is_subscription, bill_interval, interval_count, sort, active)
VALUES
  ('weekly-table', 'The Weekly Table', 'A fresh bread box, every week',
   'A rotating box of the week''s best baking, delivered or ready for pickup each week. A portion of every box bakes bread for a neighbor.',
   'subscription', 3200, 'per week', '/images/menu/weekly-table.webp', 1, 'week', 1, 110, 1),

  ('biweekly-hearth', 'The Hearth', 'Two weeks of warmth',
   'Our every-other-week box for smaller households — two signature breads and a sweet, with the same neighbor-feeding promise.',
   'subscription', 3600, 'every 2 weeks', '/images/menu/biweekly-hearth.webp', 1, 'week', 2, 120, 1),

  ('monthly-gursha', 'Gursha Box', 'A generous monthly table',
   'Gursha is the gift of feeding someone by hand. Once a month: a feast loaf, two breads, a sweet, and a bag of buna — enough to host.',
   'subscription', 5800, 'per month', '/images/menu/monthly-gursha.webp', 1, 'month', 1, 130, 1);
