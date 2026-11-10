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

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return path === TESTS ? [] : walk(path);
    return /\.(css|js|html)$/i.test(entry.name) ? [path] : [];
  });

// A hex color in a value position — after ":", whitespace, ",", "(", "=" or a quote — but not an
// in-page link (href="#…") or an SVG reference (url(#…)). An id selector at the start of a line is
// not a value position; a hex followed by a word character or "-" is a name (#add-form), not a color.
const RAW_HEX = /(?<=[:\s,(="'])(?<!href=["'])(?<!url\()#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
// CSS color functions; color() only with a color space, so a JS function named color() is not one.
const COLOR_FN =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|\bcolor\(\s*(?:srgb(?:-linear)?|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz(?:-d50|-d65)?)\b/gi;
const EXTERNAL_FONT = /@import\b|url\(\s*["']?(?:https?:)?\/\/|fonts\.(?:googleapis|gstatic)\.com/gi;

const findings = (text, ...patterns) =>
  text.split(/\r?\n/).flatMap((line, i) =>
    patterns.flatMap((pattern) => [...line.matchAll(pattern)].map((m) => ({ line: i + 1, match: m[0] }))),
  );
const report = (path, found) =>
  found.map(({ line, match }) => `${relative(ROOT, path).split("\\").join("/")}:${line}: ${match}`);

test("detector flags raw colors and spares ids and in-page links", () => {
  const fixture = [
    ".a { color: #1d4ed8; }",
    ".b { background: rgb(0 0 0); }",
    'el.style.color = "#fff";',
    "#main { padding: 0; }",
    '<a href="#add">Ekle</a>',
    ".c { color: var(--text); border-color: transparent; }",
    'form = document.querySelector("#add-form");',
    ".icon { fill: url(#fade); }",
    'const tone = color("text");',
    ".p3 { color: color(display-p3 1 0 0); }",
  ].join("\n");
  assert.deepEqual(
    findings(fixture, RAW_HEX, COLOR_FN).map((f) => f.line),
    [1, 2, 3, 10],
  );
});

test("detector flags external font requests", () => {
  const fixture = [
    '@import url("https://fonts.googleapis.com/css2?family=Inter");',
    "@font-face { src: url(//cdn.example.com/f.woff2); }",
    ".ok { font-family: var(--font-sans); }",
  ].join("\n");
  assert.deepEqual(
    [...new Set(findings(fixture, EXTERNAL_FONT).map((f) => f.line))],
    [1, 2],
  );
});

test("no raw colors outside tokens.css", () => {
  const violations = walk(FRONTEND)
    .filter((path) => path !== TOKENS)
    .flatMap((path) => report(path, findings(readFileSync(path, "utf8"), RAW_HEX, COLOR_FN)));
  assert.deepEqual(violations, [], `raw colors outside tokens.css:\n${violations.join("\n")}`);
});

test("no external font requests", () => {
  const violations = walk(FRONTEND).flatMap((path) =>
    report(path, findings(readFileSync(path, "utf8"), EXTERNAL_FONT)),
  );
  assert.deepEqual(violations, [], `external font requests:\n${violations.join("\n")}`);
});
