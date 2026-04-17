# Obsequium - WCAG 2.1 AA Compliant Static Site Generator

A static site generator built on Eleventy that outputs **WCAG 2.1 AA conformant** and **University of Iowa brand compliant** HTML pages by construction.

## Features

- ✅ **WCAG 2.1 AA Compliance** - Built-in accessibility by design
- ✅ **UIowa Brand Compliance** - Approved colors, typography, and brand chrome
- ✅ **Build-Time Gates** - Accessibility violations fail the build
- ✅ **Progressive Enhancement** - Works without JavaScript
- ✅ **Component Library** - Pre-validated accessible components
- ✅ **Automated Testing** - pa11y-ci, axe-core, Playwright integration

## Quick Start

[Bun](https://bun.sh) is the recommended toolchain for install and scripts (`bun install`, `bun run …`). **npm** (or **pnpm**) works the same way if you prefer—`package.json` scripts are unchanged.

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production (with all compliance checks)
bun run build

# Run accessibility tests (see Testing — browsers must be installed once)
bun run test:e2e
```

### Tooling notes

- **Day-to-day**: Bun for `install`, `dev`, and `build` is supported and fast; the build still runs Eleventy, the SSG linter, HTML validation, and pa11y-ci as defined in `package.json`.
- **Playwright**: End-to-end tests expect browser binaries. After install, run **`bunx playwright install`** (or `npx playwright install`) once per machine or CI image. Playwright remains a Node-oriented runner; you can use Bun to invoke it without chasing a “Bun-only” stack.
- **CI**: A practical pattern is Bun for dependency install + static build, with Node available when you need Playwright or other Node-native tooling.

## Project Structure

```
obsequium/
├── src/
│   ├── _data/           # Global data files
│   ├── _includes/       # Partials
│   ├── _layouts/        # Page layouts
│   ├── assets/
│   │   ├── css/         # Stylesheets
│   │   └── js/          # JavaScript (progressive enhancement)
│   ├── components/      # Nunjucks component templates (also built as demo pages)
│   ├── sites/           # Publishable sites (see sites.11tydata.js for URL mapping)
│   │   ├── sites.11tydata.js
│   │   ├── root/        # Home page at /
│   │   └── ...          # One folder per site (e.g. demo-project, law)
│   ├── favicon/         # Optional favicon assets (see root page front matter)
│   └── tokens/          # Design tokens (CSS variables)
├── lint/
│   ├── run-lint.js      # SSG-specific linter
│   └── validate-html.js # HTML validation
├── tests/
│   └── accessibility.spec.js  # Playwright a11y tests
├── compliance/
│   ├── exceptions/      # Exception records (§9)
│   └── release-checklist.md
└── _site/               # Built output
```

## Content and Sites

Obsequium is intended to support both individual pages and multiple independent sites in the same repo. Author site content under `src/sites/` (layouts, assets, and shared templates stay alongside it in `src/`) and treat `_site/` as build output only.

### Demo content vs output

`_site/` is always disposable build output and should never be edited or treated as source. The site root home page lives at `src/sites/root/index.md` (published at `/`). If you want a demo or template site to reference, keep it under `src/sites/` (see `src/sites/demo-project/` with `about/` and `contact/` pages) and delete it when you no longer need it.

### Add a single page

Create a Markdown file under `src/sites/<your-site>/` (or add a new site folder there) and include front matter:

```md
---
layout: base.njk
title: Example Page
description: Short, descriptive summary.
breadcrumbs:
  - label: Home
    href: /
  - label: Example Page
---

{% pageHeader "Example Page", "Optional intro copy." %}

## Section heading

Your content here.
```

If you want a one-off page that does not use the global navigation, set `navigation: false` in front matter:

```md
---
layout: base.njk
title: One-off Page
description: Short, descriptive summary.
navigation: false
---
```

### Add a standalone site (folder-scoped data)

To keep unrelated content separate, create a folder with a directory data file that overrides `site` and `navigation` for that subtree:

```
src/sites/law/
  law.json
  index.md
  admissions/
    index.md
```

Example `src/sites/law/law.json`:

```json
{
  "site": {
    "unitName": "College of Law",
    "unitFullName": "University of Iowa College of Law",
    "lang": "en"
  },
  "navigation": [
    { "label": "Home", "href": "/law/" },
    { "label": "Admissions", "href": "/law/admissions/" }
  ]
}
```

All pages inside `src/sites/law/` inherit that site branding and navigation, without affecting other content.

Published URLs omit the `sites` segment: `src/sites/law/index.md` becomes `/law/`, not `/sites/law/`. That mapping lives in `src/sites/sites.11tydata.js`. The `root/` folder is special-cased so `src/sites/root/index.md` is the home page at `/`.

### Build and preview

```bash
bun run dev
bun run build
```

Use the dev server to preview pages. Do not edit `_site/` directly.

### Publishing (avoid hand-picking files from `_site/`)

Built HTML references shared **CSS, JS, and favicon** under `_site/assets/` and `_site/favicon/`. If you copy only a subfolder such as `_site/demo-project/`, those assets are missing and the site will look broken.

**Option A — whole site (simplest)**  
Upload **everything inside `_site/`** to your host’s document root. All paths keep working, including multiple sites under one domain (e.g. `/`, `/demo-project/`).

**Option B — one site, one upload folder**  
After a build, run:

```bash
bun run package:site demo-project
```

That creates **`dist/demo-project/`** with that site’s HTML **plus** `assets/` and `favicon/` (when present). Upload the **contents** of `dist/demo-project/` to the server root for that site.

For the root home page only, use:

```bash
bun run package:site root
```

With **npm**, pass the slug after `--`: `npm run package:site -- demo-project`.

**Navigation URLs:** Directory data (e.g. `demo-project.json`) often uses paths like `/demo-project/`. If you deploy the packaged folder at your **apex** domain, change those `href` values to `/`, `/about/`, etc., so the menu matches production. The packaging script does not rewrite links.

## Build Pipeline

The build process includes mandatory gates that will **fail the build** if not met:

1. **Compile** - Eleventy builds content → HTML
2. **SSG Lint** - Custom rules for headings, landmarks, IDs, links, media, required footer URLs, and related checks (runs on built HTML under `_site/`, excluding `_site/components/` demo pages)
3. **HTML Validation** - Standards-valid HTML (same exclusions as SSG lint)
4. **A11y Scan** - pa11y-ci (configure target URLs so this scans your real routes; otherwise it may run zero pages)

The linter enforces that each checked page includes the **required footer links** (privacy, nondiscrimination, accessibility, etc.). It does **not** require that you host local pages at paths such as `/privacy`—only that those destinations appear in the footer.

## Design Tokens

All styling uses design tokens. No raw hex values allowed.

```css
/* Approved brand colors */
--ui-gold: #FFCD00;
--ui-black: #000000;
--ui-white: #FFFFFF;
--ui-blue: #00558C;

/* Typography */
--font-body: "Roboto", system-ui, sans-serif;
--font-display: "Antonio", var(--font-body);
--font-accent: "Zilla Slab", Georgia, serif;
```

See `src/tokens/tokens.css` for the complete token set.

## Components

All components follow strict accessibility contracts:

| Component | Keyboard | ARIA | Description |
|-----------|----------|------|-------------|
| Skip Link | Tab → Enter | - | Visible on focus, jumps to main |
| Site Nav | Tab, Enter, Escape | aria-expanded, aria-current | Dropdown support |
| Breadcrumbs | Tab | aria-label | Navigation trail |
| Accordion | Tab, Enter/Space | aria-expanded, aria-controls | Collapsible sections |
| Tabs | Arrow keys, Home/End | role="tablist", aria-selected | Tabbed content |
| Modal | Tab trap, Escape | role="dialog", aria-modal | Focus managed dialog |
| Forms | Standard | aria-describedby, aria-invalid | Error summary pattern |
| Alerts | - | role="status/alert", aria-live | Announcements |

## Required Elements

Every page must include:

- `<!doctype html>` and `<html lang="en">`
- Skip link to `#main-content`
- Brand Bar (gold background, IOWA logo)
- Brand Footer with required links:
  - Privacy Notice
  - Nondiscrimination Statement  
  - Accessibility
  - Report an accessibility issue
- Exactly one `<h1>`, sequential headings
- No duplicate IDs
- All images with alt text (or marked decorative)
- All form controls with labels

## Exceptions

If content cannot meet accessibility requirements, an exception record must be created:

```json
{
  "type": "third-party",
  "scope": ["/path/to/page/"],
  "rationale": "Why this exception is necessary",
  "owner": "Responsible department",
  "reviewBy": "2026-09-01",
  "accommodation": "How users get accessible alternative",
  "approvalRef": "TICKET-1234"
}
```

Place exception records in `/compliance/exceptions/`.

## Testing

### Automated (every build)

```bash
bun run lint:ssg        # Custom accessibility rules
bun run validate:html   # HTML validation
bun run audit:a11y      # pa11y-ci scan (add a pa11y-ci config if you need non-zero URL coverage)
bun run audit:axe       # axe-core on every HTML file under _site/ (see below)
bun run test:e2e        # Playwright tests (install browsers: bunx playwright install)
```

Use `npm run …` instead of `bun run …` if you are not using Bun.

### axe scan on built HTML (`audit:axe`)

After `bun run build:eleventy` (or whenever you have a folder of static HTML), run:

```bash
bunx playwright install   # once per machine
bun run audit:axe # defaults to ./_site
```

Scan another output folder (e.g. agent-generated HTML):

```bash
bun run audit:axe path/to/html-folder
# or
A11Y_HTML_DIR=dist/demo-project bun run audit:axe
```

Flags: `--warn` exits 0 even if violations exist (print only); `--json` prints structured results.

This uses **axe** with WCAG 2.0/2.1 A and AA tags. It does **not** judge Iowa branding (colors/logotype rules are separate). Iterate: fix reported issues, re-run the script until clean or until remaining items are documented exceptions.

### Manual (before release)

Complete `/compliance/release-checklist.md`:

- Keyboard-only walkthrough
- Screen reader testing (VoiceOver + NVDA)
- 200% zoom and 320px width reflow
- Reduced motion behavior

## License

MIT

## Support

For accessibility issues, contact [lib-accessibility@uiowa.edu](mailto:lib-accessibility@uiowa.edu)
