/**
 * MoteMancer wiki scraper - builds FactorioLab game data from the community wiki
 *
 * Usage: bun scripts/motemancer-build.ts [--refresh]
 *
 * Fetches data from https://motemancer.miraheze.org/ via the MediaWiki API,
 * parses {{StructureInfo}} and {{ItemInfo}} templates, downloads icons,
 * and outputs data.json, defaults.json, and icons.webp to public/data/mtm/.
 *
 * Raw wiki responses are cached under scripts/cache/motemancer/ (gitignored)
 * so re-runs don't hit the wiki. Pass --refresh to re-fetch everything.
 *
 * For icon overrides ctrl+f ICON_OVERRIDES
 */

import fs from 'fs';
import path from 'path';

import { getAverageColor } from 'fast-average-color-node';
import prettier from 'prettier';
import sharp from 'sharp';
import spritesmith from 'spritesmith';

import { CategoryJson } from '~/data/schema/category';
import { DefaultsJson } from '~/data/schema/defaults';
import { IconJson } from '~/data/schema/icon-data';
import { ItemJson } from '~/data/schema/item';
import { MachineJson } from '~/data/schema/machine';
import { ModData } from '~/data/schema/mod-data';
import { RecipeJson } from '~/data/schema/recipe';
import { EnergyType } from '~/data/schema/energy-type';

// #region Config

const WIKI_API = 'https://motemancer.miraheze.org/w/api.php';
const WIKI_URL = 'https://motemancer.miraheze.org/wiki/';
const OUTPUT_DIR = './public/data/mtm';
const CACHE_DIR = './scripts/cache/motemancer';
const REPORT_PATH = './scripts/temp/motemancer-research-report.md';
const ICON_SIZE = 64;
const ICON_PADDING = 2;

// Belt speeds (items/sec) - currently needs to be hardcoded
const BELT_SPEEDS: Record<string, number> = {
  saltway: 4,
  'underground-saltway': 4,
  streamway: 16,
  'verdant-stream': 16,
  'underground-stream': 16,
  'streamway-delta': 16,
  'verdant-delta': 16,
  'enchanted-delta': 16,
  'torrential-streamway': 24,
  'ichor-slick': 1000, // effectively instantaneous - no actual infinity option
};

// Mote harvesting rates - the wiki only describes these in prose ("base rate of
// 2 Motes per 4 seconds"), so like belt speeds they need to be hardcoded.
// A collector's motes per cycle becomes its machine speed, and the harvest
// recipe for an element takes one cycle of its collectors.
interface CollectorRate {
  /** Mote elements this collector can harvest */
  elements: string[];
  /** Motes produced per cycle */
  motes: number;
  /** Seconds per cycle */
  seconds: number;
}

const MOTE_ELEMENTS = ['water', 'life', 'earth', 'fire', 'shadow', 'air'];

const COLLECTORS: Record<string, CollectorRate> = {
  'simple-collector': { elements: MOTE_ELEMENTS, motes: 1, seconds: 4 },
  'tidal-collector': { elements: ['water'], motes: 2, seconds: 4 },
  'verdant-collector': { elements: ['life'], motes: 2, seconds: 4 },
  'quarry-collector': { elements: ['earth'], motes: 2, seconds: 4 },
  'ember-collector': { elements: ['fire'], motes: 2, seconds: 4 },
  'shade-collector': { elements: ['shadow'], motes: 2, seconds: 4 },
  'tempest-collector': { elements: ['air'], motes: 2, seconds: 4 },
  // Entropic shards can only be drawn from entropy by the alembic
  'entropic-alembic': { elements: ['entropy'], motes: 1, seconds: 3 },
};

// Research pages to parse
const RESEARCH_PAGES = [
  'Salt_Research',
  'Water_Research',
  'Life_Research',
  'Earth_Research',
  'Fire_Research',
  'Shadow_Research',
  'Air_Research',
  'Entropic_Research',
];

// Belt range for the presets - Saltway is the first belt, Torrential Streamway
// the fastest
const MIN_BELT = 'saltway';
const MAX_BELT = 'torrential-streamway';

// #endregion

// #region Cache

/**
 * Local cache of raw wiki responses, so iterating on the wiki -> FactorioLab
 * transformation doesn't require a full re-scrape. Layout under CACHE_DIR:
 *
 *   titles.json             all page titles
 *   pages/<Title>.wikitext  raw wikitext per page
 *   image-urls.json         File: name -> image URL (null if the file doesn't exist)
 *   images/<Filename>       original image bytes (pre-resize)
 *
 * Entries are only written on fetch; --refresh bypasses reads so everything
 * is re-fetched and overwritten entry by entry.
 */

type ImageUrlMap = Record<string, string | null>;

const REFRESH = process.argv.includes('--refresh');
const IMAGE_URLS_FILE = 'image-urls.json';
const cacheStats = { hits: 0, fetches: 0 };

/** Convert a wiki title or filename into a filesystem-safe cache name */
function cacheKey(name: string): string {
  return encodeURIComponent(name.replace(/ /g, '_')).replace(/\*/g, '%2A');
}

function cachePath(file: string): string {
  return path.join(CACHE_DIR, file);
}

/** Read a cache entry, or null if missing (or if --refresh was passed) */
function readCache(file: string): Buffer | null {
  if (REFRESH) return null;
  const p = cachePath(file);
  if (!fs.existsSync(p)) return null;
  cacheStats.hits++;
  return fs.readFileSync(p);
}

function writeCache(file: string, data: string | Buffer): void {
  const p = cachePath(file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data);
  cacheStats.fetches++;
}

let imageUrlCache: ImageUrlMap | null = null;

/** Lazily load the image URL map (even under --refresh, so untouched entries survive) */
function loadImageUrlCache(): ImageUrlMap {
  if (imageUrlCache) return imageUrlCache;
  const p = cachePath(IMAGE_URLS_FILE);
  imageUrlCache = fs.existsSync(p)
    ? (JSON.parse(fs.readFileSync(p).toString()) as ImageUrlMap)
    : {};
  return imageUrlCache;
}

// #endregion

// #region API

interface AllPagesResponse {
  query?: { allpages?: { title: string }[] };
  continue?: { apcontinue?: string };
}

interface ParseResponse {
  parse?: { wikitext?: string };
}

interface ImageInfoResponse {
  query?: { pages?: Record<string, { imageinfo?: { url?: string }[] }> };
}

async function fetchJson<T>(url: string, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as T;
    if (attempt < retries && res.status >= 500) {
      console.warn(`  Retry ${attempt}/${retries} for ${res.status}: ${url}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${url}`);
  }
  throw new Error(`Failed after ${retries} attempts: ${url}`);
}

async function getAllPageTitles(): Promise<string[]> {
  const cacheFile = 'titles.json';
  const hit = readCache(cacheFile);
  if (hit !== null) return JSON.parse(hit.toString()) as string[];

  const titles: string[] = [];
  let continueToken: string | undefined;

  do {
    const params = new URLSearchParams({
      action: 'query',
      list: 'allpages',
      aplimit: '500',
      format: 'json',
    });
    if (continueToken) params.set('apcontinue', continueToken);

    const data = await fetchJson<AllPagesResponse>(`${WIKI_API}?${params}`);
    const pages = data.query?.allpages ?? [];
    for (const p of pages) {
      titles.push(p.title);
    }
    continueToken = data.continue?.apcontinue;
  } while (continueToken);

  writeCache(cacheFile, JSON.stringify(titles, null, 2));
  return titles;
}

async function getPageWikitext(title: string): Promise<string> {
  const cacheFile = `pages/${cacheKey(title)}.wikitext`;
  const hit = readCache(cacheFile);
  if (hit !== null) return hit.toString();

  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    formatversion: '2',
    format: 'json',
  });
  const data = await fetchJson<ParseResponse>(`${WIKI_API}?${params}`);
  const wikitext = data.parse?.wikitext ?? '';
  writeCache(cacheFile, wikitext);
  return wikitext;
}

async function getLatestVersion(): Promise<string> {
  const wikitext = await getPageWikitext('Template:Changelog');
  const match = wikitext.match(/v?\.?(\d+\.\d+\.\d+)/);
  if (match) return match[1];
  console.warn('Warning: Could not find version in changelog, using 0.0.0');
  return '0.0.0';
}

async function getImageUrl(filename: string): Promise<string | null> {
  // Misses are cached too, since most icon filename guesses don't exist
  const urls = loadImageUrlCache();
  if (!REFRESH && filename in urls) {
    cacheStats.hits++;
    return urls[filename];
  }

  const params = new URLSearchParams({
    action: 'query',
    titles: `File:${filename}`,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
  });
  const data = await fetchJson<ImageInfoResponse>(`${WIKI_API}?${params}`);
  const pages = data.query?.pages ?? {};
  let url: string | null = null;
  for (const page of Object.values(pages)) {
    const pageUrl = page.imageinfo?.[0]?.url;
    if (pageUrl) {
      url = pageUrl;
      break;
    }
  }

  urls[filename] = url;
  writeCache(IMAGE_URLS_FILE, JSON.stringify(urls, null, 2));
  return url;
}

async function downloadImage(filename: string, url: string): Promise<Buffer> {
  const cacheFile = `images/${cacheKey(filename)}`;
  const hit = readCache(cacheFile);
  if (hit !== null) return hit;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeCache(cacheFile, buf);
  return buf;
}

// #endregion

// #region Template

interface TemplateFields {
  templateName: string;
  [key: string]: string;
}

/**
 * Find every occurrence of {{templateName ...}} and return the raw body of
 * each (the text between the template name and its closing braces). Nested
 * {{ }} are matched by depth, so bodies containing other templates (e.g.
 * Ingredient1 = 3x {{Salt Prism}}) are captured in full.
 */
function findTemplateBodies(wikitext: string, templateName: string): string[] {
  const bodies: string[] = [];
  const startPattern = `{{${templateName}`;
  let searchFrom = 0;

  for (;;) {
    const startIdx = wikitext.indexOf(startPattern, searchFrom);
    if (startIdx === -1) break;
    const bodyStart = startIdx + startPattern.length;
    searchFrom = bodyStart;

    // Require a boundary so that {{Foo}} doesn't match {{FooBar}}
    const next = wikitext[bodyStart];
    if (next !== undefined && !/[\s|}]/.test(next)) continue;

    // Walk forward matching nested {{ }} to find the correct closing }}
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx; i < wikitext.length - 1; i++) {
      if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
        depth++;
        i++; // skip next char
      } else if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
        i++; // skip next char
      }
    }
    if (endIdx === -1) break;

    bodies.push(wikitext.substring(bodyStart, endIdx));
    searchFrom = endIdx + 2;
  }

  return bodies;
}

/** Parse the | key = value fields of a template body */
function parseTemplateFields(
  body: string,
  templateName: string,
): TemplateFields {
  const fields: TemplateFields = { templateName };
  for (const param of splitTopLevel(body, '|')) {
    const eqIdx = param.indexOf('=');
    if (eqIdx === -1) continue;
    const key = param.substring(0, eqIdx).trim();
    const value = param.substring(eqIdx + 1).trim();
    if (key && value) fields[key] = value;
  }
  return fields;
}

/** Parse every occurrence of a template in the wikitext */
function parseTemplates(
  wikitext: string,
  templateName: string,
): TemplateFields[] {
  return findTemplateBodies(wikitext, templateName).map((body) =>
    parseTemplateFields(body, templateName),
  );
}

/** Parse the first occurrence of a template, or null if it isn't present */
function parseTemplate(
  wikitext: string,
  templateName: string,
): TemplateFields | null {
  return parseTemplates(wikitext, templateName)[0] ?? null;
}

/**
 * Split a string by a delimiter, but only at the top level (not inside
 * {{ }} templates or [[ ]] links)
 */
function splitTopLevel(s: string, delimiter: string): string[] {
  const parts: string[] = [];
  let templateDepth = 0;
  let linkDepth = 0;
  let current = '';

  for (let i = 0; i < s.length; i++) {
    const pair = s.substring(i, i + 2);
    if (pair === '{{' || pair === '}}' || pair === '[[' || pair === ']]') {
      if (pair === '{{') templateDepth++;
      else if (pair === '}}') templateDepth = Math.max(0, templateDepth - 1);
      else if (pair === '[[') linkDepth++;
      else linkDepth = Math.max(0, linkDepth - 1);
      current += pair;
      i++;
    } else if (s[i] === delimiter && templateDepth === 0 && linkDepth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += s[i];
    }
  }
  if (current) parts.push(current);

  return parts;
}

interface MachineRecipe {
  name: string;
  ingredients: Record<string, number>;
  craftTime: number;
  produced: number;
}

/**
 * Parse the recipes a machine can produce from its page's RecipeTableItem
 * entries. AltRecipeTableItem is deliberately excluded: the wiki uses it for
 * "Used in Recipes" tables, which list recipes that consume the item.
 */
function parseRecipeTableItems(wikitext: string): MachineRecipe[] {
  const results: MachineRecipe[] = [];

  for (const fields of parseTemplates(wikitext, 'RecipeTableItem')) {
    const name = extractLinkText(fields['Name'] ?? '');
    if (!name) continue;

    const craftTime = parseFloat(fields['CraftTime'] ?? '1') || 1;
    const produced = parseFloat(fields['Produced'] ?? '1') || 1;

    // Each "or" alternative is its own recipe
    const { ingredients, alternatives } = parseIngredientFields(fields);
    for (const alt of [ingredients, ...alternatives]) {
      results.push({ name, ingredients: alt, craftTime, produced });
    }
  }

  return results;
}

/** Strip {{ }} and [[ ]] markup from a field value for display */
function stripWikiMarkup(s: string): string {
  return s.replace(/\{\{|\}\}|\[\[|\]\]/g, '').trim();
}

/** Collect the values of numbered fields (e.g. Before1..Before4) in order */
function numberedFields(
  fields: TemplateFields,
  prefix: string,
  max: number,
): string[] {
  const values: string[] = [];
  for (let i = 1; i <= max; i++) {
    const value = fields[`${prefix}${i}`];
    if (value) values.push(value);
  }
  return values;
}

/**
 * Parse a research from either an ElementalResearchTableItem (a row of a
 * research table) or an ElementResearchInfo (the research's own page); both
 * templates use the same field names.
 */
function parseResearchFields(fields: TemplateFields): ResearchEntry | null {
  const name = extractLinkText(fields['Name'] ?? '');
  if (!name) return null;

  const { ingredients } = parseIngredientFields(fields);

  const before = numberedFields(fields, 'Before', 4);
  const prerequisites: string[] = [];
  for (const value of before) {
    const t = extractTemplateRef(value);
    if (t) prerequisites.push(toId(t));
  }

  const unlockValues = numberedFields(fields, 'Unlock', 6);
  const unlocks: string[] = [];
  for (const value of unlockValues) {
    const t = extractTemplateRef(value);
    if (t) unlocks.push(toId(t));
  }

  // Repeatable researches list their cycles as "500+" or "Varies"
  const cyclesRaw = fields['Cycles'] ?? '';
  const infinite = /\+\s*$/.test(cyclesRaw) || /varies/i.test(cyclesRaw);

  return {
    name,
    id: toId(name),
    cycles: parseInt(cyclesRaw, 10) || 1,
    infinite,
    ingredients,
    prerequisites,
    unlocks,
    imageFilename: fields['Img'] ? extractImageFilename(fields['Img']) : null,
    element: extractTemplateRef(fields['Element'] ?? '') ?? '',
    raw: {
      cycles: cyclesRaw,
      ingredients: numberedFields(fields, 'Ingredient', 6).map(stripWikiMarkup),
      before: before.map(stripWikiMarkup),
      unlocks: unlockValues.map(stripWikiMarkup),
    },
  };
}

/** Parse every research table row on a research page */
function parseResearchEntries(wikitext: string): ResearchEntry[] {
  return parseTemplates(wikitext, 'ElementalResearchTableItem')
    .map(parseResearchFields)
    .filter((entry): entry is ResearchEntry => entry !== null);
}

/** Parse the ElementResearchInfo on a research's own page, if it has one */
function parseResearchPage(wikitext: string): ResearchEntry | null {
  const fields = parseTemplate(wikitext, 'ElementResearchInfo');
  return fields ? parseResearchFields(fields) : null;
}

// #endregion

// #region Text Parsing

/** Extract plain name from [[Link Text]] or {{Template Name}} */
function extractLinkText(s: string): string {
  // [[Link|Display]] -> Display, [[Link]] -> Link
  const linkMatch = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(s);
  if (linkMatch) return linkMatch[2] ?? linkMatch[1];
  // {{Template Name}} -> Template Name
  const tmplMatch = /\{\{([^}|]+)\}\}/.exec(s);
  if (tmplMatch) return tmplMatch[1].trim();
  return s.replace(/\[|\]/g, '').trim();
}

/** Extract template reference name from {{Name}} */
function extractTemplateRef(s: string): string | null {
  const m = /\{\{([^}|]+)\}\}/.exec(s);
  if (m) return m[1].trim();
  // Also try [[Link]]
  const linkMatch = /\[\[([^\]|]+)\]\]/.exec(s);
  if (linkMatch) return linkMatch[1].trim();
  return null;
}

/**
 * Parse an ingredient string like "3x {{Salt Prism}}" or "or 1x {{Mote of Water}}"
 * Returns array of [itemId, quantity] pairs (multiple for "or" ingredients)
 */
function parseIngredient(s: string): Array<[string, number]> | null {
  const results: Array<[string, number]> = [];

  // Split by "or" to handle alternate ingredients
  // But only if they're separate ingredients, not part of a name
  const parts = s.split(/\bor\b/i);

  for (const part of parts) {
    const qtyMatch = /(\d+)x?\s*\{\{([^}]+)\}\}/.exec(part.trim());
    if (qtyMatch) {
      const qty = parseInt(qtyMatch[1], 10);
      const name = qtyMatch[2].trim();
      results.push([toId(name), qty]);
    } else {
      // Try without quantity (default 1)
      const nameMatch = /\{\{([^}]+)\}\}/.exec(part.trim());
      if (nameMatch) {
        results.push([toId(nameMatch[1].trim()), 1]);
      }
    }
  }

  return results.length > 0 ? results : null;
}

/**
 * Parse the Ingredient1..6 fields of a template. A field starting with "or"
 * is an alternative to the previous ingredient, and yields a separate
 * alternative ingredient set.
 */
function parseIngredientFields(fields: TemplateFields): {
  ingredients: Record<string, number>;
  alternatives: Record<string, number>[];
} {
  const ingredients: Record<string, number> = {};
  const alternatives: Record<string, number>[] = [];
  let lastIngredientId: string | null = null;

  for (let i = 1; i <= 6; i++) {
    const ing = fields[`Ingredient${i}`];
    if (!ing) continue;

    const trimmed = ing.trim();
    if (trimmed.toLowerCase().startsWith('or ')) {
      const parsed = parseIngredient(trimmed.replace(/^or\s+/i, ''));
      if (parsed) {
        for (const [itemId, qty] of parsed) {
          const alt = { ...ingredients };
          // Replace the previous ingredient with this alternative
          if (lastIngredientId) delete alt[lastIngredientId];
          alt[itemId] = qty;
          alternatives.push(alt);
        }
      }
    } else {
      const parsed = parseIngredient(trimmed);
      if (parsed) {
        for (const [itemId, qty] of parsed) {
          ingredients[itemId] = qty;
          lastIngredientId = itemId;
        }
      }
    }
  }

  return { ingredients, alternatives };
}

/** Normalize a wiki title for lookup: underscores to spaces, capitalized */
function normalizeTitle(title: string): string {
  const t = title.replace(/_/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Redirect page title -> target title, for pages renamed on the wiki */
const redirects = new Map<string, string>();

function collectRedirects(pageWikitext: Record<string, string>): void {
  for (const [title, text] of Object.entries(pageWikitext)) {
    const m = /^#REDIRECT\s*\[\[([^\]|]+)/i.exec(text);
    if (m) redirects.set(normalizeTitle(title), normalizeTitle(m[1]));
  }
}

/** Follow wiki redirects to the canonical page title */
function resolveTitle(title: string): string {
  let current = normalizeTitle(title);
  for (let hops = 0; hops < 5; hops++) {
    const next = redirects.get(current);
    if (next === undefined || next === current) break;
    current = next;
  }
  return current;
}

/**
 * Convert a wiki name to a kebab-case ID. Follows page redirects, so
 * references to a renamed page (e.g. {{Shifting Slab}} -> Saltway) resolve to
 * the current item's id.
 */
function toId(name: string): string {
  return resolveTitle(name)
    .toLowerCase()
    .replace(/['':/()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Extract image filename from [[File:Foo.png|...]] */
function extractImageFilename(imgField: string): string | null {
  const m = /\[\[File:([^|[\]]+)/.exec(imgField);
  return m ? m[1].trim() : null;
}

/** Check whether an existing recipe matches a machine recipe's details */
function recipesMatch(
  existing: RecipeJson,
  ingredients: Record<string, number>,
  craftTime: number,
  produced: number,
  outputId: string,
): boolean {
  if (existing.time !== craftTime) return false;
  if (existing.out[outputId] !== produced) return false;
  const existingInKeys = Object.keys(existing.in);
  const newInKeys = Object.keys(ingredients);
  if (existingInKeys.length !== newInKeys.length) return false;
  for (const key of newInKeys) {
    if (existing.in[key] !== ingredients[key]) return false;
  }
  return true;
}

/** Add a machine to a recipe's producers if it isn't already listed */
function addProducer(recipe: RecipeJson, producerId: string): void {
  recipe.producers ??= [];
  if (!recipe.producers.includes(producerId)) {
    recipe.producers.push(producerId);
  }
}

/** Fallback display name for an id with no item: "mote-of-fire" -> "Mote Of Fire" */
function idToName(id: string): string {
  return id
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Name variant recipes by how they differ from their siblings. Recipes that
 * produce the same item are grouped by producer; within a group each recipe
 * is qualified by the inputs its siblings don't all share, and a group with
 * different producers than the base recipe is qualified by the machine too:
 *
 *   Aether (Mote of Life)              the base recipe, when it has "or"
 *   Aether (Mote of Fire)              alternatives on the same machine
 *   Elemental Water (Foundry)          a machine's own recipe
 *   Aether (Pyrolyzer, Mote of Fire)   one of several on that machine
 *
 * A base recipe (craft-<item>) that is alone on its machine keeps its name.
 */
function nameVariantRecipes(
  recipes: RecipeJson[],
  itemName: (id: string) => string,
): void {
  const byOutput = new Map<string, RecipeJson[]>();
  for (const recipe of recipes) {
    if (!recipe.id.startsWith('craft-')) continue;
    const outputs = Object.keys(recipe.out);
    if (outputs.length !== 1) continue;
    byOutput.set(outputs[0], [...(byOutput.get(outputs[0]) ?? []), recipe]);
  }

  const producersKey = (recipe: RecipeJson): string =>
    [...(recipe.producers ?? [])].sort().join(',');

  for (const [outputId, group] of byOutput) {
    if (group.length < 2) continue;
    const base = group.find((r) => r.id === `craft-${outputId}`);
    const baseKey = base ? producersKey(base) : undefined;

    const byProducers = new Map<string, RecipeJson[]>();
    for (const recipe of group) {
      const key = producersKey(recipe);
      byProducers.set(key, [...(byProducers.get(key) ?? []), recipe]);
    }

    for (const [key, siblings] of byProducers) {
      // Inputs every sibling shares don't distinguish anything
      const common = new Set(Object.keys(siblings[0].in));
      for (const sibling of siblings.slice(1)) {
        for (const id of common) if (!(id in sibling.in)) common.delete(id);
      }

      const machine =
        key !== baseKey
          ? (siblings[0].producers ?? []).map(itemName).join(' / ')
          : '';
      const qualify = (recipe: RecipeJson, withQuantities: boolean): string => {
        const inputs = Object.entries(recipe.in)
          .filter(([id]) => withQuantities || !common.has(id))
          .map(([id, qty]) =>
            withQuantities ? `${qty}x ${itemName(id)}` : itemName(id),
          );
        const parts = [machine, inputs.join(' + ')].filter((p) => p);
        return parts.length > 0
          ? `${itemName(outputId)} (${parts.join(', ')})`
          : recipe.name;
      };

      const names = siblings.map((r) => qualify(r, false));
      for (const [i, recipe] of siblings.entries()) {
        // Siblings that differ only in quantities need them spelled out
        const collides = names.some((n, j) => j !== i && n === names[i]);
        recipe.name = qualify(recipe, collides);
      }
    }
  }
}

// #endregion

// #region Research Report

interface ResearchSource {
  entry: ResearchEntry;
  /** Title of the wiki page the entry was read from */
  page: string;
}

interface ResearchDiff {
  field: string;
  table: string;
  page: string;
}

function wikiLink(title: string): string {
  return `[${title}](${WIKI_URL}${encodeURI(title.replace(/ /g, '_'))})`;
}

function sameRecord(
  a: Record<string, number>,
  b: Record<string, number>,
): boolean {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k])
  );
}

function sameList(a: string[], b: string[]): boolean {
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : '(none)';
}

function byName(a: ResearchSource, b: ResearchSource): number {
  return a.entry.name.localeCompare(b.entry.name);
}

/**
 * Compare each research's table row against its own page, and write a
 * markdown report of the disagreements and of researches missing from the
 * tables, grouped by the research table page to edit. Returns the counts
 * for the console summary.
 */
function writeResearchReport(
  tableResearch: Map<string, ResearchSource>,
  pageResearch: Map<string, ResearchSource>,
  version: string,
): { disagreements: number; missing: number } {
  const disagreements = new Map<
    string,
    { source: ResearchSource; diffs: ResearchDiff[] }[]
  >();
  const missing = new Map<string, ResearchSource[]>();
  let skipped = 0;

  for (const [id, source] of pageResearch) {
    const page = source.entry;
    const table = tableResearch.get(id);
    if (!table) {
      const key = page.element || 'Unknown';
      missing.set(key, [...(missing.get(key) ?? []), source]);
      continue;
    }

    // Per-element researches list "Varies" on their page; nothing to reconcile
    if (/varies/i.test(page.raw.cycles)) {
      skipped++;
      continue;
    }

    const row = table.entry;
    const diffs: ResearchDiff[] = [];
    if (row.cycles !== page.cycles || row.infinite !== page.infinite) {
      diffs.push({
        field: 'Cycles',
        table: row.raw.cycles,
        page: page.raw.cycles,
      });
    }
    if (!sameRecord(row.ingredients, page.ingredients)) {
      diffs.push({
        field: 'Ingredients',
        table: formatList(row.raw.ingredients),
        page: formatList(page.raw.ingredients),
      });
    }
    if (!sameList(row.prerequisites, page.prerequisites)) {
      diffs.push({
        field: 'Before',
        table: formatList(row.raw.before),
        page: formatList(page.raw.before),
      });
    }
    if (!sameList(row.unlocks, page.unlocks)) {
      diffs.push({
        field: 'Unlock',
        table: formatList(row.raw.unlocks),
        page: formatList(page.raw.unlocks),
      });
    }
    if (diffs.length > 0) {
      disagreements.set(table.page, [
        ...(disagreements.get(table.page) ?? []),
        { source, diffs },
      ]);
    }
  }

  const count = (groups: Map<string, unknown[]>): number =>
    [...groups.values()].reduce((n, list) => n + list.length, 0);
  const totals = {
    disagreements: count(disagreements),
    missing: count(missing),
  };

  const lines = [
    '# MoteMancer research wiki report',
    '',
    `Generated by motemancer-build from the wiki cache (MoteMancer ${version}). ` +
      `${totals.disagreements} researches disagree between their research-table row and their own page; ` +
      `${totals.missing} researches have a page but no table row. ` +
      `Skipped ${skipped} per-element researches whose page lists cycles as "Varies".`,
    '',
  ];

  const tables = [...new Set([...disagreements.keys(), ...missing.keys()])];
  for (const table of tables.sort()) {
    lines.push(`## ${wikiLink(table)}`, '');

    const missingRows = (missing.get(table) ?? []).sort(byName);
    if (missingRows.length > 0) {
      lines.push(
        `**Missing rows** (${missingRows.length}) - values from each research's own page:`,
        '',
      );
      for (const { entry, page } of missingRows) {
        const unlocks =
          entry.raw.unlocks.length > 0
            ? `; Unlocks: ${formatList(entry.raw.unlocks)}`
            : '';
        lines.push(
          `- ${wikiLink(page)} - Cycles ${entry.raw.cycles || '?'}; ${formatList(entry.raw.ingredients)}; Before: ${formatList(entry.raw.before)}${unlocks}`,
        );
      }
      lines.push('');
    }

    const rows = (disagreements.get(table) ?? []).sort((a, b) =>
      byName(a.source, b.source),
    );
    if (rows.length > 0) {
      lines.push(
        `**Disagreements** (${rows.length}) - table row vs the research's own page:`,
        '',
      );
      for (const { source, diffs } of rows) {
        lines.push(`- ${wikiLink(source.page)}`);
        for (const diff of diffs) {
          lines.push(
            `  - ${diff.field}: table \`${diff.table}\` · page \`${diff.page}\``,
          );
        }
      }
      lines.push('');
    }
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, lines.join('\n'));
  return totals;
}

// #endregion

// #region Main

interface WikiItem {
  name: string;
  id: string;
  element: string;
  type: string; // Production, Logistics, Reagents, Artifice, Research, etc.
  unlockedBy: string;
  craftedIn: string;
  ingredients: Record<string, number>;
  altIngredients?: Record<string, number>[]; // for "or" ingredients
  craftTime: number;
  produced: number;
  power: number;
  stack: number;
  imageFilename: string | null;
  // Recipes this machine can produce (only for Production/machines)
  machineRecipes: MachineRecipe[];
}

interface ResearchEntry {
  name: string;
  id: string;
  cycles: number;
  /** Repeatable research (the wiki lists cycles as "500+" or "Varies") */
  infinite: boolean;
  ingredients: Record<string, number>;
  prerequisites: string[];
  unlocks: string[];
  imageFilename: string | null;
  /** Research table this belongs to, e.g. "Fire Research" */
  element: string;
  /** Field values as written on the wiki, for the research report */
  raw: {
    cycles: string;
    ingredients: string[];
    before: string[];
    unlocks: string[];
  };
}

async function main(): Promise<void> {
  console.log(
    REFRESH
      ? `Refreshing wiki cache at ${CACHE_DIR}`
      : `Using wiki cache at ${CACHE_DIR} (pass --refresh to re-fetch)`,
  );
  console.log('Fetching all page titles and version...');
  const [allTitles, version] = await Promise.all([
    getAllPageTitles(),
    getLatestVersion(),
  ]);
  console.log(`Found ${allTitles.length} pages, version ${version}`);

  // Filter to content pages (skip templates, WIP, nav pages, etc.)
  const contentTitles = allTitles.filter(
    (t) =>
      !t.startsWith('Template:') &&
      !t.startsWith('WIP ') &&
      !t.startsWith('NavTemplates') &&
      !t.startsWith('Wiki ') &&
      !t.startsWith('Sample ') &&
      t !== 'Main Page' &&
      t !== 'All Item Descriptions' &&
      t !== 'All Recipes' &&
      t !== 'All Research' &&
      t !== 'Blueprints',
  );

  // ---------------------------------------------------------------------------
  // Phase 1: Fetch and parse all pages
  // ---------------------------------------------------------------------------
  console.log('Fetching page content...');
  const pageWikitext: Record<string, string> = {};

  // Batch fetches to avoid overwhelming the API
  const BATCH_SIZE = 10;
  for (let i = 0; i < contentTitles.length; i += BATCH_SIZE) {
    const batch = contentTitles.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (title) => {
        const text = await getPageWikitext(title);
        return { title, text };
      }),
    );
    for (const { title, text } of results) pageWikitext[title] = text;

    if (i % 50 === 0 && i > 0) {
      console.log(`  Processed ${i}/${contentTitles.length} pages...`);
    }
  }

  // Renamed pages leave redirects behind; toId() resolves references through
  // them, so the map has to exist before anything is parsed
  collectRedirects(pageWikitext);
  console.log(
    `Fetched ${contentTitles.length} pages, ${redirects.size} redirects`,
  );

  console.log('Parsing page content...');
  const wikiItems: WikiItem[] = [];

  for (const [title, text] of Object.entries(pageWikitext)) {
    // Parse StructureInfo or ItemInfo
    const structInfo = parseTemplate(text, 'StructureInfo');
    const itemInfo = parseTemplate(text, 'ItemInfo');
    const info = structInfo ?? itemInfo;

    if (!info) continue;

    const name = info['Name'] ?? title;
    const id = toId(name);

    // Parse element - extract from template ref like {{Water}} or {{Salt Group}}
    const elementRaw = info['Element'] ?? '';
    const elementRef = extractTemplateRef(elementRaw) ?? elementRaw;
    const element = toId(
      elementRef.replace(' Group', '').replace(' Research', ''),
    );

    // Parse type
    const typeRaw = info['Type'] ?? '';
    const type = extractLinkText(typeRaw) || 'Unknown';

    // Parse unlocked by
    const unlockedByRaw = info['UnlockedBy'] ?? '';
    const unlockedBy = extractTemplateRef(unlockedByRaw) ?? unlockedByRaw;

    // Parse crafted in
    const craftedInRaw = info['CraftedIn'] ?? '';
    const craftedIn = extractTemplateRef(craftedInRaw) ?? craftedInRaw;

    // Parse ingredients - handle "or" alternatives
    const { ingredients: mainIngredients, alternatives: orAlternatives } =
      parseIngredientFields(info);

    // Parse machine recipes from the page
    const machineRecipes = parseRecipeTableItems(text);

    const imageFilename = info['Img']
      ? extractImageFilename(info['Img'])
      : null;

    wikiItems.push({
      name,
      id,
      element,
      type,
      unlockedBy,
      craftedIn,
      ingredients: mainIngredients,
      altIngredients: orAlternatives.length > 0 ? orAlternatives : undefined,
      craftTime: parseFloat(info['CraftTime'] ?? '1') || 1,
      produced: parseFloat(info['Produced'] ?? '1') || 1,
      power: parseFloat(info['Power'] ?? '0') || 0,
      stack: parseInt(info['Stack'] ?? '50', 10) || 50,
      imageFilename,
      machineRecipes,
    });
  }

  console.log(`Parsed ${wikiItems.length} items from wiki`);

  // ---------------------------------------------------------------------------
  // Phase 2: Parse research pages
  // ---------------------------------------------------------------------------
  console.log('Parsing research pages...');
  const researchEntries: ResearchEntry[] = [];
  const tableResearch = new Map<string, ResearchSource>();

  for (const researchPage of RESEARCH_PAGES) {
    const title = resolveTitle(researchPage);
    const text = pageWikitext[title];
    if (!text) {
      console.warn(`  Warning: research page "${researchPage}" not found`);
      continue;
    }

    for (const entry of parseResearchEntries(text)) {
      researchEntries.push(entry);
      if (!tableResearch.has(entry.id)) {
        tableResearch.set(entry.id, { entry, page: title });
      }
    }
  }

  // Each research also has its own page with an ElementResearchInfo. The
  // tables are authoritative, but some researches only exist on their page.
  const pageResearch = new Map<string, ResearchSource>();
  for (const [title, text] of Object.entries(pageWikitext)) {
    const entry = parseResearchPage(text);
    if (entry && !pageResearch.has(entry.id)) {
      pageResearch.set(entry.id, { entry, page: title });
    }
  }
  let pageOnlyCount = 0;
  for (const [id, source] of pageResearch) {
    if (!tableResearch.has(id)) {
      researchEntries.push(source.entry);
      pageOnlyCount++;
    }
  }

  console.log(
    `Parsed ${researchEntries.length} research entries (${pageOnlyCount} only on their own page)`,
  );
  const report = writeResearchReport(tableResearch, pageResearch, version);

  // ---------------------------------------------------------------------------
  // Phase 3: Build categories
  // ---------------------------------------------------------------------------

  // Map element names to categories
  const categoryMap: Record<string, { name: string; icon: string }> = {
    salt: { name: 'Salt', icon: 'salt-prism' },
    water: { name: 'Water', icon: 'elemental-water' },
    life: { name: 'Life', icon: 'elemental-life' },
    earth: { name: 'Earth', icon: 'elemental-earth' },
    fire: { name: 'Fire', icon: 'elemental-fire' },
    shadow: { name: 'Shadow', icon: 'elemental-shadow' },
    air: { name: 'Air', icon: 'elemental-air' },
    entropy: { name: 'Entropy', icon: 'entropic-shard' },
    logistics: { name: 'Logistics', icon: 'saltway' },
    artifice: { name: 'Artifice', icon: 'infusion-altar' },
    research: { name: 'Research', icon: 'infusion-altar' },
  };

  const categories: CategoryJson[] = Object.entries(categoryMap).map(
    ([id, info]) => ({
      id,
      name: info.name,
      icon: info.icon,
    }),
  );

  // ---------------------------------------------------------------------------
  // Phase 4: Build items and recipes
  // ---------------------------------------------------------------------------

  const items: ItemJson[] = [];
  const recipes: RecipeJson[] = [];
  const seenItemIds = new Set<string>();
  const seenRecipeIds = new Set<string>();
  const variantCount: Record<string, number> = {};
  // Machine variants are later-game alternatives to an item's base recipe;
  // they're excluded by default so the solver doesn't prefer them
  const machineVariantIds: string[] = [];

  // Track which machines exist (to validate recipe producers)
  const machineIds = new Set<string>();

  // First pass: identify machines
  for (const wi of wikiItems) {
    if (wi.type === 'Production') {
      machineIds.add(wi.id);
    }
  }

  // Also add Infusion Altar as a machine (it's Artifice type but produces research)
  const infusionAltarItem = wikiItems.find((w) => w.id === 'infusion-altar');
  if (infusionAltarItem) machineIds.add('infusion-altar');

  // Build items
  for (const wi of wikiItems) {
    if (seenItemIds.has(wi.id)) continue;
    seenItemIds.add(wi.id);

    // Determine the category for this item
    let category = wi.element;
    if (wi.type === 'Logistics') category = 'logistics';
    else if (wi.type === 'Artifice') category = 'artifice';

    // Ensure category exists
    if (!categoryMap[category]) {
      category = wi.element || 'salt';
    }

    const item: ItemJson = {
      id: wi.id,
      name: wi.name,
      category,
      row: 0, // Will be computed later
    };

    if (wi.stack) item.stack = wi.stack;

    // Is this a belt?
    if (BELT_SPEEDS[wi.id] != null) {
      item.belt = { speed: BELT_SPEEDS[wi.id] };
    }

    // Is this a machine?
    if (machineIds.has(wi.id)) {
      const machine: MachineJson = {
        speed: COLLECTORS[wi.id]?.motes ?? 1,
        type: EnergyType.Electric,
        usage: wi.power || undefined,
      };
      item.machine = machine;
    }

    items.push(item);
  }

  // Add mote items that might only appear as ingredients but not as wiki pages
  const moteItems = [
    'mote-of-water',
    'mote-of-earth',
    'mote-of-shadow',
    'mote-of-life',
    'mote-of-fire',
    'mote-of-air',
    'entropic-shard',
  ];
  for (const moteId of moteItems) {
    if (!seenItemIds.has(moteId)) {
      const element = moteId
        .replace('mote-of-', '')
        .replace('entropic-shard', 'entropy');
      items.push({
        id: moteId,
        name: moteId
          .split('-')
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(' '),
        category: element,
        row: 0,
      });
      seenItemIds.add(moteId);
    }
  }

  // Build recipes from item crafting data
  for (const wi of wikiItems) {
    const craftedInId = toId(wi.craftedIn);

    // Skip if no ingredients (raw resource or special)
    if (Object.keys(wi.ingredients).length === 0 && !wi.altIngredients) {
      continue;
    }

    // Ensure all ingredient items exist
    for (const ingId of Object.keys(wi.ingredients)) {
      if (!seenItemIds.has(ingId)) {
        items.push({
          id: ingId,
          name: ingId
            .split('-')
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(' '),
          category: wi.element || 'salt',
          row: 0,
        });
        seenItemIds.add(ingId);
      }
    }

    // Create main recipe
    const recipeId = `craft-${wi.id}`;
    if (!seenRecipeIds.has(recipeId)) {
      const producers = machineIds.has(craftedInId) ? [craftedInId] : [];

      const outMap: Record<string, number> = {};
      outMap[wi.id] = wi.produced;

      const recipe: RecipeJson = {
        id: recipeId,
        name: wi.name,
        category: wi.element || 'salt',
        row: 0,
        time: wi.craftTime,
        producers,
        in: { ...wi.ingredients },
        out: outMap,
      };

      recipes.push(recipe);
      seenRecipeIds.add(recipeId);
    }

    // Create alternate recipes for "or" ingredients
    if (wi.altIngredients) {
      for (let altIdx = 0; altIdx < wi.altIngredients.length; altIdx++) {
        const altId = `craft-${wi.id}-alt-${altIdx + 1}`;
        if (seenRecipeIds.has(altId)) continue;
        seenRecipeIds.add(altId);

        const altIngredients = wi.altIngredients[altIdx];
        const producers = machineIds.has(craftedInId) ? [craftedInId] : [];

        // Ensure alt ingredient items exist
        for (const ingId of Object.keys(altIngredients)) {
          if (!seenItemIds.has(ingId)) {
            items.push({
              id: ingId,
              name: ingId
                .split('-')
                .map((w) => w[0].toUpperCase() + w.slice(1))
                .join(' '),
              category: wi.element || 'salt',
              row: 0,
            });
            seenItemIds.add(ingId);
          }
        }

        const outMap: Record<string, number> = {};
        outMap[wi.id] = wi.produced;

        recipes.push({
          id: altId,
          name: `${wi.name} (Alt ${altIdx + 1})`, // renamed by nameVariantRecipes
          category: wi.element || 'salt',
          row: 0,
          time: wi.craftTime,
          producers,
          in: altIngredients,
          out: outMap,
          icon: wi.id,
        });
      }
    }
  }

  // Also create recipes from machine recipe tables (for recipes that might not
  // have their own wiki page, or to ensure completeness)
  for (const wi of wikiItems) {
    if (!machineIds.has(wi.id)) continue;

    for (const mr of wi.machineRecipes) {
      const outputId = toId(mr.name);
      const recipeId = `craft-${outputId}`;

      // Ensure output item exists
      if (!seenItemIds.has(outputId)) {
        items.push({
          id: outputId,
          name: mr.name,
          category: wi.element || 'salt',
          row: 0,
        });
        seenItemIds.add(outputId);
      }

      if (seenRecipeIds.has(recipeId)) {
        // Recipe already exists - check if the recipe details match
        const existing = recipes.find((r) => r.id === recipeId);
        if (
          existing &&
          recipesMatch(
            existing,
            mr.ingredients,
            mr.craftTime,
            mr.produced,
            outputId,
          )
        ) {
          // Same recipe data — just add this machine as a producer
          addProducer(existing, wi.id);
        } else {
          // Check existing alt/variant recipes for a match
          const matchingVariant = recipes.find(
            (r) =>
              r.id.startsWith(`craft-${outputId}-`) &&
              recipesMatch(
                r,
                mr.ingredients,
                mr.craftTime,
                mr.produced,
                outputId,
              ),
          );
          if (matchingVariant) {
            addProducer(matchingVariant, wi.id);
          } else {
            // Different recipe data — create a variant
            const count = (variantCount[outputId] =
              (variantCount[outputId] || 0) + 1);
            const variantId = `craft-${outputId}-${wi.id}`;
            const finalId = seenRecipeIds.has(variantId)
              ? `${variantId}-${count}`
              : variantId;

            const outMap: Record<string, number> = {};
            outMap[outputId] = mr.produced;

            recipes.push({
              id: finalId,
              name: `${mr.name} (${wi.name})`, // renamed by nameVariantRecipes
              category: wi.element || 'salt',
              row: 0,
              time: mr.craftTime,
              producers: [wi.id],
              in: mr.ingredients,
              out: outMap,
              icon: outputId,
            });
            seenRecipeIds.add(finalId);
            machineVariantIds.push(finalId);
          }
        }
      } else {
        const outMap: Record<string, number> = {};
        outMap[outputId] = mr.produced;

        recipes.push({
          id: recipeId,
          name: mr.name,
          category: wi.element || 'salt',
          row: 0,
          time: mr.craftTime,
          producers: [wi.id],
          in: mr.ingredients,
          out: outMap,
        });
        seenRecipeIds.add(recipeId);
      }
    }
  }

  // Name variant recipes by how they differ from their siblings
  const itemNames = new Map(items.map((i) => [i.id, i.name]));
  nameVariantRecipes(recipes, (id) => itemNames.get(id) ?? idToName(id));

  // Add mining/harvesting recipes for motes (raw resources)
  for (const moteId of moteItems) {
    const recipeId = `harvest-${moteId}`;
    if (seenRecipeIds.has(recipeId)) continue;
    seenRecipeIds.add(recipeId);

    const element = moteId
      .replace('mote-of-', '')
      .replace('entropic-shard', 'entropy');

    // Collectors that can harvest this element (see COLLECTORS)
    const collectors = Object.entries(COLLECTORS).filter(
      ([id, rate]) => rate.elements.includes(element) && machineIds.has(id),
    );
    if (collectors.length === 0) continue;

    // The shared recipe time assumes all producers have the same cycle time
    const seconds = collectors[0][1].seconds;
    if (collectors.some(([, rate]) => rate.seconds !== seconds)) {
      console.warn(
        `  Warning: ${element} collectors have differing cycle times, using ${seconds}s`,
      );
    }

    const outMap: Record<string, number> = {};
    outMap[moteId] = 1;

    recipes.push({
      id: recipeId,
      name: `Harvest ${moteId
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ')}`,
      category: element,
      row: 0,
      time: seconds,
      producers: collectors.map(([id]) => id),
      in: {},
      out: outMap,
      flags: ['mining'],
    });
  }

  // Build research/technology items and recipes
  for (const re of researchEntries) {
    // Create research item if not already present
    if (!seenItemIds.has(re.id)) {
      const recipeUnlock = re.unlocks
        .map((u) => `craft-${u}`)
        .filter((r) => seenRecipeIds.has(r));
      items.push({
        id: re.id,
        name: re.name,
        category: 'research',
        row: 0,
        technology: {
          prerequisites:
            re.prerequisites.length > 0 ? re.prerequisites : undefined,
          recipeUnlock: recipeUnlock.length > 0 ? recipeUnlock : undefined,
          infinite: re.infinite ? true : undefined,
        },
      });
      seenItemIds.add(re.id);
    }

    // Create research recipe
    const recipeId = `research-${re.id}`;
    if (!seenRecipeIds.has(recipeId)) {
      seenRecipeIds.add(recipeId);

      const producers: string[] = [];
      if (machineIds.has('infusion-altar')) producers.push('infusion-altar');

      // Multiply ingredients by cycles
      const scaledIngredients: Record<string, number> = {};
      for (const [ingId, qty] of Object.entries(re.ingredients)) {
        scaledIngredients[ingId] = qty * re.cycles;

        // Ensure ingredient item exists
        if (!seenItemIds.has(ingId)) {
          items.push({
            id: ingId,
            name: ingId
              .split('-')
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(' '),
            category: 'salt',
            row: 0,
          });
          seenItemIds.add(ingId);
        }
      }

      const outMap: Record<string, number> = {};
      outMap[re.id] = 1;

      recipes.push({
        id: recipeId,
        name: re.name,
        category: 'research',
        row: 0,
        time: re.cycles, // Each cycle is roughly 1 second
        producers,
        in: scaledIngredients,
        out: outMap,
        flags: ['technology'],
      });
    }
  }

  // Drop prerequisites that don't resolve to a research item - the app treats
  // a technology with an unmet prerequisite as never researchable
  const researchIds = new Set(
    items.filter((i) => i.technology).map((i) => i.id),
  );
  const danglingPrereqs = new Set<string>();
  for (const item of items) {
    const tech = item.technology;
    if (!tech?.prerequisites) continue;
    const resolved = tech.prerequisites.filter((p) => {
      if (researchIds.has(p)) return true;
      danglingPrereqs.add(p);
      return false;
    });
    tech.prerequisites = resolved.length > 0 ? resolved : undefined;
  }
  if (danglingPrereqs.size > 0) {
    console.warn(
      `  Warning: dropped prerequisites that match no research item: ${[...danglingPrereqs].sort().join(', ')}`,
    );
  }

  // Assign row numbers — all items in same category share row 0
  // so they wrap horizontally in the picker's flex container
  for (const item of items) {
    item.row = 0;
  }
  for (const recipe of recipes) {
    // Recipe rows don't need to match items, just assign sequentially
    recipe.row = 0;
  }

  // ---------------------------------------------------------------------------
  // Phase 5: Download icons and build sprite sheet
  // ---------------------------------------------------------------------------
  // Hardcoded config refers to wiki items by id; a wiki rename breaks that
  const configIds = new Set([
    ...Object.keys(BELT_SPEEDS),
    ...Object.keys(COLLECTORS),
    ...Object.values(categoryMap).map((c) => c.icon),
    MIN_BELT,
    MAX_BELT,
  ]);
  const missingConfigIds = [...configIds].filter((id) => !seenItemIds.has(id));
  if (missingConfigIds.length > 0) {
    console.warn(
      `  Warning: config refers to items that don't exist (renamed on the wiki?): ${missingConfigIds.join(', ')}`,
    );
  }

  console.log('Downloading icons...');
  const iconDir = path.join(OUTPUT_DIR, 'icons_tmp');
  if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

  // Map item IDs to image filenames from wiki data
  const iconFilenameMap: Record<string, string> = {};
  for (const wi of wikiItems) {
    if (wi.imageFilename) {
      iconFilenameMap[wi.id] = wi.imageFilename;
    }
  }

  // Add research entry image filenames
  for (const re of researchEntries) {
    if (re.imageFilename) {
      iconFilenameMap[re.id] = re.imageFilename;
    }
  }

  // Manual icon overrides for items whose icons are on concept pages or have typos
  // search key: ICON_OVERRIDES
  iconFilenameMap['energetic-motes'] = 'EnergeticLarge.png';
  iconFilenameMap['persistent-motes'] = 'PersistentLarge.png';
  iconFilenameMap['cirrus-breezeway'] = 'CirusBreezeway.png'; // wiki typo: "Cirus" not "Cirrus"

  // Resolve research item icons: inherit from related items as fallback
  for (const item of items) {
    if (item.category === 'research' && item.technology && !item.icon) {
      // Only inherit if this research item has no image of its own
      if (!iconFilenameMap[item.id]) {
        const baseId = item.id.replace(/-research$/, '');
        if (baseId !== item.id && seenItemIds.has(baseId)) {
          item.icon = baseId;
        } else {
          const unlocked = item.technology.recipeUnlock;
          if (unlocked) {
            for (const recId of unlocked) {
              const itemId = recId.replace(/^craft-/, '');
              if (seenItemIds.has(itemId)) {
                item.icon = itemId;
                break;
              }
            }
          }
        }
      }
    }
  }

  // Collect all unique icon IDs we need
  const iconIds = new Set<string>();
  for (const item of items) {
    iconIds.add(item.icon ?? item.id);
  }

  // Download icons
  const iconPaths: Record<string, string> = {};
  let downloadCount = 0;

  for (const iconId of iconIds) {
    // Try to find image filename from wiki data
    const filenamesToTry: string[] = [];

    if (iconFilenameMap[iconId]) {
      filenamesToTry.push(iconFilenameMap[iconId]);
    }

    // Try constructing filename from name with multiple patterns
    const item = items.find((i) => i.id === iconId || i.icon === iconId);
    const itemName =
      item?.name ??
      iconId
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');

    filenamesToTry.push(
      itemName.replace(/\s+/g, '') + '.png', // "CirrusBreezeway.png"
      itemName.replace(/\s+/g, '_') + '.png', // "Cirrus_Breezeway.png"
      itemName + '.png', // "Cirrus Breezeway.png"
    );

    const localPath = path.join(iconDir, `${iconId}.png`);

    if (!fs.existsSync(localPath)) {
      try {
        let buf: Buffer | null = null;
        for (const filename of filenamesToTry) {
          const url = await getImageUrl(filename);
          if (url) {
            buf = await downloadImage(filename, url);
            break;
          }
        }
        if (buf) {
          // Resize to 64x64
          const resized = await sharp(buf)
            .resize(ICON_SIZE, ICON_SIZE, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toBuffer();
          fs.writeFileSync(localPath, resized);
          iconPaths[iconId] = localPath;
          downloadCount++;
        } else {
          // Create placeholder icon
          const placeholder = await sharp({
            create: {
              width: ICON_SIZE,
              height: ICON_SIZE,
              channels: 4,
              background: { r: 64, g: 64, b: 64, alpha: 255 },
            },
          })
            .png()
            .toBuffer();
          fs.writeFileSync(localPath, placeholder);
          iconPaths[iconId] = localPath;
        }
      } catch (err) {
        console.warn(`  Failed to download icon for ${iconId}: ${err}`);
        // Create placeholder
        const placeholder = await sharp({
          create: {
            width: ICON_SIZE,
            height: ICON_SIZE,
            channels: 4,
            background: { r: 64, g: 64, b: 64, alpha: 255 },
          },
        })
          .png()
          .toBuffer();
        fs.writeFileSync(localPath, placeholder);
        iconPaths[iconId] = localPath;
      }
    } else {
      iconPaths[iconId] = localPath;
    }
  }

  console.log(`Downloaded ${downloadCount} icons`);

  // Build sprite sheet using spritesmith
  console.log('Building sprite sheet...');
  const spriteFiles = Object.values(iconPaths);

  const spritesheetResult = await new Promise<spritesmith.SpritesmithResult>(
    (resolve, reject) => {
      spritesmith.run(
        {
          src: spriteFiles,
          padding: ICON_PADDING,
          algorithm: 'binary-tree',
        },
        (err: Error | null, result: spritesmith.SpritesmithResult) => {
          if (err) reject(err);
          else resolve(result);
        },
      );
    },
  );

  // Convert to webp
  const webpBuffer = await sharp(spritesheetResult.image)
    .webp({ quality: 90 })
    .toBuffer();

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'icons.webp'), webpBuffer);

  // Build icon entries with sprite positions and colors
  console.log('Computing icon colors...');
  const icons: IconJson[] = [];

  for (const iconId of iconIds) {
    const localPath = iconPaths[iconId];
    if (!localPath) continue;

    const spriteCoord = spritesheetResult.coordinates[localPath];
    if (!spriteCoord) continue;

    // Compute average color
    let color = '#808080';
    try {
      const avgColor = await getAverageColor(webpBuffer, {
        mode: 'precision',
        top: spriteCoord.y,
        left: spriteCoord.x,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
      color = avgColor.hex;
    } catch {
      // Use default
    }

    icons.push({ id: iconId, x: spriteCoord.x, y: spriteCoord.y, color });
  }

  // ---------------------------------------------------------------------------
  // Phase 6: Write output files
  // ---------------------------------------------------------------------------
  console.log('Writing output files...');

  // The app reads defaults from data.json; defaults.json is the readable copy.
  // "Minimum" hides the later-game machine variants and uses the basic
  // collector; "Upgraded" enables everything and prefers faster collectors.
  const collectorsByRate = Object.entries(COLLECTORS)
    .sort(([, a], [, b]) => b.motes / b.seconds - a.motes / a.seconds)
    .map(([id]) => id);
  const defaults: DefaultsJson = {
    presets: [
      {
        id: 0,
        label: 'options.preset.minimum',
        belt: MIN_BELT,
        machineRank: ['simple-collector'],
        excludedRecipes: [...machineVariantIds].sort(),
      },
      {
        id: 1,
        label: 'options.preset.upgraded',
        belt: MAX_BELT,
        machineRank: collectorsByRate,
        excludedRecipes: [],
      },
    ],
  };

  const modData: ModData = {
    version: { MoteMancer: version },
    flags: ['power'],
    categories,
    icons,
    items,
    recipes,
    defaults,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'data.json'), JSON.stringify(modData));

  // defaults.json is checked by the repo's prettier config, so format it
  const defaultsPath = path.join(OUTPUT_DIR, 'defaults.json');
  fs.writeFileSync(
    defaultsPath,
    await prettier.format(JSON.stringify(defaults), {
      ...(await prettier.resolveConfig(defaultsPath)),
      filepath: defaultsPath,
    }),
  );

  // Clean up temp icon directory
  try {
    fs.rmSync(iconDir, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }

  console.log(`\nBuild complete!`);
  console.log(`  Items: ${items.length}`);
  console.log(`  Recipes: ${recipes.length}`);
  console.log(`  Icons: ${icons.length}`);
  console.log(`  Categories: ${categories.length}`);
  console.log(
    `\nResearch wiki report: ${report.disagreements} disagreements, ${report.missing} missing table rows -> ${REPORT_PATH}`,
  );
  console.log(`\nOutput written to ${OUTPUT_DIR}/`);
  console.log(
    `Wiki cache: ${cacheStats.hits} hits, ${cacheStats.fetches} fetched from wiki`,
  );
  console.log(`\nNext steps:`);
  console.log(`  1. npm run update-hash -- mtm`);
  console.log(`  2. Review data.json for correctness`);
}

// #endregion

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
