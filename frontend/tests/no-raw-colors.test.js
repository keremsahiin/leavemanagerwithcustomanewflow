// Spec 0002 — R-5 / AC-6: no raw colors in frontend code outside css/tokens.css;
// AC-3: no external font requests (tokens.css included). Scope: *.css, *.js, *.html under
// frontend/, except frontend/tests/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND = fileURLToPath(new URL("..", import.meta.url));
const TOKENS = join(FRONTEND, "css", "tokens.css");
const TESTS = join(FRONTEND, "tests");
const ROOT = join(FRONTEND, "..");

// Our own sources only: tests, dependencies (node_modules) and dot-directories are not scanned.
const SKIP_DIR = (path, name) => path === TESTS || name === "node_modules" || name.startsWith(".");
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return SKIP_DIR(path, entry.name) ? [] : walk(path);
    return /\.(css|js|html)$/i.test(entry.name) ? [path] : [];
  });

// A hex color in a value position — after ":", whitespace, ",", "(", "=" or a quote — but not an
// in-page link (href="#…") or an SVG reference (url(#…), url("#…")). An id selector at the start of
// a line is not a value position; a hex followed by a word character or "-" is a name (#add-form).
const RAW_HEX = /(?<=[:\s,(="'`;])(?<!href=["'])(?<!url\(\s*["']?)#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
// A hex at column 0 is a value only when it ends a declaration (`#333;`) or closes a call (`#333)`).
// At column 0 an id selector may be followed by "{" (`#fade {`), "," (a selector list: `#add,`) or
// nothing (Allman style: `#fade` then `{` on the next line) — none of those are flagged.
const RAW_HEX_LINE_START = /^#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?=\s*[;)])/g;
// CSS color functions; color() only with a color space, so a JS function named color() is not one.
const COLOR_FN =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|\bcolor\(\s*(?:srgb(?:-linear)?|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz(?:-d50|-d65)?)\b/gi;
const RAW_COLOR = [RAW_HEX, RAW_HEX_LINE_START, COLOR_FN];
// External font or stylesheet requests: a remote @import (with or without a space) or url(), a
// <link href> to another origin, Google Fonts anywhere. A local @import ("./tokens.css") is
// same-origin and allowed (CSP 'self').
const EXTERNAL_FONT =
  /@import\s*(?:url\(\s*)?["']?(?:https?:)?\/\/|url\(\s*["']?(?:https?:)?\/\/|fonts\.(?:googleapis|gstatic)\.com/gi;
// A <link> tag may span lines (formatters break long tags), so it is matched on the whole text.
const EXTERNAL_LINK = /<link\b[^>]*?\bhref\s*=\s*["']?(?:https?:)?\/\//gi;

const findings = (text, ...patterns) =>
  text.split(/\r?\n/).flatMap((line, i) =>
    patterns.flatMap((pattern) => [...line.matchAll(pattern)].map((m) => ({ line: i + 1, match: m[0] }))),
  );
const findingsAcrossLines = (text, pattern) =>
  [...text.matchAll(pattern)].map((m) => ({
    line: text.slice(0, m.index).split("\n").length,
    match: m[0].replace(/\s+/g, " "),
  }));
const externalFonts = (text) => [...findings(text, EXTERNAL_FONT), ...findingsAcrossLines(text, EXTERNAL_LINK)];
const report = (path, found) =>
  found.map(({ line, match }) => `${relative(ROOT, path).split("\\").join("/")}:${line}: ${match}`);

test("detector flags raw colors and spares ids and in-page links", () => {
  const fixture = [
    ".a { color: #1d4ed8; }",
    ".b { background: rgb(0 0 0); }",
    'el.style.color = "#fff";',
    "#fade { padding: 0; }",
    '<a href="#add">Ekle</a>',
    ".c { color: var(--text); border-color: transparent; }",
    'form = document.querySelector("#add-form");',
    ".icon { fill: url(#fade); }",
    'const tone = color("text");',
    ".p3 { color: color(display-p3 1 0 0); }",
    "el.style.color = `#fff`;",
    ".d { color:red;#fff }",
    "#333;",
    "#add {",
    ".e { color: #0F172A99; }",
    ".f { color: hsl(220 90% 40%); }",
    ".g { color: oklch(0.5 0.1 250); }",
    "#add,",
    "#fade",
    '.i { fill: url("#fade"); }',
    ".j { fill: url('#add'); }",
  ].join("\n");
  assert.deepEqual(
    findings(fixture, ...RAW_COLOR).map((f) => f.line),
    [1, 2, 3, 10, 11, 12, 13, 15, 16, 17],
  );
});

test("detector flags external font requests", () => {
  const fixture = [
    '@import url("https://fonts.googleapis.com/css2?family=Inter");',
    "@font-face { src: url(//cdn.example.com/f.woff2); }",
    ".ok { font-family: var(--font-sans); }",
    '@import "./tokens.css";',
    '<link rel="stylesheet" href="https://use.typekit.net/abc.css">',
    '<link rel="stylesheet" href="css/tokens.css">',
    "@import 'https://fonts.bunny.net/css?family=x';",
    '@import"https://use.typekit.net/a.css";',
    '<link rel="stylesheet"',
    '  href="https://use.typekit.net/b.css">',
    '@import"./local.css";',
  ].join("\n");
  assert.deepEqual(
    [...new Set(externalFonts(fixture).map((f) => f.line))].sort((a, b) => a - b),
    [1, 2, 5, 7, 8, 9],
  );
});

test("no raw colors outside tokens.css", () => {
  const violations = walk(FRONTEND)
    .filter((path) => path !== TOKENS)
    .flatMap((path) => report(path, findings(readFileSync(path, "utf8"), ...RAW_COLOR)));
  assert.deepEqual(violations, [], `raw colors outside tokens.css:\n${violations.join("\n")}`);
});

test("no external font requests", () => {
  const violations = walk(FRONTEND).flatMap((path) =>
    report(path, externalFonts(readFileSync(path, "utf8"))),
  );
  assert.deepEqual(violations, [], `external font requests:\n${violations.join("\n")}`);
});
