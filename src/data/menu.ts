/**
 * Display catalog for the storefront.
 *
 * NOTE ON PRICING AUTHORITY: these prices are for *display only*. The checkout
 * API re-reads every price from D1 (db/seed.sql) by slug and never trusts the
 * client. Keep amounts here in sync with db/seed.sql, but a drift here can
 * never overcharge or undercharge a guest.
 */

export type Category = "breads" | "sweets" | "pantry" | "subscription";

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
  {
    slug: "himbasha",
    name: "Himbasha",
    tagline: "Cardamom celebration bread",
    description:
      "A tender, lightly sweet wheat bread scented with cardamom and scored in a sunburst — baked for the days that deserve a little ceremony.",
    category: "breads",
    priceCents: 1400,
    unitLabel: "round loaf",
    image: "/images/menu/himbasha.jpg",
    alt: "Round golden himbasha bread scored in a sunburst pattern, dusted lightly with seeds.",
    badges: ["Signature"],
    allergens: ["wheat"],
  },
  {
    slug: "dabo",
    name: "Dabo",
    tagline: "Honey & nigella spice loaf",
    description:
      "Yemarina yewotet dabo. A soft honeyed loaf with nigella and cardamom — the bread that has welcomed guests to Ethiopian tables for generations.",
    category: "breads",
    priceCents: 1200,
    unitLabel: "loaf",
    image: "/images/menu/dabo.jpg",
    alt: "A rustic round honey-spiced dabo loaf, deep amber crust flecked with nigella seeds.",
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
    slug: "injera",
    name: "Injera",
    tagline: "Naturally fermented teff sourdough",
    description:
      "Five sheets of teff injera, fermented slowly for that signature gentle sour and lacy eyes. Naturally gluten-free grain.",
    category: "breads",
    priceCents: 1100,
    unitLabel: "5 sheets",
    image: "/images/menu/injera.jpg",
    alt: "A rolled stack of soft, spongy teff injera flatbread showing its lacy fermented surface.",
    badges: ["Teff", "Vegan"],
    allergens: [],
  },
  {
    slug: "ambasha-berbere",
    name: "Berbere Ambasha",
    tagline: "Savory, spiced, golden",
    description:
      "Our himbasha's bold cousin — enriched with niter kibbeh and a whisper of berbere. Wonderful torn warm and shared.",
    category: "breads",
    priceCents: 1300,
    unitLabel: "round loaf",
    image: "/images/menu/ambasha-berbere.jpg",
    alt: "A deep red-gold berbere ambasha loaf, torn open to show a soft spiced crumb.",
    allergens: ["wheat", "dairy"],
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
  {
    slug: "mushabek",
    name: "Mushabek",
    tagline: "Saffron syrup spirals",
    description:
      "Crisp golden spirals soaked in a light cardamom-saffron syrup. Festive, fragrant, and impossible to eat just one.",
    category: "sweets",
    priceCents: 1000,
    unitLabel: "half dozen",
    image: "/images/menu/mushabek.jpg",
    alt: "Bright orange lattice-like mushabek spirals glistening with saffron syrup.",
    allergens: ["wheat"],
  },
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
  {
    slug: "buna",
    name: "Buna",
    tagline: "Ceremony-grade whole-bean coffee",
    description:
      "Single-origin Yirgacheffe, roasted in small batches for the brightness a proper coffee ceremony deserves. Whole bean, 12 oz.",
    category: "pantry",
    priceCents: 1600,
    unitLabel: "12 oz bag",
    image: "/images/menu/buna.jpg",
    alt: "A kraft bag of whole roasted Yirgacheffe coffee beans spilling onto a wooden board.",
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
    alt: "A linen-lined box of assorted Ethiopian breads and a sweet, ready for the week.",
    interval: { unit: "week", count: 1, label: "week" },
    badges: ["Most loved"],
  },
  {
    slug: "biweekly-hearth",
    name: "The Hearth",
    tagline: "Two weeks of warmth",
    description:
      "Our every-other-week box for smaller households — two signature breads and a sweet, with the same neighbor-feeding promise.",
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
  sweets: "Sweets",
  pantry: "Pantry",
  subscription: "Bread Boxes",
};
