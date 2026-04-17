#!/usr/bin/env node
/**
 * Run axe-core against local HTML files (no Eleventy required for this step).
 * Use after any static build, or point at a folder of HTML your agent emitted.
 *
 * Usage:
 *   node scripts/audit-a11y-html.js [path]
 *   A11Y_HTML_DIR=dist/demo-project node scripts/audit-a11y-html.js
 *
 * Requires Playwright browsers: bunx playwright install
 *
 * Flags:
 *   --json   Print one JSON object per file (machine-readable)
 *   --warn   Exit 0 even when violations exist (only print)
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

function parseArgs(argv) {
  const warnOnly = argv.includes("--warn");
  const asJson = argv.includes("--json");
  const positional = argv.filter((a) => !a.startsWith("--"));
  const dirArg = positional[2] || process.env.A11Y_HTML_DIR || "_site";
  return { root: path.resolve(process.cwd(), dirArg), warnOnly, asJson };
}

function shouldSkip(relPath) {
  return relPath.includes(`${path.sep}components${path.sep}`);
}

function printViolationsHuman(fileLabel, results) {
  const v = results.violations || [];
  if (v.length === 0) {
    console.log(`OK  ${fileLabel} - no axe violations (WCAG tags applied)`);
    return;
  }
  console.log(`\nFAIL ${fileLabel} - ${v.length} violation group(s)`);
  for (const rule of v) {
    console.log(`\n  [${rule.id}] ${rule.impact ? rule.impact.toUpperCase() : "-"}`);
    console.log(`  ${rule.help}`);
    console.log(`  Help: ${rule.helpUrl}`);
    const nodes = (rule.nodes || []).slice(0, 5);
    for (const n of nodes) {
      const target = (n.target || []).join(" > ");
      console.log(`    - ${target}`);
      if (n.failureSummary) {
        const lines = String(n.failureSummary).trim().split("\n");
        for (const line of lines.slice(0, 3)) {
          console.log(`      ${line.trim()}`);
        }
      }
    }
    const rest = (rule.nodes || []).length - nodes.length;
    if (rest > 0) {
      console.log(`    ... +${rest} more node(s)`);
    }
  }
}

async function main() {
  const { root, warnOnly, asJson } = parseArgs(process.argv);

  if (!fs.existsSync(root)) {
    console.error(`Directory not found: ${root}`);
    console.error("Build the site first, or pass a path to your HTML output.");
    process.exit(1);
  }

  const pattern = path.join(root, "**/*.html").replace(/\\/g, "/");
  let files = glob.sync(pattern);
  files = files.filter((f) => !shouldSkip(path.relative(root, f)));

  if (files.length === 0) {
    console.error(`No HTML files under ${root}`);
    process.exit(1);
  }

  console.log(`axe scan: ${files.length} file(s) under ${path.relative(process.cwd(), root) || "."}`);
  console.log(`tags: ${WCAG_TAGS.join(", ")}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.error("Could not launch Chromium. Install browsers with: bunx playwright install");
    console.error(e.message || e);
    process.exit(1);
  }

  let totalViolations = 0;
  const allResults = [];

  try {
    for (const filePath of files.sort()) {
      const page = await browser.newPage();
      const fileUrl = "file://" + filePath.split(path.sep).join("/");
      try {
        await page.goto(fileUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
      } catch (e) {
        console.error(`\n! Could not load ${filePath}: ${e.message}`);
        await page.close();
        continue;
      }

      let results;
      try {
        results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      } catch (e) {
        console.error(`\n! axe failed on ${filePath}: ${e.message}`);
        await page.close();
        continue;
      }

      await page.close();

      const label = path.relative(process.cwd(), filePath);
      const count = (results.violations || []).reduce((n, r) => n + (r.nodes || []).length, 0);
      totalViolations += count;

      if (asJson) {
        allResults.push({
          file: label,
          violations: results.violations,
          incomplete: results.incomplete,
          passes: results.passes ? results.passes.length : 0,
        });
      } else {
        printViolationsHuman(label, results);
      }
    }
  } finally {
    await browser.close();
  }

  if (asJson) {
    console.log(JSON.stringify(allResults, null, 2));
  }

  console.log(`\n---\nTotal failing nodes (sum across rules): ${totalViolations}`);

  if (totalViolations > 0 && !warnOnly) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
