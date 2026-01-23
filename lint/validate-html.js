/**
 * HTML Validation using html-validate
 * Standards-valid HTML check per §1.1 step 3
 */

const { HtmlValidate } = require('html-validate');
const glob = require('glob');
const { readFileSync } = require('fs');
const path = require('path');

const SITE_DIR = '_site';

// HTML Validate configuration
const htmlvalidate = new HtmlValidate({
  extends: ['html-validate:recommended'],
  rules: {
    // Strict accessibility rules
    'wcag/h30': 'error',
    'wcag/h32': 'error', 
    'wcag/h36': 'error',
    'wcag/h37': 'error',
    'wcag/h67': 'error',
    'wcag/h71': 'error',
    
    // Allow some flexibility
    'no-inline-style': 'warn',
    'no-trailing-whitespace': 'off',
    
    // Require proper structure
    'require-sri': 'off', // We'll handle this separately for external resources
    'element-required-attributes': 'error',
    'no-dup-id': 'error',
    'no-dup-attr': 'error',
  }
});

class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }
  
  addError(file, message, line, column) {
    this.errors.push({ file, message, line, column, severity: 'error' });
  }
  
  addWarning(file, message, line, column) {
    this.warnings.push({ file, message, line, column, severity: 'warning' });
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
  
  print() {
    const all = [...this.errors, ...this.warnings];
    
    if (all.length === 0) {
      console.log('✓ All HTML validation checks passed');
      return;
    }
    
    let currentFile = '';
    for (const item of all) {
      if (item.file !== currentFile) {
        currentFile = item.file;
        console.log(`\n${item.file}`);
      }
      
      const icon = item.severity === 'error' ? '✗' : '⚠';
      const location = item.line ? `:${item.line}:${item.column}` : '';
      console.log(`  ${icon}${location} ${item.message}`);
    }
    
    console.log(`\n${this.errors.length} error(s), ${this.warnings.length} warning(s)`);
  }
}

async function validateFile(filePath, result) {
  const relPath = path.relative(process.cwd(), filePath);
  const html = readFileSync(filePath, 'utf-8');
  
  try {
    const report = await htmlvalidate.validateString(html, filePath);
    
    for (const msg of report.results[0]?.messages || []) {
      if (msg.severity === 2) { // Error
        result.addError(relPath, msg.message, msg.line, msg.column);
      } else if (msg.severity === 1) { // Warning
        result.addWarning(relPath, msg.message, msg.line, msg.column);
      }
    }
  } catch (err) {
    result.addError(relPath, `Validation failed: ${err.message}`);
  }
}

async function main() {
  console.log('Running HTML Validation...\n');
  
  const result = new ValidationResult();
  
  const files = glob.sync(`${SITE_DIR}/**/*.html`);
  
  if (files.length === 0) {
    console.error(`No HTML files found in ${SITE_DIR}/`);
    console.error('Run "npm run build:eleventy" first.');
    process.exit(1);
  }
  
  console.log(`Validating ${files.length} HTML file(s)...\n`);
  
  for (const file of files) {
    await validateFile(file, result);
  }
  
  result.print();
  
  if (result.hasErrors()) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
