// Spec 0002 — design tokens in frontend/css/tokens.css (AC-2, AC-3, AC-4, AC-5).
// Values are read from tokens.css; which text sits on which ground is declared here (R-6).
// A color token is any property in the converter's `/* color */` block — whatever its value's
// form (review round 1, M-1): aliases `var(--x)` resolve to their target; any other form fails.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(fileURLToPath(new URL("../css/tokens.css", import.meta.url)), "utf8");

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const parseProps = (text) =>
  new Map([...text.matchAll(/^\s*--([A-Za-z0-9_-]+):\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]));
const colorNames = (text) => {
  const block = /\/\* color \*\/([\s\S]*?)(?=\/\* |\n\})/.exec(text);
  return block ? [...block[1].matchAll(/--([A-Za-z0-9_-]+):/g)].map((m) => m[1]) : [];
};
// → { hex } or { error }. Only #rgb / #rrggbb and var(--…) chains are supported color values.
const resolveColor = (props, name, seen = new Set()) => {
  const value = props.get(name);
  if (value === undefined) return { error: `--${name} missing` };
  const alias = /^var\(--([A-Za-z0-9_-]+)\)$/.exec(value);
  if (alias) {
    if (seen.has(name)) return { error: `--${name}: alias cycle` };
    seen.add(name);
    return resolveColor(props, alias[1], seen);
  }
  if (HEX.test(value)) return { hex: value };
  return { error: `--${name}: unsupported color value ${value} (only #rgb, #rrggbb or var(--…))` };
};
const unclassified = (names, pairs, nonText) => {
  const foregrounds = new Set(pairs.map(([fg]) => fg));
  return names.filter((name) => !foregrounds.has(name) && !nonText.has(name));
};

const props = parseProps(css);
const colors = colorNames(css);

// [foreground, background, minimum contrast] — WCAG AA: text 4.5:1; form-control border and
// focus ring 3:1. A color token used as a foreground must appear here.
const PAIRS = [
  ["text", "bg", 4.5],
  ["text", "surface", 4.5],
  ["text-muted", "bg", 4.5],
  ["text-muted", "surface", 4.5],
  ["accent", "bg", 4.5],
  ["accent", "surface", 4.5],
  ["on-accent", "accent", 4.5],
  ["danger", "surface", 4.5],
  ["danger", "danger-bg", 4.5],
  ["status-pending-text", "status-pending-bg", 4.5],
  ["status-approved-text", "status-approved-bg", 4.5],
  ["status-rejected-text", "status-rejected-bg", 4.5],
  ["status-cancelled-text", "status-cancelled-bg", 4.5],
  ["border", "surface", 3],
  ["border", "bg", 3],
  ["focus", "surface", 3],
  ["focus", "bg", 3],
];
// Color tokens that are never a foreground: grounds and decoration.
const NON_TEXT = new Set([
  "bg",
  "surface",
  "divider",
  "danger-bg",
  "status-pending-bg",
  "status-approved-bg",
  "status-rejected-bg",
  "status-cancelled-bg",
]);

const channel = (hex, i) => {
  const full = hex.length === 4 ? hex.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : hex;
  const c = parseInt(full.slice(1 + 2 * i, 3 + 2 * i), 16) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const hexOf = (name) => {
  const resolved = resolveColor(props, name);
  assert.ok(resolved.hex, resolved.error);
  return resolved.hex;
};

test("color analysis handles aliases, alpha and functions", () => {
  const fixture = [
    ":root {",
    "  /* color */",
    "  --bg: #ffffff;",
    "  --text: #000000;",
    "  --link: var(--text);",
    "  --overlay: #0f172a99;",
    "  --tint: rgb(0 0 0);",
    "  /* type */",
    "  --font-sans: system-ui;",
    "}",
  ].join("\n");
  const fixtureProps = parseProps(fixture);
  assert.deepEqual(colorNames(fixture), ["bg", "text", "link", "overlay", "tint"]);
  assert.equal(resolveColor(fixtureProps, "link").hex, "#000000");
  assert.match(resolveColor(fixtureProps, "overlay").error, /unsupported color value #0f172a99/);
  assert.match(resolveColor(fixtureProps, "tint").error, /unsupported color value rgb\(0 0 0\)/);
  assert.deepEqual(unclassified(colorNames(fixture), [["text", "bg", 4.5]], new Set(["bg"])), ["link", "overlay", "tint"]);
});

test("every color value is a supported hex or alias", () => {
  const errors = colors.map((name) => resolveColor(props, name).error).filter(Boolean);
  assert.ok(colors.length > 0, "no /* color */ block in tokens.css");
  assert.deepEqual(errors, [], errors.join("; "));
});

test("required color tokens are present", () => {
  const required = [
    "bg", "surface", "text", "text-muted", "border", "accent", "on-accent", "focus", "danger",
    ...["pending", "approved", "rejected", "cancelled"].flatMap((s) => [`status-${s}-bg`, `status-${s}-text`]),
  ];
  const missing = required.filter((name) => !colors.includes(name));
  assert.deepEqual(missing, [], `missing color tokens: ${missing.join(", ")}`);
});

test("contrast pairs meet WCAG AA", () => {
  const failures = PAIRS.map(([fg, bg, min]) => [fg, bg, min, contrast(hexOf(fg), hexOf(bg))])
    .filter(([, , min, ratio]) => ratio < min)
    .map(([fg, bg, min, ratio]) => `${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
  assert.deepEqual(failures, [], failures.join("; "));
});

test("every color token is classified", () => {
  const missing = unclassified(colors, PAIRS, NON_TEXT);
  assert.deepEqual(missing, [], `color tokens with no contrast pair and not marked non-text: ${missing.join(", ")}`);
});

test("type styles use the system font stack", () => {
  const families = [...props].filter(([name]) => name.startsWith("font-"));
  assert.ok(families.length >= 1, "no --font-* family");
  for (const [name, stack] of families) {
    assert.match(stack, /system-ui/, `--${name} is not a system font stack`);
    assert.doesNotMatch(stack, /url\(/i, `--${name} loads a font file`);
  }
  const styles = [...props.keys()].filter((name) => name.endsWith("-size"));
  assert.ok(styles.length >= 5 && styles.length <= 7, `expected 5–7 type styles, found ${styles.length}`);
  for (const size of styles) {
    const style = size.slice(0, -"-size".length);
    assert.ok(props.has(`${style}-line`) && props.has(`${style}-weight`), `type style ${style} incomplete`);
  }
});

test("header names the design system and version", () => {
  assert.match(css, /^\s*\* Source: https:\/\/claude\.ai\/artifact\/[A-Za-z0-9]+\s*$/m, "Source line missing");
  assert.match(css, /^\s*\* Version: [0-9]+-[0-9a-f]+\s*$/m, "Version line missing");
});
