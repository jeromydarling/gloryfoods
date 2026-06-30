-- Seed catalog for Glory Foods (codename) — Vibes Cuisine and Bakery.
-- Authoritative pricing lives here. Re-runnable: INSERT OR REPLACE by slug.
-- Keep amounts in sync with src/data/menu.ts (the display copy).

-- Remove items pulled from the menu (and the renamed Berbere Ambasha → Awaze Dabo).
DELETE FROM products WHERE slug IN ('injera', 'mushabek', 'ambasha-berbere');

-- ---- Breads ---------------------------------------------------------------
INSERT OR REPLACE INTO products
  (slug, name, tagline, description, category, price_cents, unit_label, image, is_subscription, sort, active)
VALUES
  ('himbasha', 'Himbasha', 'Cinnamon-raisin celebration bread (vegan)',
   'A tender, lightly sweet celebration bread scored in a sunburst — our vegan version, warm with cinnamon and plump raisins.',
   'breads', 1400, 'round loaf', '/images/menu/himbasha.jpg', 0, 10, 1),

  ('dabo', 'Dabo', 'Honey & black seed spice loaf',
   'A soft honeyed loaf with black seed and cardamom — the bread that has welcomed guests to Eritrean and Ethiopian tables for generations.',
   'breads', 1200, 'loaf', '/images/menu/dabo.jpg', 0, 20, 1),

  ('difo-dabo', 'Difo Dabo', 'The feast loaf',
   'A large, slow-risen celebration bread, big enough to break with a whole table. Made to order for gatherings.',
   'breads', 2200, 'large loaf', '/images/menu/difo-dabo.jpg', 0, 30, 1),

  ('awaze-dabo', 'Awaze Dabo', 'Spiced with awaze',
   'Soft bread folded with awaze — the deep, smoky berbere paste — for a loaf with a gentle warmth.',
   'breads', 1300, 'round loaf', '/images/menu/awaze-dabo.svg', 0, 40, 1),

  ('kibe-dabo', 'Kibe Dabo', 'Spiced-butter bread',
   'Enriched with kibe — fragrant spiced clarified butter — for a rich, golden crumb that needs nothing but your hands.',
   'breads', 1300, 'round loaf', '/images/menu/kibe-dabo.svg', 0, 50, 1),

  ('dabo-formaggio', 'Dabo Formaggio', 'Cheesy pull-apart bread',
   'A nod to Eritrea''s Italian table — soft dabo baked with melting cheese until golden and pull-apart in the middle.',
   'breads', 1400, 'round loaf', '/images/menu/dabo-formaggio.svg', 0, 60, 1),

  ('ayb-dabo', 'Ayb Dabo', 'Fresh-cheese bread',
   'Pillowy bread filled with ayb, the mild fresh cheese of the highlands — a quiet, savory cousin to a cheese danish.',
   'breads', 1300, 'round loaf', '/images/menu/ayb-dabo.svg', 0, 70, 1),

  ('garlic-dabo', 'Garlic Dabo', 'Garlic & herb bread',
   'Soft dabo brushed with garlic and herbs and baked until the kitchen smells like a promise. Made for sharing with pasta.',
   'breads', 1200, 'round loaf', '/images/menu/garlic-dabo.svg', 0, 80, 1),

  ('olive-sundried-tomato-dabo', 'Olive & Sun-Dried Tomato Dabo', 'Dimpled, herbed, sun-soaked',
   'Our focaccia-style dabo, dimpled with olive oil and studded with olives and sweet sun-dried tomatoes. Eritrean–Italian to the core.',
   'breads', 1400, 'flat loaf', '/images/menu/olive-sundried-tomato-dabo.svg', 0, 90, 1),

  ('sweet-milk-bread', 'Sweet Milk Bread', 'Soft, pillowy, just-sweet',
   'A cloud-soft enriched milk bread that pulls apart in tender strands — the kind that disappears before it cools.',
   'breads', 1000, 'loaf', '/images/menu/sweet-milk-bread.svg', 0, 100, 1),

  ('cinnamon-raisin', 'Cinnamon Raisin', 'Swirled & spiced',
   'A soft loaf swirled with cinnamon sugar and sweet raisins — wonderful toasted with a little butter and a slow morning.',
   'breads', 1100, 'loaf', '/images/menu/cinnamon-raisin.svg', 0, 110, 1),

  ('kita', 'Kita', 'Everyday griddle flatbread',
   'Quick, unleavened daily bread, griddled until freckled. Four to a bundle — the bread of ordinary, generous days.',
   'breads', 700, '4-pack', '/images/menu/kita.jpg', 0, 120, 1),

-- ---- Cakes ----------------------------------------------------------------
  ('tres-leches-mini', 'Tres Leches Mini Cakes', 'Soaked in three milks',
   'Airy sponge drenched in three milks and crowned with soft cream — light, cool, and just sweet enough. Four to a box.',
   'cakes', 1200, '4 minis', '/images/menu/tres-leches-mini.svg', 0, 200, 1),

  ('better-than-sex-mini', 'Better Than Sex Mini Cakes', 'Chocolate, caramel & toffee',
   'Dark chocolate cake soaked in caramel, layered with cream and a rubble of toffee. Unapologetically rich. Four to a box.',
   'cakes', 1300, '4 minis', '/images/menu/better-than-sex-mini.svg', 0, 210, 1),

  ('banana-mini-cake', 'Banana Mini Cake', 'Brown-sugar banana',
   'Moist banana cake with a whisper of brown sugar and cinnamon — the comfort of banana bread, dressed for the table.',
   'cakes', 900, 'single cake', '/images/menu/banana-mini-cake.svg', 0, 220, 1),

-- ---- Sweets ---------------------------------------------------------------
  ('buna-cookies', 'Buna Cookies', 'Coffee & cardamom shortbread',
   'Buttery shortbread rounds with ground Yirgacheffe coffee and cardamom — made to meet a cup of buna halfway.',
   'sweets', 800, 'dozen', '/images/menu/buna-cookies.jpg', 0, 300, 1),

  ('dabo-kolo', 'Dabo Kolo', 'Little spiced crunch',
   'Hand-rolled, toasted nuggets of dough with a warm spice edge. The pocketable snack of road trips and long talks.',
   'sweets', 900, '2 bags', '/images/menu/dabo-kolo.jpg', 0, 310, 1),

-- ---- Drinks ---------------------------------------------------------------
  ('spiced-tea', 'Spiced Tea', 'Cinnamon, cardamom & clove',
   'A loose-leaf black tea blend warmed with cinnamon, cardamom and clove — the shai that ends a good meal.',
   'drinks', 1400, 'loose-leaf tin', '/images/menu/spiced-tea.svg', 0, 400, 1),

  ('ethiopian-cold-brew', 'Ethiopian Cold Brew', 'Slow-steeped & bright',
   'Single-origin Ethiopian coffee, cold-brewed for a smooth, fruit-bright cup with no bitterness. Ready to pour over ice.',
   'drinks', 700, '16 oz bottle', '/images/menu/ethiopian-cold-brew.svg', 0, 410, 1),

  ('buna', 'Buna', 'Ceremony-grade whole-bean coffee',
   'Single-origin Yirgacheffe, roasted in small batches for the brightness a proper coffee ceremony deserves. Whole bean, 12 oz.',
   'drinks', 1600, '12 oz bag', '/images/menu/buna.jpg', 0, 420, 1),

-- ---- Sauces & Spreads -----------------------------------------------------
  ('marinara', 'Marinara Sauce', 'Slow-simmered tomato',
   'A bright, slow-simmered tomato sauce with garlic, basil and good olive oil — a taste of Eritrea''s Italian kitchen.',
   'pantry', 1200, '16 oz jar', '/images/menu/marinara.svg', 0, 500, 1),

  ('spiced-butter', 'Spiced Butter Spread', 'Niter kibbeh, jarred',
   'Our kibe — clarified butter slow-infused with garlic, ginger and warm spices. A spoonful turns bread or rice into a feast.',
   'pantry', 1200, '8 oz jar', '/images/menu/spiced-butter.svg', 0, 510, 1),

  ('olive-tapenade', 'Olive Tapenade Spread', 'Briny & bright',
   'A coarse spread of olives, capers and herbs in olive oil — wonderful on warm dabo or stirred through pasta.',
   'pantry', 1100, '8 oz jar', '/images/menu/olive-tapenade.svg', 0, 520, 1),

  ('vinegar-spread', 'Vinegar Spread', 'Tangy & savory',
   'A bright, tangy spread to cut through the rich and round out the table — a little goes a long way on warm bread.',
   'pantry', 900, '8 oz jar', '/images/menu/vinegar-spread.svg', 0, 530, 1);

-- ---- Boxes (recurring subscriptions) --------------------------------------
INSERT OR REPLACE INTO products
  (slug, name, tagline, description, category, price_cents, unit_label, image, is_subscription, bill_interval, interval_count, sort, active)
VALUES
  ('weekly-table', 'The Weekly Table', 'A fresh bread box, every week',
   'A rotating box of the week''s best baking, delivered or ready for pickup each week. A portion of every box bakes bread for a neighbor.',
   'subscription', 3200, 'per week', '/images/menu/weekly-table.jpg', 1, 'week', 1, 600, 1),

  ('biweekly-hearth', 'The Hearth', 'Two weeks of warmth',
   'Our every-other-week bread box for smaller households — two signature breads and a sweet, with the same neighbor-feeding promise.',
   'subscription', 3600, 'every 2 weeks', '/images/menu/biweekly-hearth.jpg', 1, 'week', 2, 610, 1),

  ('monthly-gursha', 'Gursha Box', 'A generous monthly table',
   'Gursha is the gift of feeding someone by hand. Once a month: a feast loaf, two breads, a sweet, and a bag of buna — enough to host.',
   'subscription', 5800, 'per month', '/images/menu/monthly-gursha.jpg', 1, 'month', 1, 620, 1),

  ('cake-box', 'Cake Box', 'A monthly box of mini cakes',
   'A monthly assortment of our mini cakes — tres leches, banana, the unspeakably rich one — boxed for celebrating, or for a Tuesday.',
   'subscription', 3400, 'per month', '/images/menu/cake-box.svg', 1, 'month', 1, 630, 1),

  ('drinks-box', 'Drinks Box', 'Tea & coffee, every month',
   'A monthly pairing of our spiced tea and Ethiopian coffee — loose-leaf, whole-bean, and cold brew rotating through the seasons.',
   'subscription', 2800, 'per month', '/images/menu/drinks-box.svg', 1, 'month', 1, 640, 1),

  ('pantry-box', 'Sauce & Spread Box', 'A monthly pantry box',
   'A monthly trio from our pantry — the marinara plus two rotating spreads — to keep your table generous between bakes.',
   'subscription', 3000, 'per month', '/images/menu/pantry-box.svg', 1, 'month', 1, 650, 1);
