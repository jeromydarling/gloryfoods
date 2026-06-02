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
  sweets: [C.berbere, C.goldDeep],
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

const MOTIF = {
  himbasha: (cx, cy, r) => roundLoaf(cx, cy, r, C.gold, true),
  dabo: (cx, cy, r) => roundLoaf(cx, cy, r, C.goldDeep, false) + speckleOn(cx, cy, r),
  "difo-dabo": (cx, cy, r) => roundLoaf(cx, cy, r * 1.05, C.berbere, true),
  injera: (cx, cy, r) => flatStack(cx, cy, r, C.parchmentDeep),
  "ambasha-berbere": (cx, cy, r) => roundLoaf(cx, cy, r, C.berbere, true),
  kita: (cx, cy, r) => flatStack(cx, cy, r * 0.95, C.gold),
  mushabek: (cx, cy, r) => spiral(cx, cy, r, C.berbere),
  "buna-cookies": (cx, cy, r) => cookies(cx, cy, r, C.coffee),
  "dabo-kolo": (cx, cy, r) => nuggets(cx, cy, r, C.goldDeep),
  buna: (cx, cy, r) => coffeeBag(cx, cy, r, C.coffee),
  "weekly-table": (cx, cy, r) => breadBox(cx, cy, r, C.berbere),
  "biweekly-hearth": (cx, cy, r) => breadBox(cx, cy, r * 0.92, C.gold),
  "monthly-gursha": (cx, cy, r) => breadBox(cx, cy, r * 1.05, C.green),
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
  { slug: "himbasha", cat: "breads", seed: 101 },
  { slug: "dabo", cat: "breads", seed: 102 },
  { slug: "difo-dabo", cat: "breads", seed: 103 },
  { slug: "injera", cat: "breads", seed: 104 },
  { slug: "ambasha-berbere", cat: "breads", seed: 105 },
  { slug: "kita", cat: "breads", seed: 106 },
  { slug: "mushabek", cat: "sweets", seed: 107 },
  { slug: "buna-cookies", cat: "sweets", seed: 108 },
  { slug: "dabo-kolo", cat: "sweets", seed: 109 },
  { slug: "buna", cat: "pantry", seed: 110 },
  { slug: "weekly-table", cat: "subscription", seed: 111 },
  { slug: "biweekly-hearth", cat: "subscription", seed: 112 },
  { slug: "monthly-gursha", cat: "subscription", seed: 113 },
];

mkdirSync(join(OUT, "menu"), { recursive: true });

let count = 0;
for (const it of items) {
  const w = 640,
    h = 480;
  const cx = w / 2,
    cy = h / 2 - 18;
  const r = 120;
  const motif = MOTIF[it.slug](cx, cy, r);
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
    flatStack(cx - 150, cy - 200, 80, C.parchmentDeep) +
    coffeeBag(cx + 180, cy - 170, 70, C.coffee) +
    spiral(cx + 30, cy + 260, 70, C.berbere) +
    steam(cx);
  writeFileSync(join(OUT, "hero.svg"), frame(w, h, PALETTES.hero, 200, inner, ""));
  count++;
}

// story chapters — abstract warm scenes
const storyScenes = [
  (cx, cy) => roundLoaf(cx, cy, 110, C.gold, true) + steam(cx),
  (cx, cy) => flatStack(cx, cy, 130, C.parchmentDeep) + roundLoaf(cx + 150, cy + 60, 70, C.berbere, true),
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
  const inner = `${plate(cx - 360, cy, 150)}${roundLoaf(cx - 360, cy, 150, C.gold, true)}
    <text x="${cx + 60}" y="${cy - 40}" text-anchor="middle" font-family="Georgia, serif" font-size="76" fill="${C.coffee}">Selam Bakehouse</text>
    <text x="${cx + 60}" y="${cy + 36}" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="${C.berbere}">Ethiopian baking, the welcome of a shared table.</text>
    <text x="${cx + 60}" y="${cy + 96}" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="${C.green}">St. Paul, Minnesota</text>`;
  writeFileSync(join(OUT, "og-default.svg"), frame(w, h, PALETTES.hero, 400, inner, ""));
  count++;
}

console.log(`✓ generated ${count} SVG artworks in public/images/`);
