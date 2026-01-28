const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.on("beforeBuild", () => {
    const outputPath = path.join(process.cwd(), "_site");
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { recursive: true, force: true });
    }
  });

  eleventyConfig.addShortcode("skipLink", function () {
    return '<a class="skip-link" href="#main-content">Skip to main content</a>';
  });

  eleventyConfig.addShortcode("brandBar", function (unitName) {
    const safeUnitName = unitName || "Unit Name";
    return [
      `<header class="brand-bar">`,
      `  <div class="brand-bar__inner">`,
      `    <a href="https://www.uiowa.edu" class="brand-bar__logo">`,
      `      <svg class="brand-bar__iowa-block" aria-hidden="true" focusable="false" viewBox="0 0 80 40">`,
      `        <rect fill="currentColor" width="80" height="40"/>`,
      `        <text x="40" y="28" text-anchor="middle" fill="#FFCD00" font-family="Antonio, sans-serif" font-size="20" font-weight="700">IOWA</text>`,
      `      </svg>`,
      `      <span class="visually-hidden">University of Iowa homepage</span>`,
      `    </a>`,
      `    <span class="brand-bar__unit-name">${safeUnitName}</span>`,
      `  </div>`,
      `</header>`,
      ``
    ].join("\n");
  });

  eleventyConfig.addShortcode("brandFooter", function (site = {}) {
    const unitName = site.unitName || "Unit Name";
    const addressLines = (site.contact && site.contact.addressLines) || [];
    const city = site.contact && site.contact.city;
    const state = site.contact && site.contact.state;
    const zip = site.contact && site.contact.zip;
    const phone = site.contact && site.contact.phone;
    const email = site.contact && site.contact.email;
    const accessibilityHelpUrl =
      (site.contact && site.contact.accessibilityHelpUrl) || "https://accessibility.uiowa.edu/";
    const year = new Date().getFullYear();
    const addressParts = [
      ...addressLines,
      [city, state, zip].filter(Boolean).join(", ").trim()
    ].filter(Boolean);

    const addressHtml = addressParts.length
      ? addressParts.map((line) => `<span>${line}</span>`).join("")
      : "";

    const phoneHtml = phone
      ? `<a href="tel:${phone.e164 || phone}" class="brand-footer__phone">${phone.display || phone}</a>`
      : "";
    const emailHtml = email
      ? `<a href="mailto:${email}" class="brand-footer__email">${email}</a>`
      : "";

    return [
      `<footer class="brand-footer">`,
      `  <div class="brand-footer__inner">`,
      `    <div class="brand-footer__brand">`,
      `      <a href="https://www.uiowa.edu" class="brand-footer__logo">`,
      `        <svg class="brand-footer__iowa-block" aria-hidden="true" focusable="false" viewBox="0 0 80 40">`,
      `          <rect fill="#FFCD00" width="80" height="40"/>`,
      `          <text x="40" y="28" text-anchor="middle" fill="#000000" font-family="Antonio, sans-serif" font-size="20" font-weight="700">IOWA</text>`,
      `        </svg>`,
      `        <span class="visually-hidden">University of Iowa homepage</span>`,
      `      </a>`,
      `      <div class="brand-footer__unit">`,
      `        <span class="brand-footer__unit-name">${unitName}</span>`,
      `      </div>`,
      `    </div>`,
      ``,
      `    <div class="brand-footer__contact">`,
      `      <address class="brand-footer__address">${addressHtml}</address>`,
      `      ${phoneHtml}`,
      `      ${emailHtml}`,
      `    </div>`,
      ``,
      `    <nav class="brand-footer__links" aria-label="Required links">`,
      `      <ul>`,
      `        <li><a href="https://uiowa.edu/privacy">Privacy Notice</a></li>`,
      `        <li><a href="https://opsmanual.uiowa.edu/community-policies/nondiscrimination-statement">Nondiscrimination Statement</a></li>`,
      `        <li><a href="https://accessibility.uiowa.edu/">Accessibility</a></li>`,
      `        <li><a href="${accessibilityHelpUrl}">Report an accessibility issue</a></li>`,
      `      </ul>`,
      `    </nav>`,
      ``,
      `    <div class="brand-footer__legal">`,
      `      <p>&copy; ${year} The University of Iowa</p>`,
      `    </div>`,
      `  </div>`,
      `</footer>`,
      ``
    ].join("\n");
  });

  eleventyConfig.addShortcode("breadcrumbs", function (items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return "";
    }

    const listItems = items
      .map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.href) {
          return `<li><span aria-current="page">${item.label}</span></li>`;
        }
        return `<li><a href="${item.href}">${item.label}</a></li>`;
      })
      .join("");

    return [
      `<nav class="breadcrumbs" aria-label="Breadcrumb">`,
      `  <ol>`,
      `    ${listItems}`,
      `  </ol>`,
      `</nav>`,
      ``
    ].join("\n");
  });

  eleventyConfig.addShortcode("pageHeader", function (title, intro, meta) {
    const introHtml = intro ? `<p class="page-header__intro">${intro}</p>` : "";
    const metaHtml = meta ? `<div class="page-header__meta">${meta}</div>` : "";
    return [
      `<header class="page-header">`,
      `  <h1>${title}</h1>`,
      `  ${introHtml}`,
      `  ${metaHtml}`,
      `</header>`,
      ``
    ].join("\n");
  });

  eleventyConfig.addShortcode("card", function (title, body, href, meta) {
    const metaHtml = meta ? `<div class="card__meta">${meta}</div>` : "";
    return [
      `<article class="card">`,
      `  <a href="${href}" class="card__link">`,
      `    <h3 class="card__title">${title}</h3>`,
      `    ${metaHtml}`,
      `    <p class="card__body">${body}</p>`,
      `  </a>`,
      `</article>`,
      ``
    ].join("\n");
  });

  eleventyConfig.addPairedShortcode("alert", function (content, variant = "info", title) {
    const isError = variant === "error";
    const role = isError ? "alert" : "status";
    const live = isError ? "assertive" : "polite";
    const titleHtml = title ? `<strong class="alert__title">${title}</strong>` : "";
    return [
      `<div class="alert alert--${variant}" role="${role}" aria-live="${live}">`,
      `  ${titleHtml}`,
      `  <div class="alert__content">${content}</div>`,
      `</div>`,
      ``
    ].join("\n");
  });

  eleventyConfig.addShortcode("dataTable", function (caption, headers = [], rows = [], layout) {
    const tableClass = layout === "fixed" ? "data-table data-table--fixed" : "data-table";
    const headHtml = headers
      .map((header) => `<th scope="col">${header}</th>`)
      .join("");
    const bodyHtml = rows
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("");

    return [
      `<table class="${tableClass}">`,
      `  <caption>${caption}</caption>`,
      `  <thead>`,
      `    <tr>${headHtml}</tr>`,
      `  </thead>`,
      `  <tbody>`,
      `    ${bodyHtml}`,
      `  </tbody>`,
      `</table>`,
      ``
    ].join("\n");
  });

  return {
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    }
  };
};
