const path = require("path");

/**
 * All publishable sites live under src/sites/<slug>/.
 * Output URLs omit the "sites" segment (e.g. sites/law/ → /law/), matching README examples.
 * src/sites/root/ maps to the site root (/).
 */
module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      const inputDir = path.join(process.cwd(), "src");
      let rel = path.relative(inputDir, data.page.inputPath);
      if (!rel.startsWith(`sites${path.sep}`)) {
        return data.permalink;
      }
      rel = rel.split(path.sep).join("/");
      const withoutPrefix = rel.replace(/^sites\//, "");
      if (withoutPrefix.endsWith("/index.md")) {
        const dir = withoutPrefix.slice(0, -"/index.md".length);
        let urlDir = dir;
        if (dir === "root" || dir.startsWith("root/")) {
          urlDir = dir === "root" ? "" : dir.replace(/^root\//, "");
        }
        if (urlDir === "") {
          return "/index.html";
        }
        return `/${urlDir}/index.html`;
      }
      const htmlPath = withoutPrefix.replace(/\.md$/, ".html");
      return `/${htmlPath}`;
    },
  },
};
