/**
 * MoteMancer wiki scraper - builds FactorioLab game data from the community wiki
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/motemancer-build.ts
 *
 * Fetches data from https://motemancer.miraheze.org/ via the MediaWiki API,
 * parses {{StructureInfo}} and {{ItemInfo}} templates, downloads icons,
 * and outputs data.json, defaults.json, and icons.webp to src/data/mtm/.
 *
 * For icon overrides ctrl+f ICON_OVERRIDES
 */

import fs from 'fs';
import path from 'path';

import { getAverageColor } from 'fast-average-color-node';
import sharp from 'sharp';
import spritesmith from 'spritesmith';

import { CategoryJson } from '~/models/data/category';
import { IconJson } from '~/models/data/icon';
import { ItemJson } from '~/models/data/item';
import { MachineJson } from '~/models/data/machine';
import { ModData } from '~/models/data/mod-data';
import { RecipeJson } from '~/models/data/recipe';
import { EnergyType } from '~/models/enum/energy-type';

// #region Config

const WIKI_API = 'https://motemancer.miraheze.org/w/api.php';
const OUTPUT_DIR = './src/data/mtm';
const ICON_SIZE = 64;
const ICON_PADDING = 2;

// Belt speeds (items/sec) - currently needs to be hardcoded
const BELT_SPEEDS: Record<string, number> = {
  'shifting-slab': 4,
  'underground-slab': 4,
  streamway: 16,
  'verdant-stream': 16,
  'underground-stream': 16,
  'streamway-delta': 16,
  'verdant-delta': 16,
  'enchanted-delta': 16,
  'torrential-streamway': 24,
  'ichor-slick': 1000, // effectively instantaneous - no actual infinity option
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
  'Entropy_Research',
];

// #endregion

// #region API

async function fetchJson(url: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (attempt < retries && res.status >= 500) {
      console.warn(`  Retry ${attempt}/${retries} for ${res.status}: ${url}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${url}`);
  }
}

async function getAllPageTitles(): Promise<string[]> {
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

    const data = await fetchJson(`${WIKI_API}?${params}`);
    const pages = data.query?.allpages ?? [];
    for (const p of pages) {
      titles.push(p.title as string);
    }
    continueToken = data.continue?.apcontinue;
  } while (continueToken);

  return titles;
}

async function getPageWikitext(title: string): Promise<string> {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    formatversion: '2',
    format: 'json',
  });
  const data = await fetchJson(`${WIKI_API}?${params}`);
  return data.parse?.wikitext ?? '';
}

async function getImageUrl(filename: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: `File:${filename}`,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
  });
  const data = await fetchJson(`${WIKI_API}?${params}`);
  const pages = data.query?.pages ?? {};
  for (const page of Object.values(pages) as any[]) {
    const url = page.imageinfo?.[0]?.url;
    if (url) return url;
  }
  return null;
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// #endregion

// #region Template

interface TemplateFields {
  templateName: string;
  [key: string]: string;
}

function parseTemplate(
  wikitext: string,
  templateName: string,
): TemplateFields | null {
  // Find the start of the template
  const startPattern = `{{${templateName}`;
  const startIdx = wikitext.indexOf(startPattern);
  if (startIdx === -1) return null;

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

  if (endIdx === -1) return null;

  const body = wikitext.substring(startIdx + startPattern.length, endIdx);
  const fields: TemplateFields = { templateName };

  // Split by top-level | characters (not inside nested {{ }})
  const params = splitTopLevel(body, '|');
  for (const param of params) {
    const eqIdx = param.indexOf('=');
    if (eqIdx === -1) continue;
    const key = param.substring(0, eqIdx).trim();
    const value = param.substring(eqIdx + 1).trim();
    if (key && value) {
      fields[key] = value;
    }
  }

  return fields;
}

/** Split a string by a delimiter, but only at the top level (not inside {{ }}) */
function splitTopLevel(s: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{' && i + 1 < s.length && s[i + 1] === '{') {
      depth++;
      current += '{{';
      i++;
    } else if (s[i] === '}' && i + 1 < s.length && s[i + 1] === '}') {
      depth--;
      current += '}}';
      i++;
    } else if (s[i] === delimiter && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += s[i];
    }
  }
  if (current) parts.push(current);

  return parts;
}

/**
 * Parse all RecipeTableItem entries from a page's wikitext.
 * These appear in machine pages and list what the machine can produce.
 */
function parseRecipeTableItems(wikitext: string): Array<{
  name: string;
  ingredients: Record<string, number>;
  craftTime: number;
  produced: number;
}> {
  const results: Array<{
    name: string;
    ingredients: Record<string, number>;
    craftTime: number;
    produced: number;
  }> = [];

  // Match both RecipeTableItem and AltRecipeTableItem
  const regex = /\{\{(?:Alt)?RecipeTableItem\s*\n?([\s\S]*?)\}\}/g;
  let match;

  while ((match = regex.exec(wikitext)) !== null) {
    const body = match[1];
    const fields: Record<string, string> = {};
    const lines = body.split('|');
    for (const line of lines) {
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.substring(0, eqIdx).trim();
      const value = line.substring(eqIdx + 1).trim();
      if (key && value) fields[key] = value;
    }

    const name = extractLinkText(fields['Name'] ?? '');
    if (!name) continue;

    const ingredients: Record<string, number> = {};
    for (let i = 1; i <= 6; i++) {
      const ing = fields[`Ingredient${i}`];
      if (!ing) continue;
      const parsed = parseIngredient(ing);
      if (parsed) {
        for (const [item, qty] of parsed) {
          ingredients[item] = (ingredients[item] ?? 0) + qty;
        }
      }
    }

    results.push({
      name,
      ingredients,
      craftTime: parseFloat(fields['CraftTime'] ?? '1') || 1,
      produced: parseFloat(fields['Produced'] ?? '1') || 1,
    });
  }

  return results;
}

/**
 * Parse research entries from a research page.
 */
function parseResearchEntries(wikitext: string): Array<{
  name: string;
  cycles: number;
  ingredients: Record<string, number>;
  prerequisites: string[];
  unlocks: string[];
  imageFilename: string | null;
}> {
  const results: Array<{
    name: string;
    cycles: number;
    ingredients: Record<string, number>;
    prerequisites: string[];
    unlocks: string[];
    imageFilename: string | null;
  }> = [];

  const regex = /\{\{ElementalResearchTableItem\s*\n?([\s\S]*?)\}\}/g;
  let match;

  while ((match = regex.exec(wikitext)) !== null) {
    const body = match[1];
    const fields: Record<string, string> = {};
    const lines = body.split('|');
    for (const line of lines) {
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.substring(0, eqIdx).trim();
      const value = line.substring(eqIdx + 1).trim();
      if (key && value) fields[key] = value;
    }

    const name = extractLinkText(fields['Name'] ?? '');
    if (!name) continue;

    const ingredients: Record<string, number> = {};
    for (let i = 1; i <= 6; i++) {
      const ing = fields[`Ingredient${i}`];
      if (!ing) continue;
      const parsed = parseIngredient(ing);
      if (parsed) {
        for (const [item, qty] of parsed) {
          ingredients[item] = qty;
        }
      }
    }

    const prerequisites: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const before = fields[`Before${i}`];
      if (!before) continue;
      const t = extractTemplateRef(before);
      if (t) prerequisites.push(toId(t));
    }

    const unlocks: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const unlock = fields[`Unlock${i}`];
      if (!unlock) continue;
      const t = extractTemplateRef(unlock);
      if (t) unlocks.push(toId(t));
    }

    results.push({
      name,
      cycles: parseInt(fields['Cycles'] ?? '1', 10) || 1,
      ingredients,
      prerequisites,
      unlocks,
      imageFilename: fields['Img'] ? extractImageFilename(fields['Img']) : null,
    });
  }

  return results;
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

/** Convert a display name to a kebab-case ID */
function toId(name: string): string {
  return name
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
  machineRecipes: Array<{
    name: string;
    ingredients: Record<string, number>;
    craftTime: number;
    produced: number;
  }>;
}

interface ResearchEntry {
  name: string;
  id: string;
  cycles: number;
  ingredients: Record<string, number>;
  prerequisites: string[];
  unlocks: string[];
  imageFilename: string | null;
}

async function main(): Promise<void> {
  console.log('Fetching all page titles...');
  const allTitles = await getAllPageTitles();
  console.log(`Found ${allTitles.length} pages`);

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
  const wikiItems: WikiItem[] = [];
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

    for (const { title, text } of results) {
      pageWikitext[title] = text;

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
      const mainIngredients: Record<string, number> = {};
      const orAlternatives: Record<string, number>[] = [];
      let lastIngredientId: string | null = null;

      for (let j = 1; j <= 6; j++) {
        const ing = info[`Ingredient${j}`];
        if (!ing) continue;

        const trimmed = ing.trim();
        if (trimmed.toLowerCase().startsWith('or ')) {
          // This is an "or" alternative for the previous ingredient
          const parsed = parseIngredient(trimmed.replace(/^or\s+/i, ''));
          if (parsed) {
            for (const [itemId, qty] of parsed) {
              const alt = { ...mainIngredients };
              // Remove the previous ingredient and replace with this alternative
              if (lastIngredientId) delete alt[lastIngredientId];
              alt[itemId] = qty;
              orAlternatives.push(alt);
            }
          }
        } else {
          const parsed = parseIngredient(trimmed);
          if (parsed) {
            for (const [itemId, qty] of parsed) {
              mainIngredients[itemId] = qty;
              lastIngredientId = itemId;
            }
          }
        }
      }

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

    if (i % 50 === 0 && i > 0) {
      console.log(`  Processed ${i}/${contentTitles.length} pages...`);
    }
  }

  console.log(`Parsed ${wikiItems.length} items from wiki`);

  // ---------------------------------------------------------------------------
  // Phase 2: Parse research pages
  // ---------------------------------------------------------------------------
  console.log('Parsing research pages...');
  const researchEntries: ResearchEntry[] = [];

  for (const researchPage of RESEARCH_PAGES) {
    const text = pageWikitext[researchPage.replace(/_/g, ' ')];
    if (!text) {
      console.warn(`  Warning: research page "${researchPage}" not found`);
      continue;
    }

    const entries = parseResearchEntries(text);
    for (const entry of entries) {
      researchEntries.push({
        ...entry,
        id: toId(entry.name),
      });
    }
  }

  console.log(`Parsed ${researchEntries.length} research entries`);

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
    logistics: { name: 'Logistics', icon: 'shifting-slab' },
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
        speed: 1,
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
          name: `${wi.name} (Alt ${altIdx + 1})`,
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
        // Recipe already exists - make sure this machine is listed as a producer
        const existing = recipes.find((r) => r.id === recipeId);
        if (existing && !existing.producers.includes(wi.id)) {
          existing.producers.push(wi.id);
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

  // Add mining/harvesting recipes for motes (raw resources)
  for (const moteId of moteItems) {
    const recipeId = `harvest-${moteId}`;
    if (seenRecipeIds.has(recipeId)) continue;
    seenRecipeIds.add(recipeId);

    const element = moteId
      .replace('mote-of-', '')
      .replace('entropic-shard', 'entropy');

    // Motes are harvested from collectors
    const collectorMap: Record<string, string> = {
      water: 'tidal-collector',
      life: 'verdant-collector',
      earth: 'quarry-collector',
      fire: 'ember-collector',
      shadow: 'shade-collector',
      air: 'tempest-collector',
    };

    const producers: string[] = [];
    // Simple collector can harvest any mote
    if (machineIds.has('simple-collector')) {
      producers.push('simple-collector');
    }
    // Specialized collector for this element
    const specialCollector = collectorMap[element];
    if (specialCollector && machineIds.has(specialCollector)) {
      producers.push(specialCollector);
    }

    if (producers.length > 0) {
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
        time: 1,
        producers,
        in: {},
        out: outMap,
        flags: ['mining'],
      });
    }
  }

  // Build research/technology items and recipes
  for (const re of researchEntries) {
    // Create research item if not already present
    if (!seenItemIds.has(re.id)) {
      items.push({
        id: re.id,
        name: re.name,
        category: 'research',
        row: 0,
        technology: {
          prerequisites:
            re.prerequisites.length > 0 ? re.prerequisites : undefined,
          unlockedRecipes: re.unlocks
            .map((u) => `craft-${u}`)
            .filter((r) => seenRecipeIds.has(r)),
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
          const unlocked = item.technology.unlockedRecipes;
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
        let url: string | null = null;
        for (const filename of filenamesToTry) {
          url = await getImageUrl(filename);
          if (url) break;
        }
        if (url) {
          const buf = await downloadImage(url);
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

    const position = `-${spriteCoord.x}px -${spriteCoord.y}px`;

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

    icons.push({ id: iconId, position, color });
  }

  // ---------------------------------------------------------------------------
  // Phase 6: Write output files
  // ---------------------------------------------------------------------------
  console.log('Writing output files...');

  const modData: ModData = {
    version: { MoteMancer: '1.0.0' },
    categories,
    icons,
    items,
    recipes,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'data.json'), JSON.stringify(modData));

  // Defaults - use Shifting Slab as min belt, Torrential Streamway as max
  const defaults = {
    minBelt: 'shifting-slab',
    maxBelt: 'torrential-streamway',
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'defaults.json'),
    JSON.stringify(defaults, null, 4),
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
  console.log(`\nOutput written to ${OUTPUT_DIR}/`);
  console.log(`\nNext steps:`);
  console.log(`  1. npm run update-hash -- mtm`);
  console.log(`  2. Review data.json for correctness`);
}

// #endregion

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
