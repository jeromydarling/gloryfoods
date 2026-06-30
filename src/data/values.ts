/**
 * The bakehouse's promises. The voice draws — quietly, with no religious
 * language — on a tradition of social ethics: the dignity of every person,
 * the common good, solidarity with the vulnerable, the dignity of work and
 * fair wages, welcome of the newcomer, and care for the land that feeds us.
 */
export interface Value {
  title: string;
  body: string;
  /** inline SVG icon key, rendered by components/Icon.astro */
  icon: string;
}

export const values: Value[] = [
  {
    title: "A place is set for everyone",
    body: "No one is a stranger at a table. We bake so that anyone — neighbor, newcomer, or guest passing through — can be welcomed with something warm and made by hand.",
    icon: "table",
  },
  {
    title: "Bread is how we belong",
    body: "Our breads carry the recipes families brought with them across an ocean. To share them here is to say that what you came from has a home on this block, too.",
    icon: "bread",
  },
  {
    title: "Fair work, fairly paid",
    body: "Every baker here earns a living wage and a real schedule. Good bread cannot be built on tired hands — the dignity of the people who make it comes first.",
    icon: "hands",
  },
  {
    title: "A portion always goes out the door",
    body: "A share of every subscription box bakes bread for neighbors who are going without. Abundance is meant to be passed along, by hand, the way gursha is given.",
    icon: "gift",
  },
  {
    title: "Honest grain, kept whole",
    body: "We mill teff and source flour from growers who tend their soil for the long run. Caring for the land is part of caring for the people it will feed next.",
    icon: "wheat",
  },
  {
    title: "Made for the long table, not the quick sale",
    body: "We would rather bake a little less and know your name than scale past the point of care. The good we build together is the whole point.",
    icon: "community",
  },
];

/** Short narrative beats for the "Our Story" page. */
export const story = {
  lede: "Vibes Cuisine and Bakery began with a borrowed oven, a sack of teff, and the conviction that a city is only as warm as the welcome at its smallest tables.",
  chapters: [
    {
      heading: "From a home kitchen in St. Paul",
      body: "It started the way most good things do — with too much bread and not enough people to give it to. Sunday loaves for neighbors became standing orders, and standing orders became a small bakery on the Midway, where the smell of cardamom now finds the sidewalk before you reach the door.",
    },
    {
      heading: "Recipes that crossed an ocean",
      body: "Our himbasha, our honeyed dabo, the cheese breads touched by Eritrea's Italian table — these are not inventions. They are inheritances, carried from Asmara and Addis, Gondar and Hawassa, to Minnesota, and kept exactly as faithfully as we know how. To bake them is to keep a door open between here and home.",
    },
    {
      heading: "A bakery that answers to its neighbors",
      body: "We measure a good week less by what we sold than by who sat down. Fair pay for our bakers, bread carried to families going without, and a counter where everyone is greeted by name — that is the recipe we are most careful about.",
    },
  ],
};
