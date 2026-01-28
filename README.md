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

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (with all compliance checks)
npm run build

# Run accessibility tests
npm run test:e2e
```

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
│   ├── components/      # Nunjucks component templates
│   ├── tokens/          # Design tokens (CSS variables)
│   └── *.md             # Content pages
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

Obsequium is intended to support both individual pages and multiple independent sites in the same repo. Author content in `src/` and treat `_site/` as build output only.

### Demo content vs output

`_site/` is always disposable build output and should never be edited or treated as source. The root `src/index.md` is a neutral starter page you can replace. If you want a demo or template site to reference, keep it under `src/` (see `src/demo-project/` with `about/` and `contact/` pages) and delete it when you no longer need it.

### Add a single page

Create a Markdown file in `src/` (or a subfolder) and include front matter:

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

### Build and preview

```bash
npm run dev
npm run build
```

Use the dev server to preview pages. Do not edit `_site/` directly.

## Build Pipeline

The build process includes mandatory gates that will **fail the build** if not met:

1. **Compile** - Eleventy builds content → HTML
2. **SSG Lint** - Custom rules for headings, landmarks, IDs, links, media
3. **HTML Validation** - Standards-valid HTML
4. **A11y Scan** - WCAG 2.1 AA automated scan (pa11y-ci with axe + htmlcs)
5. **Route Audit** - Required routes exist (privacy, accessibility, etc.)

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
npm run lint:ssg        # Custom accessibility rules
npm run validate:html   # HTML validation
npm run audit:a11y      # pa11y-ci scan
npm run test:e2e        # Playwright tests
```

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
