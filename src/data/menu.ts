/**
 * Display catalog for the storefront.
 *
 * NOTE ON PRICING AUTHORITY: these prices are for *display only*. The checkout
 * API re-reads every price from D1 (db/seed.sql) by slug and never trusts the
 * client. Keep amounts here in sync with db/seed.sql, but a drift here can
 * never overcharge or undercharge a guest.
 */

export type Category =
  | "breads"
  | "cakes"
  | "sweets"
  | "drinks"
  | "pantry"
  | "subscription";

export interface MenuItem {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  priceCents: number;
  unitLabel: string;
  image: string;
  /** short alt text describing the photographed food */
  alt: string;
  badges?: string[];
  allergens?: string[];
  /** subscription-only billing cadence */
  interval?: { unit: "week" | "month"; count: number; label: string };
}

export const menu: MenuItem[] = [
  // ---- Breads ------------------------------------------------------------
  {
    slug: "himbasha",
    name: "Himbasha",
    tagline: "Cinnamon-raisin celebration bread (vegan)",
    description:
      "A tender, lightly sweet celebration bread scored in a sunburst — our vegan version, warm with cinnamon and plump raisins. The Eritrean–Ethiopian bread of days worth marking.",
    category: "breads",
    priceCents: 1400,
    unitLabel: "round loaf",
    image: "/images/menu/himbasha.jpg",
    alt: "Round golden himbasha bread scored in a sunburst pattern, studded with raisins.",
    badges: ["Signature", "Vegan"],
    allergens: ["wheat"],
  },
  {
    slug: "dabo",
    name: "Dabo",
    tagline: "Honey & black seed spice loaf",
    description:
      "A soft honeyed loaf with black seed and cardamom — the bread that has welcomed guests to Eritrean and Ethiopian tables for generations.",
    category: "breads",
    priceCents: 1200,
    unitLabel: "loaf",
    image: "/images/menu/dabo.jpg",
    alt: "A rustic round honey-spiced dabo loaf, deep amber crust flecked with black seed.",
    allergens: ["wheat"],
  },
  {
    slug: "difo-dabo",
    name: "Difo Dabo",
    tagline: "The feast loaf",
    description:
      "A large, slow-risen celebration bread, big enough to break with a whole table. Made to order for gatherings.",
    category: "breads",
    priceCents: 2200,
    unitLabel: "large loaf",
    image: "/images/menu/difo-dabo.jpg",
    alt: "An oversized burnished difo dabo celebration loaf resting on a woven mesob basket.",
    badges: ["Made to order"],
    allergens: ["wheat"],
  },
  {
    slug: "awaze-dabo",
    name: "Awaze Dabo",
    tagline: "Spiced with awaze",
    description:
      "Soft bread folded with awaze — the deep, smoky berbere paste — for a loaf with a gentle warmth. Wonderful torn and shared.",
    category: "breads",
    priceCents: 1300,
    unitLabel: "round loaf",
    image: "/images/menu/awaze-dabo.jpg",
    alt: "A deep red-gold awaze-spiced bread torn open to show a soft, warmly spiced crumb.",
    badges: ["Vegan"],
    allergens: ["wheat"],
  },
  {
    slug: "kibe-dabo",
    name: "Kibe Dabo",
    tagline: "Spiced-butter bread",
    description:
      "Enriched with kibe — fragrant spiced clarified butter — for a rich, golden crumb that needs nothing but your hands.",
    category: "breads",
    priceCents: 1300,
    unitLabel: "round loaf",
    image: "/images/menu/kibe-dabo.jpg",
    alt: "A glossy golden loaf brushed with spiced clarified butter.",
    allergens: ["wheat", "dairy"],
  },
  {
    slug: "dabo-formaggio",
    name: "Dabo Formaggio",
    tagline: "Cheesy pull-apart bread",
    description:
      "A nod to Eritrea's Italian table — soft dabo baked with melting cheese until the top is golden and the middle pulls apart in ribbons.",
    category: "breads",
    priceCents: 1400,
    unitLabel: "round loaf",
    image: "/images/menu/dabo-formaggio.jpg",
    alt: "A golden cheese-topped pull-apart bread with melted cheese in the seams.",
    allergens: ["wheat", "dairy"],
  },
  {
    slug: "ayb-dabo",
    name: "Ayb Dabo",
    tagline: "Fresh-cheese bread",
    description:
      "Pillowy bread filled with ayb, the mild fresh cheese of the highlands — like a quiet, savory cousin to a cheese danish.",
    category: "breads",
    priceCents: 1300,
    unitLabel: "round loaf",
    image: "/images/menu/ayb-dabo.jpg",
    alt: "A soft bread roll split to reveal a fresh white cheese filling.",
    allergens: ["wheat", "dairy"],
  },
  {
    slug: "garlic-dabo",
    name: "Garlic Dabo",
    tagline: "Garlic & herb bread",
    description:
      "Soft dabo brushed with garlic and herbs and baked until the kitchen smells like a promise. Made for sharing alongside a bowl of pasta.",
    category: "breads",
    priceCents: 1200,
    unitLabel: "round loaf",
    image: "/images/menu/garlic-dabo.jpg",
    alt: "A golden garlic bread flecked with herbs and roasted garlic.",
    badges: ["Vegan"],
    allergens: ["wheat"],
  },
  {
    slug: "olive-sundried-tomato-dabo",
    name: "Olive & Sun-Dried Tomato Dabo",
    tagline: "Dimpled, herbed, sun-soaked",
    description:
      "Our focaccia-style dabo, dimpled with olive oil and studded with olives and sweet sun-dried tomatoes. Eritrean–Italian to the core.",
    category: "breads",
    priceCents: 1400,
    unitLabel: "flat loaf",
    image: "/images/menu/olive-sundried-tomato-dabo.jpg",
    alt: "A dimpled focaccia-style flatbread topped with olives and sun-dried tomatoes.",
    badges: ["Vegan"],
    allergens: ["wheat"],
  },
  {
    slug: "sweet-milk-bread",
    name: "Sweet Milk Bread",
    tagline: "Soft, pillowy, just-sweet",
    description:
      "A cloud-soft enriched milk bread that pulls apart in tender strands — the kind that disappears before it cools.",
    category: "breads",
    priceCents: 1000,
    unitLabel: "loaf",
    image: "/images/menu/sweet-milk-bread.jpg",
    alt: "A pale golden, pillowy milk bread loaf with a soft sheen.",
    allergens: ["wheat", "dairy", "eggs"],
  },
  {
    slug: "cinnamon-raisin",
    name: "Cinnamon Raisin",
    tagline: "Swirled & spiced",
    description:
      "A soft loaf swirled with cinnamon sugar and sweet raisins — wonderful toasted with a little butter and a slow morning.",
    category: "breads",
    priceCents: 1100,
    unitLabel: "loaf",
    image: "/images/menu/cinnamon-raisin.jpg",
    alt: "A sliced cinnamon-raisin loaf showing a dark cinnamon swirl and raisins.",
    allergens: ["wheat"],
  },
  {
    slug: "kita",
    name: "Kita",
    tagline: "Everyday griddle flatbread",
    description:
      "Quick, unleavened daily bread, griddled until freckled. Four to a bundle — the bread of ordinary, generous days.",
    category: "breads",
    priceCents: 700,
    unitLabel: "4-pack",
    image: "/images/menu/kita.jpg",
    alt: "A stack of four thin, freckled kita flatbreads on parchment.",
    badges: ["Vegan"],
    allergens: ["wheat"],
  },

  // ---- Cakes -------------------------------------------------------------
  {
    slug: "tres-leches-mini",
    name: "Tres Leches Mini Cakes",
    tagline: "Soaked in three milks",
    description:
      "Airy sponge drenched in three milks and crowned with soft cream — light, cool, and just sweet enough. Four little cakes to a box.",
    category: "cakes",
    priceCents: 1200,
    unitLabel: "4 minis",
    image: "/images/menu/tres-leches-mini.jpg",
    alt: "Four small tres leches cakes topped with whipped cream and a dusting of cinnamon.",
    allergens: ["wheat", "dairy", "eggs"],
  },
  {
    slug: "better-than-sex-mini",
    name: "Better Than Sex Mini Cakes",
    tagline: "Chocolate, caramel & toffee",
    description:
      "Dark chocolate cake soaked in caramel, layered with cream and a rubble of toffee. Unapologetically rich. Four to a box.",
    category: "cakes",
    priceCents: 1300,
    unitLabel: "4 minis",
    image: "/images/menu/better-than-sex-mini.jpg",
    alt: "Four small chocolate cakes topped with cream, caramel drizzle and toffee bits.",
    allergens: ["wheat", "dairy", "eggs"],
  },
  {
    slug: "banana-mini-cake",
    name: "Banana Mini Cake",
    tagline: "Brown-sugar banana",
    description:
      "Moist banana cake with a whisper of brown sugar and cinnamon — the comfort of banana bread, dressed for the table.",
    category: "cakes",
    priceCents: 900,
    unitLabel: "single cake",
    image: "/images/menu/banana-mini-cake.jpg",
    alt: "A small round banana cake with a golden crumb and a light glaze.",
    allergens: ["wheat", "dairy", "eggs"],
  },

  // ---- Sweets ------------------------------------------------------------
  {
    slug: "buna-cookies",
    name: "Buna Cookies",
    tagline: "Coffee & cardamom shortbread",
    description:
      "Buttery shortbread rounds with ground Yirgacheffe coffee and cardamom — made to meet a cup of buna halfway.",
    category: "sweets",
    priceCents: 800,
    unitLabel: "dozen",
    image: "/images/menu/buna-cookies.jpg",
    alt: "A plate of deep-brown coffee-cardamom shortbread cookies beside roasted coffee beans.",
    allergens: ["wheat", "dairy"],
  },
  {
    slug: "dabo-kolo",
    name: "Dabo Kolo",
    tagline: "Little spiced crunch",
    description:
      "Hand-rolled, toasted nuggets of dough with a warm spice edge. The pocketable snack of road trips and long talks.",
    category: "sweets",
    priceCents: 900,
    unitLabel: "2 bags",
    image: "/images/menu/dabo-kolo.jpg",
    alt: "A scattered pile of small golden dabo kolo crunch nuggets.",
    badges: ["Vegan"],
    allergens: ["wheat"],
  },

  // ---- Drinks ------------------------------------------------------------
  {
    slug: "spiced-tea",
    name: "Spiced Tea",
    tagline: "Cinnamon, cardamom & clove",
    description:
      "A loose-leaf black tea blend warmed with cinnamon, cardamom and clove — the shai that ends a good meal. Brews about a dozen cups.",
    category: "drinks",
    priceCents: 1400,
    unitLabel: "loose-leaf tin",
    image: "/images/menu/spiced-tea.jpg",
    alt: "A tin of loose-leaf spiced tea beside cinnamon sticks, cardamom pods and cloves.",
    badges: ["Vegan"],
    allergens: [],
  },
  {
    slug: "ethiopian-cold-brew",
    name: "Ethiopian Cold Brew",
    tagline: "Slow-steeped & bright",
    description:
      "Single-origin Ethiopian coffee, cold-brewed for a smooth, fruit-bright cup with no bitterness. Ready to pour over ice.",
    category: "drinks",
    priceCents: 700,
    unitLabel: "16 oz bottle",
    image: "/images/menu/ethiopian-cold-brew.jpg",
    alt: "A clear bottle of dark cold brew coffee beside ice and coffee beans.",
    badges: ["Vegan"],
    allergens: [],
  },
  {
    slug: "buna",
    name: "Buna",
    tagline: "Ceremony-grade whole-bean coffee",
    description:
      "Single-origin Yirgacheffe, roasted in small batches for the brightness a proper coffee ceremony deserves. Whole bean, 12 oz.",
    category: "drinks",
    priceCents: 1600,
    unitLabel: "12 oz bag",
    image: "/images/menu/buna.jpg",
    alt: "A kraft bag of whole roasted Yirgacheffe coffee beans spilling onto a wooden board.",
    badges: ["Vegan"],
    allergens: [],
  },

  // ---- Sauces & Spreads --------------------------------------------------
  {
    slug: "marinara",
    name: "Marinara Sauce",
    tagline: "Slow-simmered tomato",
    description:
      "A bright, slow-simmered tomato sauce with garlic, basil and good olive oil — a taste of Eritrea's Italian kitchen. Pairs with our garlic dabo.",
    category: "pantry",
    priceCents: 1200,
    unitLabel: "16 oz jar",
    image: "/images/menu/marinara.jpg",
    alt: "A jar of rich red marinara sauce beside fresh basil and tomatoes.",
    badges: ["Vegan"],
    allergens: [],
  },
  {
    slug: "spiced-butter",
    name: "Spiced Butter Spread",
    tagline: "Niter kibbeh, jarred",
    description:
      "Our kibe — clarified butter slow-infused with garlic, ginger and warm spices. A spoonful turns bread, rice, or vegetables into a feast.",
    category: "pantry",
    priceCents: 1200,
    unitLabel: "8 oz jar",
    image: "/images/menu/spiced-butter.jpg",
    alt: "A small jar of golden spiced clarified butter with whole spices.",
    allergens: ["dairy"],
  },
  {
    slug: "olive-tapenade",
    name: "Olive Tapenade Spread",
    tagline: "Briny & bright",
    description:
      "A coarse spread of olives, capers and herbs in olive oil — wonderful on warm dabo or stirred through pasta.",
    category: "pantry",
    priceCents: 1100,
    unitLabel: "8 oz jar",
    image: "/images/menu/olive-tapenade.jpg",
    alt: "A jar of dark green-black olive tapenade with a spoon and crusty bread.",
    badges: ["Vegan"],
    allergens: [],
  },
  {
    slug: "vinegar-spread",
    name: "Vinegar Spread",
    tagline: "Tangy & savory",
    description:
      "A bright, tangy spread to cut through the rich and round out the table — a little goes a long way on warm bread.",
    category: "pantry",
    priceCents: 900,
    unitLabel: "8 oz jar",
    image: "/images/menu/vinegar-spread.jpg",
    alt: "A small jar of glossy, tangy savory spread beside slices of bread.",
    badges: ["Vegan"],
    allergens: [],
  },
];

export const subscriptions: MenuItem[] = [
  {
    slug: "weekly-table",
    name: "The Weekly Table",
    tagline: "A fresh bread box, every week",
    description:
      "A rotating box of the week's best baking, delivered or ready for pickup each week. A portion of every box bakes bread for a neighbor.",
    category: "subscription",
    priceCents: 3200,
    unitLabel: "per week",
    image: "/images/menu/weekly-table.jpg",
    alt: "A linen-lined box of assorted Eritrean and Ethiopian breads and a sweet, ready for the week.",
    interval: { unit: "week", count: 1, label: "week" },
    badges: ["Most loved"],
  },
  {
    slug: "biweekly-hearth",
    name: "The Hearth",
    tagline: "Two weeks of warmth",
    description:
      "Our every-other-week bread box for smaller households — two signature breads and a sweet, with the same neighbor-feeding promise.",
    category: "subscription",
    priceCents: 3600,
    unitLabel: "every 2 weeks",
    image: "/images/menu/biweekly-hearth.jpg",
    alt: "A smaller box holding two breads and a wrapped sweet on a warm cloth.",
    interval: { unit: "week", count: 2, label: "2 weeks" },
  },
  {
    slug: "monthly-gursha",
    name: "Gursha Box",
    tagline: "A generous monthly table",
    description:
      "Gursha is the gift of feeding someone by hand. Once a month: a feast loaf, two breads, a sweet, and a bag of buna — enough to host.",
    category: "subscription",
    priceCents: 5800,
    unitLabel: "per month",
    image: "/images/menu/monthly-gursha.jpg",
    alt: "An abundant monthly box with a large feast loaf, breads, sweets, and a bag of coffee.",
    interval: { unit: "month", count: 1, label: "month" },
  },
  {
    slug: "cake-box",
    name: "Cake Box",
    tagline: "A monthly box of mini cakes",
    description:
      "A monthly assortment of our mini cakes — tres leches, banana, the unspeakably rich one — boxed for celebrating, or for a Tuesday.",
    category: "subscription",
    priceCents: 3400,
    unitLabel: "per month",
    image: "/images/menu/cake-box.jpg",
    alt: "A box of assorted mini cakes with cream and caramel toppings.",
    interval: { unit: "month", count: 1, label: "month" },
  },
  {
    slug: "drinks-box",
    name: "Drinks Box",
    tagline: "Tea & coffee, every month",
    description:
      "A monthly pairing of our spiced tea and Ethiopian coffee — loose-leaf, whole-bean, and cold brew rotating through the seasons.",
    category: "subscription",
    priceCents: 2800,
    unitLabel: "per month",
    image: "/images/menu/drinks-box.jpg",
    alt: "A box with a tin of loose-leaf tea, a bag of coffee beans, and a bottle of cold brew.",
    interval: { unit: "month", count: 1, label: "month" },
  },
  {
    slug: "pantry-box",
    name: "Sauce & Spread Box",
    tagline: "A monthly pantry box",
    description:
      "A monthly trio from our pantry — the marinara plus two rotating spreads — to keep your table generous between bakes.",
    category: "subscription",
    priceCents: 3000,
    unitLabel: "per month",
    image: "/images/menu/pantry-box.jpg",
    alt: "A box holding a jar of marinara and two jars of spreads.",
    interval: { unit: "month", count: 1, label: "month" },
  },
];

export const allItems = [...menu, ...subscriptions];

export const itemBySlug = (slug: string): MenuItem | undefined =>
  allItems.find((i) => i.slug === slug);

export const formatPrice = (cents: number, currency = "USD"): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

export const categoryLabels: Record<Category, string> = {
  breads: "Breads",
  cakes: "Cakes",
  sweets: "Sweets",
  drinks: "Drinks",
  pantry: "Sauces & Spreads",
  subscription: "Boxes",
};
