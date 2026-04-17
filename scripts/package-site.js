#!/usr/bin/env node
/**
 * After `bun run build:eleventy` (or full `build`), copy one site's built HTML plus
 * shared static assets into dist/<slug>/ — a single folder you can upload to a host root.
 *
 * Usage: node scripts/package-site.js <slug>
 * Examples:
 *   node scripts/package-site.js demo-project
 *   node scripts/package-site.js root
 *
 * For sites under src/sites/<slug>/, slug is the folder name. The root home page is slug "root".
 *
 * Navigation/breadcrumb hrefs in your site data still must match how you deploy (e.g. /demo-project/
 * vs /). This script only bundles files; it does not rewrite links.
 */

const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
const repoRoot = process.cwd();
const siteOut = path.join(repoRoot, "_site");
const distBase = path.join(repoRoot, "dist");

if (!slug) {
  console.error("Usage: node scripts/package-site.js <slug>");
  console.error('  slug: folder name under src/sites/ (e.g. demo-project), or "root" for the home page.');
  process.exit(1);
}

if (!fs.existsSync(siteOut)) {
  console.error(`Missing ${path.relative(repoRoot, siteOut)}. Run build:eleventy first.`);
  process.exit(1);
}

const dest = path.join(distBase, slug);
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

if (slug === "root") {
  const indexHtml = path.join(siteOut, "index.html");
  if (!fs.existsSync(indexHtml)) {
    console.error("No _site/index.html found. Build the site first.");
    process.exit(1);
  }
  fs.copyFileSync(indexHtml, path.join(dest, "index.html"));
} else {
  const srcDir = path.join(siteOut, slug);
  if (!fs.existsSync(srcDir)) {
    console.error(`No _site/${slug}/ found. Check the slug matches your src/sites/ folder name.`);
    process.exit(1);
  }
  fs.cpSync(srcDir, dest, { recursive: true });
}

const assetsSrc = path.join(siteOut, "assets");
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, path.join(dest, "assets"), { recursive: true });
} else {
  console.warn("Warning: _site/assets/ missing; packaged site may have no CSS/JS.");
}

const faviconSrc = path.join(siteOut, "favicon");
if (fs.existsSync(faviconSrc)) {
  fs.cpSync(faviconSrc, path.join(dest, "favicon"), { recursive: true });
}

console.log(`Packaged site "${slug}" → ${path.relative(repoRoot, dest)}/`);
console.log("Upload the contents of that folder to your server document root (or adjust nav hrefs if paths differ).");
