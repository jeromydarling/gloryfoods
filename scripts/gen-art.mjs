#!/usr/bin/env node
/**
 * Generates tasteful, on-brand SVG artwork for the storefront so the design is
 * visually complete with zero external dependencies. These are intentional,
 * warm illustrations — not "broken image" placeholders.
 *
 * For production photography, see scripts/generate-flux-images.mjs, which
 * replaces these files with Cloudflare Workers AI (Flux) output keyed to the
 * same filenames and the prompts in image-prompts.json.
 *
 *   node scripts/gen-art.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "images");

const C = {
  cream: "#fffdf8",
  parchment: "#faf4e8",
  parchmentDeep: "#f1e7d2",
  ink: "#2a1c12",
  green: "#1f4a33",
  greenBright: "#2f6b48",
  gold: "#d99a2b",
  goldDeep: "#b9781a",
  berbere: "#b4392b",
  berbereDeep: "#8f2a20",
  coffee: "#4a2e20",
};

const PALETTES = {
  breads: [C.gold, C.berbere],
  cakes: [C.berbere, C.gold],
  sweets: [C.berbere, C.goldDeep],
  drinks: [C.coffee, C.berbere],
  pantry: [C.coffee, C.gold],
  subscription: [C.green, C.gold],
  story: [C.green, C.berbere],
  hero: [C.gold, C.green],
};

// deterministic speckle so output is stable across runs
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function speckle(seed, w, h, n = 36) {
  const rnd = mulberry32(seed);
  let dots = "";
  for (let i = 0; i < n; i++) {
    const x = (rnd() * w).toFixed(0);
    const y = (rnd() * h).toFixed(0);
    const r = (rnd() * 2 + 0.5).toFixed(1);
    const o = (rnd() * 0.06 + 0.02).toFixed(2);
    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.coffee}" opacity="${o}"/>`;
  }
  return dots;
}

function frame(w, h, [a, b], seed, inner, label) {
  const id = "g" + seed;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <radialGradient id="${id}" cx="32%" cy="26%" r="85%">
      <stop offset="0%" stop-color="${C.cream}"/>
      <stop offset="55%" stop-color="${a}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${b}" stop-opacity="0.42"/>
    </radialGradient>
    <linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.cream}"/>
      <stop offset="100%" stop-color="${C.parchmentDeep}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${C.parchment}"/>
  <rect width="${w}" height="${h}" fill="url(#${id})"/>
  ${speckle(seed, w, h)}
  ${inner}
  ${label ? labelMark(w, h, label) : ""}
</svg>`;
}

function labelMark(w, h, text) {
  return `<g>
    <text x="${w / 2}" y="${h - 26}" text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif" font-size="26" font-style="italic"
      fill="${C.coffee}" opacity="0.9">${text}</text>
  </g>`;
}

/* ---------------------------- food motifs ------------------------------- */

function plate(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r + 16}" fill="${C.cream}" opacity="0.85"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 16}" fill="none" stroke="${C.parchmentDeep}" stroke-width="3"/>`;
}

function roundLoaf(cx, cy, r, color, scored = true) {
  let g = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.coffee}" stroke-opacity="0.35" stroke-width="3"/>
  <ellipse cx="${cx - r * 0.28}" cy="${cy - r * 0.3}" rx="${r * 0.45}" ry="${r * 0.3}" fill="#fff" opacity="0.16"/>`;
  if (scored) {
    g += `<g stroke="${C.coffee}" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round">`;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g += `<line x1="${cx + Math.cos(a) * r * 0.2}" y1="${cy + Math.sin(a) * r * 0.2}" x2="${cx + Math.cos(a) * r * 0.82}" y2="${cy + Math.sin(a) * r * 0.82}"/>`;
    }
    g += `</g>`;
  }
  return g;
}

function flatStack(cx, cy, r, color) {
  let g = "";
  for (let i = 2; i >= 0; i--) {
    const oy = cy + i * 14 - 14;
    g += `<ellipse cx="${cx}" cy="${oy}" rx="${r}" ry="${r * 0.42}" fill="${color}" opacity="${0.85 - i * 0.12}" stroke="${C.coffee}" stroke-opacity="0.25" stroke-width="2"/>`;
  }
  // lacy holes
  const rnd = mulberry32(7);
  for (let i = 0; i < 14; i++) {
    g += `<circle cx="${cx + (rnd() - 0.5) * r * 1.4}" cy="${cy - 14 + (rnd() - 0.5) * r * 0.5}" r="${rnd() * 3 + 1}" fill="${C.coffee}" opacity="0.18"/>`;
  }
  return g;
}

function spiral(cx, cy, r, color) {
  let path = `M ${cx} ${cy}`;
  for (let t = 0; t < 360 * 3; t += 8) {
    const rad = (t / (360 * 3)) * r;
    const a = (t * Math.PI) / 180;
    path += ` L ${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
  }
  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" opacity="0.9"/>
  <path d="${path}" fill="none" stroke="${C.gold}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;
}

function cookies(cx, cy, r, color) {
  const spots = [[-1, -0.4], [1, -0.4], [0, 0.7]];
  return spots
    .map(
      ([dx, dy]) =>
        `<circle cx="${cx + dx * r * 0.7}" cy="${cy + dy * r * 0.7}" r="${r * 0.5}" fill="${color}"/>
         <circle cx="${cx + dx * r * 0.7}" cy="${cy + dy * r * 0.7}" r="${r * 0.5}" fill="none" stroke="${C.coffee}" stroke-opacity="0.3" stroke-width="2"/>
         <circle cx="${cx + dx * r * 0.7 - 6}" cy="${cy + dy * r * 0.7 - 4}" r="3" fill="${C.coffee}" opacity="0.4"/>
         <circle cx="${cx + dx * r * 0.7 + 8}" cy="${cy + dy * r * 0.7 + 6}" r="2.5" fill="${C.coffee}" opacity="0.4"/>`
    )
    .join("");
}

function nuggets(cx, cy, r, color) {
  const rnd = mulberry32(11);
  let g = "";
  for (let i = 0; i < 22; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = rnd() * r;
    g += `<rect x="${(cx + Math.cos(a) * rad).toFixed(0)}" y="${(cy + Math.sin(a) * rad).toFixed(0)}" width="${(rnd() * 10 + 8).toFixed(0)}" height="${(rnd() * 8 + 7).toFixed(0)}" rx="4" fill="${color}" opacity="0.9" transform="rotate(${(rnd() * 60 - 30).toFixed(0)} ${cx} ${cy})"/>`;
  }
  return g;
}

function coffeeBag(cx, cy, r, color) {
  const w = r * 1.3,
    h = r * 1.7;
  let g = `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="10" fill="${color}"/>
  <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h * 0.22}" fill="${C.coffee}" opacity="0.4"/>
  <ellipse cx="${cx}" cy="${cy + 4}" rx="${w * 0.28}" ry="${w * 0.28}" fill="${C.cream}" opacity="0.92"/>`;
  // beans
  g += `<g fill="${C.coffee}">`;
  [[-1, -1], [1, -0.8], [0, 1.1], [1.3, 1.2]].forEach(([dx, dy]) => {
    const bx = cx + dx * r * 0.95,
      by = cy + dy * r * 0.95;
    g += `<ellipse cx="${bx}" cy="${by}" rx="11" ry="7" transform="rotate(${dx * 25} ${bx} ${by})"/>
    <path d="M ${bx - 9} ${by} Q ${bx} ${by - 5} ${bx + 9} ${by}" stroke="${C.parchment}" stroke-width="1.5" fill="none" transform="rotate(${dx * 25} ${bx} ${by})"/>`;
  });
  g += `</g>`;
  return g;
}

function breadBox(cx, cy, r, color) {
  const w = r * 2.1,
    h = r * 1.3;
  let g = `<rect x="${cx - w / 2}" y="${cy - h / 2 + 10}" width="${w}" height="${h}" rx="14" fill="${C.coffee}" opacity="0.9"/>
  <rect x="${cx - w / 2}" y="${cy - h / 2 + 10}" width="${w}" height="${h * 0.4}" rx="14" fill="${C.parchmentDeep}"/>`;
  // loaves peeking out
  g += roundLoaf(cx - r * 0.55, cy - h * 0.15, r * 0.45, color, false);
  g += roundLoaf(cx + r * 0.5, cy - h * 0.22, r * 0.5, C.gold, true);
  g += `<ellipse cx="${cx + r * 0.05}" cy="${cy - h * 0.05}" rx="${r * 0.4}" ry="${r * 0.22}" fill="${C.berbere}" opacity="0.85"/>`;
  return g;
}

function steam(cx, cy) {
  return `<g stroke="${C.coffee}" stroke-opacity="0.18" stroke-width="4" fill="none" stroke-linecap="round">
    <path d="M ${cx - 18} ${cy} q 10 -20 0 -40 q -10 -20 0 -40"/>
    <path d="M ${cx + 18} ${cy} q 10 -20 0 -40 q -10 -20 0 -40"/>
  </g>`;
}

function cake(cx, cy, r, color) {
  const w = r * 1.7,
    h = r * 1.25;
  let g = `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="12" fill="${color}"/>`;
  g += `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h * 0.34}" rx="12" fill="${C.cream}" opacity="0.95"/>`;
  g += `<rect x="${cx - w / 2}" y="${cy - h * 0.04}" width="${w}" height="6" fill="${C.cream}" opacity="0.5"/>`;
  g += `<circle cx="${cx}" cy="${cy - h * 0.36}" r="8" fill="${C.berbere}"/>`;
  return g;
}

function mug(cx, cy, r, color) {
  const w = r * 1.35,
    h = r * 1.2;
  let g = `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="16" fill="${color}"/>`;
  g += `<ellipse cx="${cx}" cy="${cy - h / 2}" rx="${w / 2}" ry="${w * 0.16}" fill="${C.coffee}" opacity="0.55"/>`;
  g += `<path d="M ${cx + w / 2 - 4} ${cy - h * 0.18} q ${r * 0.55} 0 ${r * 0.55} ${r * 0.34} q 0 ${r * 0.34} ${-r * 0.55} ${r * 0.34}" fill="none" stroke="${color}" stroke-width="12"/>`;
  g += steam(cx, cy - h / 2 - 8);
  return g;
}

function coldBrew(cx, cy, r, color) {
  const w = r * 1.05,
    h = r * 1.8;
  let g = `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="16" fill="${color}" opacity="0.92"/>`;
  g += `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h * 0.16}" rx="12" fill="${C.parchmentDeep}"/>`;
  g += `<rect x="${cx - w * 0.3}" y="${cy - r * 0.1}" width="${r * 0.34}" height="${r * 0.34}" rx="5" fill="${C.cream}" opacity="0.28" transform="rotate(12 ${cx} ${cy})"/>`;
  g += `<rect x="${cx + r * 0.02}" y="${cy + r * 0.2}" width="${r * 0.3}" height="${r * 0.3}" rx="5" fill="${C.cream}" opacity="0.22" transform="rotate(-8 ${cx} ${cy})"/>`;
  return g;
}

function jar(cx, cy, r, color) {
  const w = r * 1.5,
    h = r * 1.55;
  let g = `<rect x="${cx - w / 2}" y="${cy - h / 2 + r * 0.22}" width="${w}" height="${h - r * 0.22}" rx="16" fill="${color}"/>`;
  g += `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${r * 0.38}" rx="9" fill="${C.coffee}" opacity="0.85"/>`;
  g += `<rect x="${cx - w / 2 + 7}" y="${cy - h * 0.08}" width="${w - 14}" height="${h * 0.3}" rx="7" fill="${C.cream}" opacity="0.88"/>`;
  return g;
}

const MOTIF = {
  // breads
  himbasha: (cx, cy, r) => roundLoaf(cx, cy, r, C.gold, true),
  dabo: (cx, cy, r) => roundLoaf(cx, cy, r, C.goldDeep, false) + speckleOn(cx, cy, r),
  "difo-dabo": (cx, cy, r) => roundLoaf(cx, cy, r * 1.05, C.berbere, true),
  "awaze-dabo": (cx, cy, r) => roundLoaf(cx, cy, r, C.berbere, true),
  "kibe-dabo": (cx, cy, r) => roundLoaf(cx, cy, r, C.gold, false),
  "dabo-formaggio": (cx, cy, r) =>
    roundLoaf(cx, cy, r, C.gold, false) +
    `<circle cx="${cx - r * 0.3}" cy="${cy - r * 0.1}" r="9" fill="${C.cream}" opacity="0.8"/>
     <circle cx="${cx + r * 0.25}" cy="${cy + r * 0.15}" r="11" fill="${C.cream}" opacity="0.8"/>
     <circle cx="${cx + r * 0.05}" cy="${cy - r * 0.35}" r="8" fill="${C.cream}" opacity="0.75"/>`,
  "ayb-dabo": (cx, cy, r) => roundLoaf(cx, cy, r, C.parchmentDeep, false),
  "garlic-dabo": (cx, cy, r) => roundLoaf(cx, cy, r, C.gold, false),
  "olive-sundried-tomato-dabo": (cx, cy, r) =>
    roundLoaf(cx, cy, r, C.goldDeep, false) +
    `<circle cx="${cx - r * 0.3}" cy="${cy}" r="7" fill="${C.green}"/>
     <circle cx="${cx + r * 0.2}" cy="${cy - r * 0.2}" r="7" fill="${C.berbere}"/>
     <circle cx="${cx + r * 0.3}" cy="${cy + r * 0.25}" r="6" fill="${C.green}"/>`,
  "sweet-milk-bread": (cx, cy, r) => roundLoaf(cx, cy, r, C.gold, false),
  "cinnamon-raisin": (cx, cy, r) => roundLoaf(cx, cy, r, C.goldDeep, false) + speckleOn(cx, cy, r),
  kita: (cx, cy, r) => flatStack(cx, cy, r * 0.95, C.gold),
  // cakes
  "tres-leches-mini": (cx, cy, r) => cake(cx, cy, r, C.gold),
  "better-than-sex-mini": (cx, cy, r) => cake(cx, cy, r, C.coffee),
  "banana-mini-cake": (cx, cy, r) => cake(cx, cy, r, C.goldDeep),
  // sweets
  "buna-cookies": (cx, cy, r) => cookies(cx, cy, r, C.coffee),
  "dabo-kolo": (cx, cy, r) => nuggets(cx, cy, r, C.goldDeep),
  // drinks
  "spiced-tea": (cx, cy, r) => mug(cx, cy, r, C.berbere),
  "ethiopian-cold-brew": (cx, cy, r) => coldBrew(cx, cy, r, C.coffee),
  buna: (cx, cy, r) => coffeeBag(cx, cy, r, C.coffee),
  // sauces & spreads
  marinara: (cx, cy, r) => jar(cx, cy, r, C.berbere),
  "spiced-butter": (cx, cy, r) => jar(cx, cy, r, C.gold),
  "olive-tapenade": (cx, cy, r) => jar(cx, cy, r, C.green),
  "vinegar-spread": (cx, cy, r) => jar(cx, cy, r, C.goldDeep),
  // boxes
  "weekly-table": (cx, cy, r) => breadBox(cx, cy, r, C.berbere),
  "biweekly-hearth": (cx, cy, r) => breadBox(cx, cy, r * 0.92, C.gold),
  "monthly-gursha": (cx, cy, r) => breadBox(cx, cy, r * 1.05, C.green),
  "cake-box": (cx, cy, r) => breadBox(cx, cy, r, C.gold) + cake(cx, cy - r * 0.2, r * 0.45, C.berbere),
  "drinks-box": (cx, cy, r) => breadBox(cx, cy, r, C.coffee),
  "pantry-box": (cx, cy, r) => breadBox(cx, cy, r, C.green) + jar(cx, cy - r * 0.2, r * 0.4, C.berbere),
};

function speckleOn(cx, cy, r) {
  const rnd = mulberry32(3);
  let g = "";
  for (let i = 0; i < 18; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = rnd() * r * 0.85;
    g += `<circle cx="${(cx + Math.cos(a) * rad).toFixed(0)}" cy="${(cy + Math.sin(a) * rad).toFixed(0)}" r="1.8" fill="${C.coffee}" opacity="0.5"/>`;
  }
  return g;
}

/* ------------------------------ catalog --------------------------------- */

const items = [
  // breads
  { slug: "himbasha", cat: "breads", seed: 101 },
  { slug: "dabo", cat: "breads", seed: 102 },
  { slug: "difo-dabo", cat: "breads", seed: 103 },
  { slug: "awaze-dabo", cat: "breads", seed: 104 },
  { slug: "kibe-dabo", cat: "breads", seed: 105 },
  { slug: "dabo-formaggio", cat: "breads", seed: 106 },
  { slug: "ayb-dabo", cat: "breads", seed: 107 },
  { slug: "garlic-dabo", cat: "breads", seed: 108 },
  { slug: "olive-sundried-tomato-dabo", cat: "breads", seed: 109 },
  { slug: "sweet-milk-bread", cat: "breads", seed: 110 },
  { slug: "cinnamon-raisin", cat: "breads", seed: 111 },
  { slug: "kita", cat: "breads", seed: 112 },
  // cakes
  { slug: "tres-leches-mini", cat: "cakes", seed: 120 },
  { slug: "better-than-sex-mini", cat: "cakes", seed: 121 },
  { slug: "banana-mini-cake", cat: "cakes", seed: 122 },
  // sweets
  { slug: "buna-cookies", cat: "sweets", seed: 130 },
  { slug: "dabo-kolo", cat: "sweets", seed: 131 },
  // drinks
  { slug: "spiced-tea", cat: "drinks", seed: 140 },
  { slug: "ethiopian-cold-brew", cat: "drinks", seed: 141 },
  { slug: "buna", cat: "drinks", seed: 142 },
  // sauces & spreads
  { slug: "marinara", cat: "pantry", seed: 150 },
  { slug: "spiced-butter", cat: "pantry", seed: 151 },
  { slug: "olive-tapenade", cat: "pantry", seed: 152 },
  { slug: "vinegar-spread", cat: "pantry", seed: 153 },
  // boxes
  { slug: "weekly-table", cat: "subscription", seed: 160 },
  { slug: "biweekly-hearth", cat: "subscription", seed: 161 },
  { slug: "monthly-gursha", cat: "subscription", seed: 162 },
  { slug: "cake-box", cat: "subscription", seed: 163 },
  { slug: "drinks-box", cat: "subscription", seed: 164 },
  { slug: "pantry-box", cat: "subscription", seed: 165 },
];

mkdirSync(join(OUT, "menu"), { recursive: true });

let count = 0;
for (const it of items) {
  const w = 640,
    h = 480;
  const cx = w / 2,
    cy = h / 2 - 18;
  const r = 120;
  const draw = MOTIF[it.slug] ?? ((x, y, rr) => roundLoaf(x, y, rr, C.gold, true));
  const motif = draw(cx, cy, r);
  const svg = frame(w, h, PALETTES[it.cat], it.seed, plate(cx, cy, r) + motif, "");
  writeFileSync(join(OUT, "menu", `${it.slug}.svg`), svg);
  count++;
}

// hero — an abundant spread
{
  const w = 720,
    h = 820,
    cx = w / 2,
    cy = h / 2;
  const inner =
    plate(cx, cy - 40, 150) +
    roundLoaf(cx, cy - 40, 150, C.gold, true) +
    roundLoaf(cx - 180, cy + 150, 90, C.berbere, true) +
    roundLoaf(cx + 175, cy + 150, 95, C.goldDeep, false) +
    cake(cx - 150, cy - 195, 78, C.gold) +
    coffeeBag(cx + 180, cy - 170, 70, C.coffee) +
    jar(cx + 24, cy + 260, 62, C.berbere) +
    steam(cx);
  writeFileSync(join(OUT, "hero.svg"), frame(w, h, PALETTES.hero, 200, inner, ""));
  count++;
}

// story chapters — abstract warm scenes
const storyScenes = [
  (cx, cy) => roundLoaf(cx, cy, 110, C.gold, true) + steam(cx),
  (cx, cy) => mug(cx, cy, 110, C.berbere) + roundLoaf(cx + 150, cy + 55, 62, C.gold, true),
  (cx, cy) => breadBox(cx, cy, 130, C.green),
];
for (let i = 0; i < 3; i++) {
  const w = 640,
    h = 520,
    cx = w / 2,
    cy = h / 2;
  writeFileSync(
    join(OUT, `story-${i + 1}.svg`),
    frame(w, h, PALETTES.story, 300 + i, plate(cx, cy, 130) + storyScenes[i](cx, cy), "")
  );
  count++;
}

// open-graph card
{
  const w = 1200,
    h = 630,
    cx = w / 2,
    cy = h / 2;
  const tx = cx + 90;
  const inner = `${plate(cx - 360, cy, 150)}${roundLoaf(cx - 360, cy, 150, C.gold, true)}
    <text x="${tx}" y="${cy - 58}" text-anchor="middle" font-family="Georgia, serif" font-size="62" fill="${C.coffee}">Vibes Cuisine</text>
    <text x="${tx}" y="${cy + 14}" text-anchor="middle" font-family="Georgia, serif" font-size="62" fill="${C.coffee}">and Bakery</text>
    <text x="${tx}" y="${cy + 74}" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-style="italic" fill="${C.berbere}">Eritrean/Ethiopian baking, the welcome of a shared table.</text>
    <text x="${tx}" y="${cy + 122}" text-anchor="middle" font-family="Georgia, serif" font-size="25" fill="${C.green}">St. Paul, Minnesota</text>`;
  writeFileSync(join(OUT, "og-default.svg"), frame(w, h, PALETTES.hero, 400, inner, ""));
  count++;
}

console.log(`✓ generated ${count} SVG artworks in public/images/`);
