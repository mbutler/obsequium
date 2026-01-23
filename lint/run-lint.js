/**
 * SSG Linter - Build-Failing Rules
 * Implements rule catalog per §7 of compliance spec
 */

const glob = require('glob');
const { readFileSync } = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const SITE_DIR = '_site';

// Error codes
const ERRORS = {
  // Page-level rules
  'E001': 'Missing lang attribute on <html>',
  'E002': 'Missing skip link',
  'E003': 'Missing skip link target (#main-content)',
  'E004': 'Missing required landmark: {landmark}',
  'E005': 'Missing BrandBar component',
  'E006': 'Missing BrandFooter component',
  'E007': 'Missing required footer link: {link}',
  'E008': 'Missing accessibility help link',
  'E009': 'Multiple h1 elements found',
  'E010': 'Missing h1 element',
  'E011': 'Heading level skipped: h{from} to h{to}',
  'E012': 'Duplicate ID: {id}',
  'E013': 'Empty link text',
  'E014': 'Image missing alt attribute',
  'E015': 'Table missing headers',
  'E016': 'Media embed missing transcript/captions metadata',
  'E017': 'Form control missing label',
  'E018': 'Interactive element missing accessible name',
  
  // Style/token rules
  'S001': 'Non-token color value detected: {value}',
  'S002': 'Focus outline removed without replacement',
  'S003': 'Gold/white contrast violation',
  
  // Component rules
  'C001': 'Clickable div detected - use button or link',
  'C002': 'Nested interactive elements',
  'C003': 'Invalid ARIA attribute: {attr}',
  'C004': 'Missing required ARIA attribute: {attr}',
};

// Required footer links
const REQUIRED_FOOTER_LINKS = [
  'uiowa.edu/privacy',
  'opsmanual.uiowa.edu/community-policies/nondiscrimination-statement',
  'accessibility.uiowa.edu'
];

// Valid ARIA roles
const VALID_ROLES = [
  'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
  'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
  'contentinfo', 'definition', 'dialog', 'directory', 'document',
  'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
  'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
  'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
  'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
  'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
  'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider',
  'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel',
  'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
  'treeitem'
];

class LintResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }
  
  addError(file, code, message, line = null) {
    this.errors.push({ file, code, message, line, severity: 'error' });
  }
  
  addWarning(file, code, message, line = null) {
    this.warnings.push({ file, code, message, line, severity: 'warning' });
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
  
  print() {
    const all = [...this.errors, ...this.warnings].sort((a, b) => 
      a.file.localeCompare(b.file)
    );
    
    if (all.length === 0) {
      console.log('✓ All lint checks passed');
      return;
    }
    
    let currentFile = '';
    for (const item of all) {
      if (item.file !== currentFile) {
        currentFile = item.file;
        console.log(`\n${item.file}`);
      }
      
      const icon = item.severity === 'error' ? '✗' : '⚠';
      const line = item.line ? `:${item.line}` : '';
      console.log(`  ${icon} [${item.code}]${line} ${item.message}`);
    }
    
    console.log(`\n${this.errors.length} error(s), ${this.warnings.length} warning(s)`);
  }
}

/**
 * Lint a single HTML file
 */
function lintFile(filePath, result) {
  const html = readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);
  const relPath = path.relative(process.cwd(), filePath);
  
  // === Page-level rules ===
  
  // E001: Missing lang
  const htmlLang = $('html').attr('lang');
  if (!htmlLang) {
    result.addError(relPath, 'E001', ERRORS['E001']);
  }
  
  // E002: Missing skip link
  const skipLink = $('a.skip-link[href="#main-content"], a[href="#main-content"]:contains("Skip")');
  if (skipLink.length === 0) {
    result.addError(relPath, 'E002', ERRORS['E002']);
  }
  
  // E003: Missing skip link target
  const mainContent = $('#main-content');
  if (mainContent.length === 0) {
    result.addError(relPath, 'E003', ERRORS['E003']);
  }
  
  // E004: Missing required landmarks
  const landmarks = {
    'header/banner': $('header, [role="banner"]').length > 0,
    'main': $('main, [role="main"]').length > 0,
    'footer/contentinfo': $('footer, [role="contentinfo"]').length > 0
  };
  
  for (const [landmark, exists] of Object.entries(landmarks)) {
    if (!exists) {
      result.addError(relPath, 'E004', ERRORS['E004'].replace('{landmark}', landmark));
    }
  }
  
  // E005: Missing BrandBar
  const brandBar = $('.brand-bar');
  if (brandBar.length === 0) {
    result.addError(relPath, 'E005', ERRORS['E005']);
  }
  
  // E006: Missing BrandFooter
  const brandFooter = $('.brand-footer');
  if (brandFooter.length === 0) {
    result.addError(relPath, 'E006', ERRORS['E006']);
  }
  
  // E007: Missing required footer links
  const footerLinks = $('footer a, .brand-footer a').map((i, el) => $(el).attr('href')).get();
  for (const requiredLink of REQUIRED_FOOTER_LINKS) {
    const found = footerLinks.some(href => href && href.includes(requiredLink));
    if (!found) {
      result.addError(relPath, 'E007', ERRORS['E007'].replace('{link}', requiredLink));
    }
  }
  
  // E008: Missing accessibility help link
  const a11yHelpLink = $('a[href*="accessibility-help"], a:contains("Report an accessibility issue")');
  if (a11yHelpLink.length === 0) {
    result.addError(relPath, 'E008', ERRORS['E008']);
  }
  
  // E009/E010: H1 validation
  const h1s = $('h1');
  if (h1s.length === 0) {
    result.addError(relPath, 'E010', ERRORS['E010']);
  } else if (h1s.length > 1) {
    result.addError(relPath, 'E009', ERRORS['E009']);
  }
  
  // E011: Heading level skips
  const headings = $('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.each((i, el) => {
    const level = parseInt(el.tagName[1]);
    if (lastLevel > 0 && level > lastLevel + 1) {
      result.addError(relPath, 'E011', 
        ERRORS['E011'].replace('{from}', lastLevel).replace('{to}', level)
      );
    }
    lastLevel = level;
  });
  
  // E012: Duplicate IDs
  const ids = new Set();
  $('[id]').each((i, el) => {
    const id = $(el).attr('id');
    if (ids.has(id)) {
      result.addError(relPath, 'E012', ERRORS['E012'].replace('{id}', id));
    }
    ids.add(id);
  });
  
  // E013: Empty link text
  $('a').each((i, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    const ariaLabel = $el.attr('aria-label');
    const ariaLabelledby = $el.attr('aria-labelledby');
    const hasImage = $el.find('img[alt]').length > 0;
    const hasVisuallyHidden = $el.find('.visually-hidden, .sr-only').length > 0;
    
    if (!text && !ariaLabel && !ariaLabelledby && !hasImage && !hasVisuallyHidden) {
      result.addError(relPath, 'E013', ERRORS['E013']);
    }
  });
  
  // E014: Images missing alt
  $('img').each((i, el) => {
    const $el = $(el);
    const alt = $el.attr('alt');
    const role = $el.attr('role');
    const ariaHidden = $el.attr('aria-hidden');
    
    // Allow role="presentation" or aria-hidden="true" for decorative images
    if (alt === undefined && role !== 'presentation' && ariaHidden !== 'true') {
      result.addError(relPath, 'E014', ERRORS['E014']);
    }
  });
  
  // E015: Tables missing headers
  $('table').each((i, el) => {
    const $table = $(el);
    const hasHeaders = $table.find('th').length > 0;
    
    // Skip if it's explicitly a layout table
    if ($table.attr('role') === 'presentation') return;
    
    if (!hasHeaders) {
      result.addError(relPath, 'E015', ERRORS['E015']);
    }
  });
  
  // E017: Form controls missing labels
  $('input, select, textarea').each((i, el) => {
    const $el = $(el);
    const id = $el.attr('id');
    const type = $el.attr('type');
    
    // Skip hidden inputs and submit buttons
    if (type === 'hidden' || type === 'submit' || type === 'button') return;
    
    const hasLabel = id && $(`label[for="${id}"]`).length > 0;
    const hasAriaLabel = $el.attr('aria-label');
    const hasAriaLabelledby = $el.attr('aria-labelledby');
    const isWrappedInLabel = $el.parents('label').length > 0;
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby && !isWrappedInLabel) {
      result.addError(relPath, 'E017', ERRORS['E017']);
    }
  });
  
  // E018: Interactive elements missing accessible name
  $('button').each((i, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    const ariaLabel = $el.attr('aria-label');
    const ariaLabelledby = $el.attr('aria-labelledby');
    
    if (!text && !ariaLabel && !ariaLabelledby) {
      result.addError(relPath, 'E018', ERRORS['E018']);
    }
  });
  
  // === Component rules ===
  
  // C001: Clickable divs
  $('div[onclick], span[onclick]').each((i, el) => {
    result.addError(relPath, 'C001', ERRORS['C001']);
  });
  
  // C002: Nested interactive elements
  $('a a, a button, button a, button button').each((i, el) => {
    result.addError(relPath, 'C002', ERRORS['C002']);
  });
  
  // C003: Invalid ARIA roles
  $('[role]').each((i, el) => {
    const role = $(el).attr('role');
    if (!VALID_ROLES.includes(role)) {
      result.addError(relPath, 'C003', ERRORS['C003'].replace('{attr}', `role="${role}"`));
    }
  });
  
  // C004: Missing required ARIA for expanded elements
  $('[aria-expanded]').each((i, el) => {
    const $el = $(el);
    const controls = $el.attr('aria-controls');
    if (!controls) {
      result.addWarning(relPath, 'C004', 
        ERRORS['C004'].replace('{attr}', 'aria-controls on element with aria-expanded')
      );
    }
  });
}

/**
 * Main entry point
 */
async function main() {
  console.log('Running SSG Lint Rules...\n');
  
  const result = new LintResult();
  
  // Find all HTML files in the built site
  const files = glob.sync(`${SITE_DIR}/**/*.html`);
  
  if (files.length === 0) {
    console.error(`No HTML files found in ${SITE_DIR}/`);
    console.error('Run "npm run build:eleventy" first.');
    process.exit(1);
  }
  
  console.log(`Checking ${files.length} HTML file(s)...\n`);
  
  for (const file of files) {
    lintFile(file, result);
  }
  
  result.print();
  
  if (result.hasErrors()) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Lint failed:', err);
  process.exit(1);
});
