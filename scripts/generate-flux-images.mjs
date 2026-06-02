#!/usr/bin/env node
/**
 * Replace the on-brand SVG placeholders with real photography rendered by
 * Cloudflare Workers AI (Flux). Reads scripts/image-prompts.json, renders each
 * prompt, writes JPEGs into public/images/, and (with --apply) repoints the
 * site's image references from .svg to .jpg.
 *
 * Requirements (set in your shell, NOT committed):
 *   export CLOUDFLARE_ACCOUNT_ID=...        # from the Cloudflare dashboard
 *   export CLOUDFLARE_API_TOKEN=...         # token with "Workers AI: Read" scope
 *
 * Usage:
 *   node scripts/generate-flux-images.mjs            # render images only
 *   node scripts/generate-flux-images.mjs --apply    # render + switch refs to .jpg
 *
 * Model: @cf/black-forest-labs/flux-1-schnell (fast, high quality).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const APPLY = process.argv.includes("--apply");

if (!ACCOUNT || !TOKEN) {
  console.error(
    "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.\n" +
      "Create a token with the 'Workers AI' permission and export both, then re-run."
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(ROOT, "scripts", "image-prompts.json"), "utf8"));
const style = manifest._style ?? "";
const endpoint = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${MODEL}`;

async function render(prompt) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ prompt: `${prompt}. ${style}`, steps: 8 }),
  });
  if (!res.ok) throw new Error(`Flux ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data?.result?.image;
  if (!b64) throw new Error("No image in Flux response");
  return Buffer.from(b64, "base64");
}

let ok = 0;
for (const entry of manifest.images) {
  const outPath = join(ROOT, "public", entry.file);
  mkdirSync(dirname(outPath), { recursive: true });
  try {
    process.stdout.write(`→ ${entry.file} … `);
    const buf = await render(entry.prompt);
    writeFileSync(outPath, buf);
    console.log(`ok (${(buf.length / 1024).toFixed(0)} kB)`);
    ok++;
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }
}
console.log(`\nRendered ${ok}/${manifest.images.length} images.`);

if (APPLY && ok > 0) {
  const targets = [
    "src/data/menu.ts",
    "src/pages/index.astro",
    "src/pages/our-story.astro",
    "src/components/SEO.astro",
  ];
  for (const rel of targets) {
    const p = join(ROOT, rel);
    let src = readFileSync(p, "utf8");
    // Note: og-default stays SVG (it's a text card, not in the Flux manifest).
    src = src
      .replace(/\/images\/menu\/([a-z0-9-]+)\.svg/g, "/images/menu/$1.jpg")
      .replace(/\/images\/hero\.svg/g, "/images/hero.jpg")
      .replace(/\/images\/story-(\$\{i \+ 1\}|\d)\.svg/g, "/images/story-$1.jpg");
    writeFileSync(p, src);
  }
  console.log("Applied .jpg references. Rebuild with `npm run build`.");
}
