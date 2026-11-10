// Spec 0002 — design tokens in frontend/css/tokens.css (AC-2, AC-3, AC-4, AC-5).
// Values are read from tokens.css; which text sits on which ground is declared here (R-6).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(fileURLToPath(new URL("../css/tokens.css", import.meta.url)), "utf8");
const props = new Map(
  [...css.matchAll(/^\s*--([A-Za-z0-9_.-]+):\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]),
);

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const colorTokens = [...props].filter(([, value]) => HEX.test(value)).map(([name]) => name);

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
const color = (name) => {
  const value = props.get(name);
  assert.ok(value !== undefined, `--${name} missing from tokens.css`);
  assert.match(value, HEX, `--${name} is not a hex color: ${value}`);
  return value;
};

test("required color tokens are present", () => {
  const required = [
    "bg", "surface", "text", "text-muted", "border", "accent", "on-accent", "focus", "danger",
    ...["pending", "approved", "rejected", "cancelled"].flatMap((s) => [`status-${s}-bg`, `status-${s}-text`]),
  ];
  const missing = required.filter((name) => !colorTokens.includes(name));
  assert.deepEqual(missing, [], `missing color tokens: ${missing.join(", ")}`);
});

test("contrast pairs meet WCAG AA", () => {
  const failures = PAIRS.map(([fg, bg, min]) => [fg, bg, min, contrast(color(fg), color(bg))])
    .filter(([, , min, ratio]) => ratio < min)
    .map(([fg, bg, min, ratio]) => `${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
  assert.deepEqual(failures, [], failures.join("; "));
});

test("every color token is classified", () => {
  const foregrounds = new Set(PAIRS.map(([fg]) => fg));
  const unclassified = colorTokens.filter((name) => !foregrounds.has(name) && !NON_TEXT.has(name));
  assert.deepEqual(
    unclassified,
    [],
    `color tokens with no contrast pair and not marked non-text: ${unclassified.join(", ")}`,
  );
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
