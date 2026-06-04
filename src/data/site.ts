/**
 * Central brand + site configuration.
 *
 * "Glory Foods" is the working codename; the public-facing brand is set here
 * and threads through the whole site. Changing `name`/`legalName` here renames
 * the brand everywhere — no other edits required.
 */
export const site = {
  name: "Vibes Cuisine and Bakery",
  codename: "Glory Foods",
  legalName: "Vibes Cuisine and Bakery LLC",
  // ሰላም (selam) — "peace"; the everyday Amharic greeting and farewell.
  tagline: "Ethiopian baking, the welcome of a shared table.",
  shortDescription:
    "A Ethiopian bakery in St. Paul, baking the breads and sweets of home — and setting a place for everyone who comes to the table.",
  location: {
    neighborhood: "Hamline–Midway",
    city: "St. Paul",
    region: "Minnesota",
    regionCode: "MN",
    country: "USA",
    addressLine: "Hamline–Midway, St. Paul, MN",
  },
  contact: {
    email: "hello@vibescuisineandbakery.com",
    phone: "+1 (651) 555-0142",
    phoneHref: "tel:+16515550142",
  },
  hours: [
    { day: "Wednesday – Friday", time: "7:00am – 6:00pm" },
    { day: "Saturday", time: "7:00am – 4:00pm" },
    { day: "Sunday", time: "8:00am – 2:00pm" },
    { day: "Monday – Tuesday", time: "Resting & baking ahead" },
  ],
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
  },
  // Amharic accents used sparingly across the UI.
  amharic: {
    welcome: "እንኳን ደህና መጡ", // "welcome"
    bread: "ዳቦ", // "dabo" / bread
    peace: "ሰላም", // "selam" / peace
  },
} as const;

export type Site = typeof site;
