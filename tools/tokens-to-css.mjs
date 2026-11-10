// tools/tokens-to-css.mjs — Design System tokens.json → frontend/css/tokens.css
// Spec 0002 (R-4, R-7). Deterministic and dependency-free: the same tokens.json gives the same CSS.
//
// Usage:
//   node tools/tokens-to-css.mjs <tokens.json> <design-system-url> <version-id> --out frontend/css/tokens.css
// The script writes the file itself, UTF-8, and only after the whole conversion succeeded — never
// redirect stdout into the file (docs/conventions.md, Known traps T-6). Without --out it prints.
// The tokens.json is read from the "Leave Manager" Design System (workflows/ui-design.md, Design
// system) into a scratch folder — never into the repo.
//
// Mapping (docs/conventions.md, Naming): every token → `--<token name>`; a type style →
// `--<style>-size`, `--<style>-line`, `--<style>-weight`; a font family → `--font-<family>`.
import { readFileSync, writeFileSync } from "node:fs";

const USAGE = "usage: node tools/tokens-to-css.mjs <tokens.json> <design-system-url> <version-id> [--out <file>]";
const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const out = outAt === -1 ? undefined : args[outAt + 1];
if (outAt !== -1) args.splice(outAt, 2);
const [file, url, version] = args;
if (!file || !url || !version || args.length !== 3 || (outAt !== -1 && !out)) {
  console.error(USAGE);
  process.exit(2);
}

// Fail-closed (spec 0002, review round 1 M-2): whatever this converter does not map — a token
// family, a key, a second theme, a second font family, a font file, a unitless length — stops it
// with a message instead of being dropped silently. Supporting more is a spec change.
const NAME = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/; // no "." — not valid in a CSS custom property name
const LENGTH = /^-?\d+(?:\.\d+)?(?:px|rem|em|%)$/;
const fail = (message) => {
  console.error(`tokens-to-css: ${message}`);
  process.exit(1);
};
const onlyKeys = (object, allowed, where) => {
  if (object === null || typeof object !== "object" || Array.isArray(object)) fail(`${where}: expected an object`);
  const unknown = Object.keys(object).filter((key) => !allowed.includes(key));
  if (unknown.length) fail(`${where}: unsupported key(s) ${unknown.join(", ")} — extend the converter in a spec`);
};
const length = (value, where) => {
  if (typeof value !== "string" || !LENGTH.test(value.trim())) fail(`${where}: "${value}" is not a length with a unit (px, rem, em, %)`);
  return value;
};

let tokens;
try {
  tokens = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  fail(`cannot read ${file}: ${error.message}`);
}
onlyKeys(tokens, ["name", "version", "meta", "color", "type", "spacing", "radius"], "tokens.json");
onlyKeys(tokens.color, ["themes", "tokens"], "color");
if (!Array.isArray(tokens.color.themes) || tokens.color.themes.length !== 1) {
  fail(`color.themes: exactly one theme is supported (spec 0002: light only), found ${tokens.color.themes?.length ?? 0}`);
}
const theme = tokens.color.themes[0]?.id;
if (!theme) fail("color.themes[0].id missing");
onlyKeys(tokens.type, ["fonts", "families", "groups"], "type");
// Empty or absent only — a non-empty array or object (a font file in either shape) is refused.
if (Object.keys(tokens.type.fonts ?? {}).length) fail("type.fonts: font files are not supported — the system font stack only (spec 0002, R-2)");
const array = (value, where) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) fail(`${where}: expected a list`);
  return value;
};
const families = Object.keys(tokens.type.families ?? {});
if (families.length !== 1) fail(`type.families: exactly one family is supported, found ${families.length}`);

const seen = new Set();
const declare = (name, value) => {
  if (!NAME.test(name)) fail(`invalid token name: ${JSON.stringify(name)}`);
  if (seen.has(name)) fail(`duplicate custom property: --${name}`);
  if (value === undefined || value === null || String(value).trim() === "") fail(`empty value: --${name}`);
  seen.add(name);
  return `  --${name}: ${String(value).trim()};`;
};
// An alias "{other}" becomes var(--other); a plain string is the theme's value.
const colorValue = (token) => {
  onlyKeys(token, ["name", "value", "usage"], `color ${token.name}`);
  if (token.value !== null && typeof token.value === "object") onlyKeys(token.value, [theme], `color ${token.name}`);
  const raw = typeof token.value === "string" ? token.value : token.value?.[theme];
  if (typeof raw !== "string") fail(`color ${token.name}: no value for theme "${theme}"`);
  const value = raw.trim();
  if (!/^\{.*\}$/.test(value)) return value;
  const alias = /^\{([A-Za-z0-9][A-Za-z0-9_-]*)\}$/.exec(value);
  if (!alias) fail(`color ${token.name}: invalid alias ${value}`);
  if (!(tokens.color.tokens ?? []).some((other) => other.name === alias[1] && other.name !== token.name)) {
    fail(`color ${token.name}: alias ${value} names no other color token`);
  }
  return `var(--${alias[1]})`;
};
const list = (family) => {
  if (tokens[family] === undefined) return [];
  onlyKeys(tokens[family], family === "color" ? ["themes", "tokens"] : ["tokens"], family);
  return array(tokens[family].tokens, `${family}.tokens`);
};
const lengthToken = (family) => (t) => {
  onlyKeys(t, ["name", "value", "usage"], `${family} ${t.name}`);
  return declare(t.name, length(t.value, `${family} ${t.name}`));
};

const lines = [
  `/* ${tokens.name ?? "Design System"} — tokens, generated by tools/tokens-to-css.mjs. Do not edit by hand:`,
  ` * change the Design System, then regenerate (workflows/ui-design.md, Design system).`,
  ` * Source: ${url}`,
  ` * Version: ${version}`,
  ` * Theme: ${theme}`,
  ` */`,
  `:root {`,
  `  /* color */`,
  ...list("color").map((t) => declare(t.name, colorValue(t))),
  `  /* type */`,
  ...Object.entries(tokens.type?.families ?? {}).map(([family, stack]) => declare(`font-${family}`, stack)),
];
for (const group of array(tokens.type.groups, "type.groups")) {
  onlyKeys(group, ["name", "family", "styles"], `type group ${group.name}`);
  if (group.family !== undefined && group.family !== families[0]) fail(`type group ${group.name}: unknown family "${group.family}"`);
  for (const style of array(group.styles, `type group ${group.name} styles`)) {
    onlyKeys(style, ["name", "fontSize", "lineHeight", "fontWeight"], `type style ${style.name}`);
    const weight = Number(style.fontWeight);
    if (!Number.isInteger(weight) || weight < 100 || weight > 900) fail(`type style ${style.name}: fontWeight "${style.fontWeight}" is not 100–900`);
    lines.push(
      declare(`${style.name}-size`, length(style.fontSize, `type style ${style.name} fontSize`)),
      declare(`${style.name}-line`, length(style.lineHeight, `type style ${style.name} lineHeight`)),
      declare(`${style.name}-weight`, weight),
    );
  }
}
for (const family of ["spacing", "radius"]) {
  lines.push(`  /* ${family} */`, ...list(family).map(lengthToken(family)));
}
lines.push(`}`, ``);
const cssText = lines.join("\n");
if (out) {
  writeFileSync(out, cssText, "utf8");
  console.error(`tokens-to-css: wrote ${out} (${seen.size} custom properties, version ${version})`);
} else {
  process.stdout.write(cssText);
}
