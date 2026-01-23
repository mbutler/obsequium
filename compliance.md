# Title II + UIowa SSG Engineering Specification

**Scope:** Eleventy-based SSG + mandatory UI chrome + vetted component library + build-time gates.
**Output:** Static HTML/CSS/JS that is (1) WCAG 2.1 AA conformant and (2) UIowa web brand compliant by construction.

## 1) System Architecture Requirements

### 1.1 Build stages (hard gates)

**Build MUST fail** if any stage fails.

1. **Compile**: content → HTML
2. **Structural lint**: SSG-specific rules (headings, landmarks, IDs, links, media requirements, token usage)
3. **HTML validation**: standards-valid HTML (Nu validator or equivalent)
4. **A11y scan**: WCAG2AA automated scan (pa11y-ci w/ axe + htmlcs) threshold=0
5. **Route audit**: internal link integrity + required routes exist (privacy, nondiscrimination, accessibility, a11y help contact)
6. **Asset audit**: fonts, favicon, tokens, CSP/crossorigin requirements for hosted assets

### 1.2 Deterministic builds

* Build output MUST be deterministic given the same inputs (no network fetches at build unless vendored).
* All component JS MUST be bundled and versioned; no ad-hoc inline scripts per page except a minimal bootloader.

### 1.3 Progressive enhancement

* Every component MUST render a functional, accessible baseline in HTML/CSS without JS.
* JS MAY enhance behavior, but MUST NOT be required for basic content access, navigation, or form submission.

---

## 2) Global HTML Contract (applies to every page)

### 2.1 Document skeleton (required)

Every page MUST include:

* `<!doctype html>`
* `<html lang="…">` populated from page metadata with default `en`
* `<meta charset="utf-8">`
* `<meta name="viewport" content="width=device-width, initial-scale=1">`
* `<title>` unique and descriptive
* Visible-on-focus skip link: `<a href="#main-content">Skip to main content</a>`
* Landmarks in correct roles/semantics:

  * `header` (brand bar)
  * `nav` (primary site nav) when navigation exists
  * `main id="main-content"` exactly once
  * `footer` (brand footer)

### 2.2 Focus contract

* `#main-content` MUST be focusable when navigated to by skip link: `tabindex="-1"` on `<main>` (or a first focusable child target).
* No component may remove outlines without providing an accessible alternative.

### 2.3 Heading contract

* Exactly one `h1` per page.
* Heading levels MUST be sequential (no skipping) within the content region.
* Components that introduce headings (e.g., cards, accordions) MUST accept a `headingLevel` param or inherit context to avoid structural violations.

### 2.4 ID and name contract

* No duplicate IDs within a page.
* All interactive controls MUST have an accessible name (visible label or aria-label/aria-labelledby).
* All form controls MUST have an associated label.

---

## 3) UIowa Brand Chrome: Non-Optional Components

### 3.1 Brand Bar (Header) component MUST exist on all “core site” pages

**Required output:**

* Gold background `#FFCD00`
* Black text and links `#000000`
* Block IOWA tab (SVG) linked to `https://www.uiowa.edu`
* Logo alt text MUST be: `University of Iowa homepage`
* Site title MUST be the **formal unit name only** (no icons, taglines, acronyms, extra words)

**Engineering constraints:**

* Provide a single `BrandBar` component used everywhere; no page-level reimplementation allowed.
* Enforce allowed colors via tokens only (see §4).

### 3.2 Brand Footer component MUST exist on all pages

**Required output:**

* Black background `#000000`
* White text `#FFFFFF`
* Gold links `#FFCD00`
* Block IOWA logo (gold) linked to `https://www.uiowa.edu` with alt text: `University of Iowa homepage`
* Required links:

  * `https://uiowa.edu/privacy`
  * `https://opsmanual.uiowa.edu/community-policies/nondiscrimination-statement`
  * `https://accessibility.uiowa.edu/`
* Unit title, address, and contact info
* Copyright `© {year} The University of Iowa`
* Accessibility help link (local) to report an accessibility issue (see §6.9)

**Footer MUST NOT contain:** other logos, images/video, unit lockups, taglines, long marketing text blocks.

### 3.3 Favicon

* Only approved favicon assets permitted (no edits). Provide a config switch:

  * `favicon: true` injects the approved favicon set.

---

## 4) Design Tokens and Styling Requirements

### 4.1 Token-only styling

All UI colors, typography, spacing, borders, focus rings MUST come from tokens. No “random hex” allowed in component CSS.

**Minimum required tokens:**

```css
:root{
  --ui-gold:#FFCD00;
  --ui-black:#000000;
  --ui-white:#FFFFFF;

  /* supported neutrals per brand guidance */
  --ui-gray-10:#63666A;
  --ui-blue:#00558C;

  --font-body:"Roboto", system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  --font-display:"Antonio", var(--font-body);
  --font-accent:"Zilla Slab", Georgia, serif;

  --focus-outline: 3px solid var(--ui-blue);
  --focus-outline-offset: 2px;

  --radius-1: 4px;
  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
}
```

### 4.2 Contrast enforcement

* Text MUST meet 4.5:1 contrast (normal text) and 3:1 for large text.
* Engine MUST block known failing combos by default:

  * Gold text on white
  * White text on gold
* Focus indicators MUST be visible and meet contrast requirements.

### 4.3 Motion

* All animations/transitions MUST respect `prefers-reduced-motion: reduce`.
* If motion is non-essential, it MUST be disabled under reduced-motion.

---

## 5) Content Model and Authoring Constraints

### 5.1 Required front matter schema (per page)

Each content page MUST provide:

* `title` (string, required)
* `lang` (string, default `en`)
* `description` (string, required for SEO/accessibility summaries)
* `unitName` (string; formal unit name)
* `contact` object:

  * `addressLines[]` (1–3 lines)
  * `city`, `state`, `zip`
  * `phone` (display + e164)
  * `email`
  * `accessibilityHelpUrl` (local URL, required)

### 5.2 Markdown/MDX constraints (enforced)

The renderer MUST enforce:

* No heading skips
* Images require alt text (or explicit decorative marker)
* Tables must include header row (and captions for non-trivial tables)
* No raw HTML that introduces interactive behavior unless through vetted shortcodes/components

### 5.3 Media constraints

* Any embedded video/audio MUST provide:

  * Captions (video) and/or transcript link
  * A visible transcript link adjacent to the player (or below)

---

## 6) Component Library Specification Pack (Single Source of Truth)

### Common requirements for all components

Every component MUST define:

* **API** (props/inputs)
* **Rendered HTML contract** (structure + required attributes)
* **Keyboard behavior**
* **Screen reader behavior** (naming, announcements)
* **Focus management** (where focus goes on open/close, errors)
* **States** (disabled, error, expanded, selected)
* **Do-not** rules (anti-patterns)
* **Automated tests** required

Below is the minimum component set you need for a complete “SSG platform.”

---

### 6.1 Skip Link

**API:** none (global)
**HTML:**

* `<a class="skip-link" href="#main-content">Skip to main content</a>`
* Visible on focus, hidden otherwise.
  **Keyboard:** Tab → focus visible; Enter jumps to main and main receives focus.
  **Tests:** presence on every page; skip target exists.

---

### 6.2 Primary Navigation (SiteNav)

**API:**

* `items: [{label, href, children?}]`
* `currentUrl`
* `ariaLabel` default “Primary”

**HTML contract:**

* `<nav aria-label="Primary">`
* list structure `<ul><li><a></a></li></ul>`
* current page indicated with `aria-current="page"` on the active link.
* Dropdowns MUST be button-driven (not hover-only).

**Keyboard:**

* Tab navigates links and toggle buttons.
* If dropdowns exist: toggle button opens/closes with Enter/Space.
* Escape closes open dropdown and returns focus to toggle.

**Do-not:**

* No hover-only open.
* No focus traps.

**Tests:**

* aria-current correct
* dropdown toggles have accessible name
* Escape closes dropdown

---

### 6.3 Breadcrumbs

**API:** `items: [{label, href?}]`

* last item no link

**HTML:**

* `<nav aria-label="Breadcrumb"><ol>…</ol></nav>`

**Keyboard:** standard links
**Tests:** label and order.

---

### 6.4 Page Header (H1 block)

**API:** `title`, `intro?`, `meta?`
**HTML:** `h1` only here (enforced)
**Tests:** exactly one h1 per page.

---

### 6.5 Link

**Rule (global):**

* If it navigates: `<a href>`
* Accessible name MUST be descriptive out of context.
* If opens new window/tab, MUST signal in text (preferred) or with an accessible hint.

**Do-not:** click handlers on `<div>`/`span`.

---

### 6.6 Button

**API:** `type`, `variant`, `disabled`, `name`
**HTML:** `<button type="button|submit">`
**Keyboard:** native
**Tests:** name present; disabled state correct.

---

### 6.7 Icon

**API:** `decorative` boolean; `label?`

* If decorative: `aria-hidden="true" focusable="false"`
* If informative: include accessible label via surrounding control, not the SVG itself.

---

### 6.8 Alerts (Status + Error)

Two variants: **status** and **assertive error**

**API:**

* `variant: "info" | "success" | "warning" | "error"`
* `title?`, `content`
* `live: "polite" | "assertive" | "off"`

**HTML:**

* Status: `role="status"` + `aria-live="polite"` (if dynamic)
* Error: `role="alert"` + `aria-live="assertive"` (if dynamic)

**Keyboard:** not focusable by default; if contains actions, those are focusable.

**Tests:** correct role/live behavior.

---

### 6.9 Accessibility Help Link (Required)

**Component:** `A11yHelpLink` placed in footer and/or header utility area.
**API:** `href`, `label` default “Report an accessibility issue”
**Requirements:**

* MUST be present on every page.
* MUST be a standard link (not JS).

---

### 6.10 Forms (FormShell + Field components)

You should not allow raw `<input>` in templates; require field components.

#### 6.10.1 FormShell

**API:** `action`, `method`, `title?`, `errorSummary?`
**HTML:** `form` with optional error summary at top when validation fails.

#### 6.10.2 FieldText / FieldEmail / FieldTel / FieldTextarea

**API:** `id`, `name`, `label`, `hint?`, `required?`, `error?`, `autocomplete?`, `value?`

**HTML contract:**

* `<label for="{id}">`
* `hint` uses `id="{id}-hint"` and referenced by `aria-describedby`
* error uses `id="{id}-error"` and referenced by `aria-describedby`
* if error present: input `aria-invalid="true"`

**Error summary:**

* Renders at top with `role="alert"` (assertive)
* Contains links to each invalid field `href="#{id}"`

**Keyboard/focus:**

* On submit with errors: focus moves to error summary; clicking error link moves focus to field.

**Tests:**

* label association
* describedby includes hint/error
* error summary links correct

#### 6.10.3 FieldCheckbox / FieldRadio

* Group MUST be wrapped in `<fieldset><legend>…</legend>`
* Each option has a label.

---

### 6.11 Accordion

**API:** `items: [{id, heading, contentHtml}]`, `allowMultiple?: boolean`
**HTML:**

* Each header is a `<button>`:

  * `aria-expanded="true|false"`
  * `aria-controls="{panelId}"`
* Panel:

  * `id="{panelId}"`, `role="region"`
  * `aria-labelledby="{buttonId}"`

**Keyboard:**

* Tab focuses headers.
* Enter/Space toggles.
* Optional roving focus (Up/Down) if you implement; if not, keep simple.

**Focus:**

* On open, focus stays on button.

**Tests:** expanded states and associations valid.

---

### 6.12 Modal / Dialog

**API:** `id`, `title`, `content`, `triggerLabel`, `closeLabel="Close"`
**HTML:**

* Use `<dialog>` if you can polyfill accessibly, or a div-based pattern:

  * container: `role="dialog" aria-modal="true" aria-labelledby="{titleId}"`
* Must include close button with accessible name.

**Keyboard:**

* Opening: focus moves into modal (first focusable; prefer heading then first action)
* Tab: focus trapped within modal
* Escape: closes modal
* Closing: focus returns to the triggering control

**Do-not:**

* No `aria-hidden` misuse; if you set inert, do so consistently.
* No background scrolling when modal open.

**Tests:** focus trap, Esc close, return focus.

---

### 6.13 Tabs

**API:** `tabs: [{id, label, panelHtml}]`
**HTML:**

* Tablist: `role="tablist"`
* Tabs: `role="tab"`, `aria-selected`, `tabindex=0/-1`, `aria-controls`
* Panels: `role="tabpanel"`, `aria-labelledby`

**Keyboard:**

* Left/Right arrow moves active tab
* Home/End jumps
* Enter/Space activates (or auto-activate on focus, but be consistent)

**Tests:** roving tabindex and aria-selected correctness.

---

### 6.14 Pagination

**API:** `currentPage`, `totalPages`, `baseUrl`
**HTML:** `<nav aria-label="Pagination">` with list of links

* Current indicated via `aria-current="page"`

**Keyboard:** links only
**Tests:** correct current.

---

### 6.15 Cards (Content summary)

**API:** `title`, `href?`, `body`, `meta?`
**Rules:**

* Entire card may be clickable ONLY if implemented as a single link wrapper and does not create nested interactive controls.
* If card contains buttons/links, do not make the entire card a link.

---

### 6.16 Tables (DataTable)

**API:** `caption`, `headers[]`, `rows[][]`, `layout?: "auto"|"fixed"`
**HTML:**

* `<table>`
* `<caption>` required when table is non-trivial
* `<th scope="col">` and/or row headers as needed
* No tables used for layout.

**Tests:** caption existence rules.

---

### 6.17 Search (if you have it)

Search is a “feature” not just UI; it must be accessible.

**SearchBox API:** `action`, `queryParam="q"`, `label="Search this site"`
**HTML:**

* Label + input with autocomplete hints
* Submit button

**Results page:**

* h1 “Search results”
* result count in text
* results as list of links with excerpts
* keyboard accessible filters if any

---

### 6.18 Media Embed Wrapper

**API:**

* `provider`, `src`, `title`, `transcriptHref`, `captionsProvided: boolean`
  **Rules:**
* iframe MUST have `title` describing content
* Transcript link MUST be visible and adjacent
* If captions/transcript missing → build fails unless exception record exists

---

### 6.19 Code Blocks

**Rules:**

* Use semantic `<pre><code>`
* Ensure sufficient contrast
* Allow horizontal scroll without breaking layout
* Provide “copy” button only if it’s accessible (button, label, keyboard, announces “copied” via status)

---

## 7) SSG Lint Rule Catalog (Build-Failing)

Implement as a deterministic linter that runs before pa11y to provide developer-friendly errors.

### 7.1 Page-level rules

Fail if:

* Missing `lang`
* Missing skip link or missing target
* Missing required landmarks
* Missing BrandBar or BrandFooter
* Missing required footer links
* Missing accessibility help link
* Multiple `h1` or skipped headings
* Duplicate IDs
* Empty link text or icon-only controls without labels
* Images without alt or decorative not marked correctly
* Table without headers (data table)
* Media embed without transcript/captions metadata

### 7.2 Style/token rules

Fail if:

* Any non-token color is used in component CSS (lint compiled CSS)
* Focus outline removed without replacement
* Gold/white text combos used where contrast fails

### 7.3 Component contract rules

Fail if:

* Component renders prohibited patterns (e.g., clickable div, nested links, invalid ARIA)
* Any ARIA attribute invalid for role/element

---

## 8) CI Test Matrix (What to Automate)

### 8.1 Automated (required every PR)

* `lint:ssg` (your rule catalog)
* `validate:html` (Nu validator)
* `audit:a11y` (pa11y-ci; axe + htmlcs; threshold 0)
* `test:e2e:keyboard` (Playwright/Cypress minimal script)

  * Tab order sanity for core templates
  * Modal focus trap test
  * Dropdown Escape close test

### 8.2 Manual verification (release-blocking)

You do not need “boilerplate,” but you do need a short, fixed checklist stored as a release artifact. Minimum:

* Keyboard-only walkthrough: home, nav, content page, any forms, any dialogs
* Screen reader smoke: at least one macOS + one Windows SR
* 200% zoom + 320px width reflow
* Reduced motion behavior
* Media pages: captions and transcript accuracy check

---

## 9) Exceptions (Engineering Implementation)

Exceptions exist to prevent developers from “hacking around” requirements.

### 9.1 Exception record (machine-readable)

If you permit an exception at all, it MUST be explicit:

`/compliance/exceptions/{slug}.json` containing:

* `type` (archived | third-party | pre-existing-doc | alternate-version | other)
* `scope` (urls)
* `rationale`
* `owner`
* `reviewBy` date
* `accommodation` (how users get accessible alternative)
* `approvalRef` (ticket or approval identifier)

### 9.2 Engine behavior

* If a violation is covered by an exception record: build may pass, but output MUST include an “Accessibility alternative” section on the affected page linking to the accommodation pathway.
* No exception record → hard fail.

---

## 10) What Developers Implement First (Implementation Order)

1. Base layout + BrandBar + BrandFooter + SkipLink
2. Token system + CSS lint
3. Linter rule catalog (page-level)
4. Form components + error summary pattern
5. Modal + Accordion + Tabs patterns
6. Media wrapper + transcript enforcement
7. Navigation dropdowns + breadcrumbs + pagination
8. Search (if required)
9. E2E keyboard tests + a11y scans wired into CI

---

## 11) Deliverables the SSG Repository Must Contain

* `/components/` (only approved components; no raw HTML for interactive features)
* `/tokens/` (CSS variables + documentation)
* `/lint/` (rule catalog, errors, docs)
* `/compliance/` (exception registry + release checklist templates)
* `/templates/` (base + page templates)
* `/tests/` (e2e + unit tests for contracts)

---

If you want this to be maximally implementation-ready, the next refinement is to convert §6 into a **component contract table** (one row per component: required DOM, required ARIA, keyboard map, focus behavior, test IDs) plus a **linter error catalog** (exact error codes/messages). I can produce that as an addendum in the same single-document style, but with those two sections as dense, developer-usable reference blocks.
