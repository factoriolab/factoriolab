import fs from 'fs';
import path from 'path';

import { getJsonData } from './helpers/file.helpers';
import { logTime, logWarn } from './helpers/log.helpers';
import { listDaFiles, parseDaFile } from './starrupture/buildings';
import { parseBdFile } from './starrupture/buildingData';
import { listCrcFiles, parseCrcFile, parseCrFile, CrInfo, CrcInfo } from './starrupture/recipes';
import { buildItemMap } from './starrupture/items';
import { packIcons, IconEntry } from './starrupture/icons';

type CLIArgs = {
  input: string;
  output: string;
  dryRun: boolean;
  verbose: boolean;
  buildings: string[] | null; // null means no filter (all buildings)
};

const DEFAULT_BUILDINGS = [
  'DA_AcidExtractor',
  'DA_GasExtractor',
  'DA_MechanicalDrill',
  'DA_Smelter',
  'DA_Crafter',
  'DA_Furnace',
  'DA_Hammer',
  'DA_Refinery',
  'DA_Synthetizer',
  'DA_Assembler',
];

function parseArgs(argv: string[]): CLIArgs {
  const args = argv.slice(2);
  const out: CLIArgs = {
    input: 'sr-data',
    output: 'src/data/str',
    dryRun: false,
    verbose: false,
    buildings: DEFAULT_BUILDINGS.slice(),
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--input' && args[i + 1]) {
      out.input = args[++i];
    } else if (a === '--output' && args[i + 1]) {
      out.output = args[++i];
    } else if (a === '--buildings' && args[i + 1]) {
      const val = args[++i];
      if (val.toLowerCase() === 'all') {
        out.buildings = null;
      } else {
        out.buildings = val.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--verbose') out.verbose = true;
  }

  return out;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  logTime('Starting StarRupture build');

  const srData = args.input;
  if (!fs.existsSync(srData)) {
    logWarn(`sr-data directory not found at ${srData}`);
    process.exit(1);
  }

  logTime('Scanning for building DA files');
  const daFiles = listDaFiles(srData);
  console.log(`Found ${daFiles.length} DA files`);

  // Apply building filter if provided (null means include all)
  let daFilesFiltered: string[] = daFiles;
  if (args.buildings != null) {
    const allowed = new Set(args.buildings);
    daFilesFiltered = daFiles.filter((fp) => allowed.has(path.basename(fp, '.json')));
    console.log(`Filtered DA files to ${daFilesFiltered.length} entries: ${args.buildings.join(', ')}`);
  } else {
    console.log('No building filter applied; processing all DA files');
  }

  const parsed = daFilesFiltered.map((filePath: string) => {
    const info = parseDaFile(filePath);
    // If there is a placement data path, try to resolve BD
    if (info.placementDataPath) {
      const bdRelative = info.placementDataPath
        .replace('/Game/Chimera/', '')
        .split('.')[0]
        .replace(/\//g, path.sep);
      const bdPath = path.join(srData, bdRelative + '.json');

      if (!fs.existsSync(bdPath)) {
        if (args.verbose) logWarn(`BD file not found for ${info.id}: ${bdPath}`);
        return { da: info, bd: null };
      }

      try {
        const bd = parseBdFile(bdPath);
        return { da: info, bd };
      } catch (err) {
        logWarn(`Failed to parse BD at ${bdPath}: ${(err as Error).message}`);
        return { da: info, bd: null };
      }
    }

    return { da: info, bd: null };
  });

  const tempOutDir = 'temp/str-data-debug';
  if (!fs.existsSync(tempOutDir)) fs.mkdirSync(tempOutDir, { recursive: true });
  const outPath = path.join(tempOutDir, 'buildings.json');
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
  logTime(`Wrote debug buildings to ${outPath}`);

  // --- Recipes ---
  logTime('Scanning CRC recipe collections');
  const crcFiles = listCrcFiles(srData);
  console.log(`Found ${crcFiles.length} CRC files`);
  const crcParsed: CrcInfo[] = crcFiles.map((p: string) => parseCrcFile(p));

  // Expand CRs referenced by the CRCs
  const crObjectPaths = crcParsed.reduce((acc: string[], c: CrcInfo) => {
    acc.push(...c.recipes);
    return acc;
  }, []);

  const crParsed = crObjectPaths
    .map((objPath: string) => {
      try {
        return parseCrFile(srData, objPath);
      } catch (err) {
        logWarn(`Failed to parse CR ${objPath}: ${(err as Error).message}`);
        return null;
      }
    })
    .filter((r): r is import('./starrupture/recipes').CrInfo => r != null);

  const recipesOut = path.join(tempOutDir, 'recipes.json');
  fs.writeFileSync(recipesOut, JSON.stringify({ crc: crcParsed, cr: crParsed }, null, 2));
  logTime(`Wrote debug recipes to ${recipesOut}`);

  // --- Items ---
  logTime('Scanning Items');
  const itemMap = buildItemMap(srData);
  const itemsOut = path.join(tempOutDir, 'items.json');
  fs.writeFileSync(itemsOut, JSON.stringify(Object.values(itemMap), null, 2));
  logTime(`Wrote debug items to ${itemsOut}`);

  // Map recipe IO to item ids and filter invalid recipes
  const mappedRecipes = crParsed.map((r) => {
    // Map output
    if (!r.output) {
      logWarn(`Recipe ${r.id} has no output; skipping as fatal`);
      return null;
    }

    const outItemPath = r.output.itemObjectPath;
    const outItemKey = outItemPath?.startsWith('/Game/') ? outItemPath : (outItemPath?.replace(/^BlueprintGeneratedClass\'|\'$/g, '') ?? outItemPath);
    const outItem = itemMap[outItemKey] ?? itemMap[outItemKey.toLowerCase()];
    if (!outItem) {
      logWarn(`Unable to resolve output item for recipe ${r.id}: ${outItemPath}`);
      return null;
    }

    const inputs: Record<string, number> = {};
    for (const inp of r.inputs) {
      const ik = inp.itemObjectPath?.startsWith('/Game/') ? inp.itemObjectPath : (inp.itemObjectPath?.replace(/^BlueprintGeneratedClass\'|\'$/g, '') ?? inp.itemObjectPath);
      const ii = itemMap[ik] ?? itemMap[ik.toLowerCase()];
      if (!ii) {
        logWarn(`Unable to resolve input item for recipe ${r.id}: ${inp.itemObjectPath}`);
        // still include with original path key so it can be examined
        inputs[inp.itemObjectPath ?? 'unknown'] = inp.count;
      } else {
        inputs[ii.id] = inp.count;
      }
    }

    const out: Record<string, number> = {};
    out[outItem.id] = r.output.count;

    return {
      id: r.id,
      name: r.name,
      time: r.buildTime ?? 999,
      in: inputs,
      out: out,
      sourcePath: r.path,
    };
  }).filter((x) => x != null);

  const mappedOut = path.join(tempOutDir, 'recipes.mapped.json');
  fs.writeFileSync(mappedOut, JSON.stringify(mappedRecipes, null, 2));
  logTime(`Wrote mapped recipes to ${mappedOut}`);

  // --- Icons: select from included buildings and recipes ---
  logTime('Selecting icons for included buildings and recipes');
  // Determine which CRCs/CRs are referenced by our filtered DA files
  const includedCrcIds = new Set<string>();
  for (const p of parsed) {
    const cp = p.da.craftingRecipeCollectionPath;
    if (cp) {
      const parts = cp.split('/');
      const crcId = parts[parts.length - 1];
      includedCrcIds.add(crcId);
    }
  }

  // Gather objectPaths for included CRs
  const includedCrObjectPaths = new Set<string>();
  for (const c of crcParsed) {
    if (includedCrcIds.has(c.id)) {
      for (const rp of c.recipes) includedCrObjectPaths.add(rp);
    }
  }

  const includedCrParsed = crParsed.filter((r) => includedCrObjectPaths.has(r.objectPath));

  // Items referenced by included recipes
  const includedItemIds = new Set<string>();
  for (const r of includedCrParsed) {
    if (r.output) {
      const outKey = r.output.itemObjectPath ?? '';
      const outItem = itemMap[outKey] ?? itemMap[outKey.toLowerCase()];
      if (outItem) includedItemIds.add(outItem.id);
    }
    for (const inp of r.inputs) {
      const inKey = inp.itemObjectPath ?? '';
      const inItem = itemMap[inKey] ?? itemMap[inKey.toLowerCase()];
      if (inItem) includedItemIds.add(inItem.id);
    }
  }

  // Buildings' icons (use same slugging as building ids so machine items match icon ids)
  const buildingIconEntries: IconEntry[] = [];
  for (const p of parsed) {
    if (p.bd && p.bd.iconObjectPath) {
      const rawId = (p.bd.uniqueName ?? p.bd.id ?? p.da.id ?? '').replace(/^DA_/, '');
      const bSlug = rawId.replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase()).replace(/^-/, '');
      buildingIconEntries.push({ id: bSlug, objectPath: p.bd.iconObjectPath });
    }
  }

  function slugify(s: string): string {
    return s
      .replace(/([A-Z])/g, (m) => '-' + m.toLowerCase())
      .replace(/^-/, '')
      .replace(/_+/g, '-')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }

  // Item icon entries
  const itemIconEntries: IconEntry[] = [];
  for (const iid of includedItemIds) {
    // find item by id
    const v = Object.values(itemMap).find((it) => it.id === iid);
    if (!v) continue;
    if (!v.iconObjectPath) continue;
    itemIconEntries.push({ id: v.id, objectPath: v.iconObjectPath });
  }

  const iconsToPack = [...buildingIconEntries, ...itemIconEntries];
  const iconsOutPath = path.join(args.output, 'icons.webp');
  // pack icons (attempt to write sprite if sharp present and not dry-run)
  const iconsMeta = await packIcons(srData, iconsOutPath, iconsToPack, { iconSize: 64, padding: 0, columns: 8, dryRun: args.dryRun });

  const iconsDebugOut = path.join(tempOutDir, 'icons.json');
  fs.writeFileSync(iconsDebugOut, JSON.stringify(iconsMeta, null, 2));
  logTime(`Wrote icons (${iconsMeta.length}) and metadata to ${iconsDebugOut}`);

  // --- Generate final data.json using the building filter ---
  logTime('Generating data.json for filtered buildings');

  // Map CRC id -> buildings (slugs)
  const crcToBuildings: Record<string, string[]> = {};
  // Also gather building -> category mapping and category list
  const buildingSlugToCategory: Record<string, string> = {};
  const categoriesMap: Record<string, { id: string; name: string }> = {};

  function tokenToId(token: string): string {
    return token
      .replace(/^ECrBuildingUISubType::|^ECrBuildingUIType::/, '')
      .replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase())
      .replace(/^-/, '');
  }

  function tokenToName(token: string): string {
    const raw = token.replace(/^ECrBuildingUISubType::|^ECrBuildingUIType::/, '');
    // Split camelcase / underscores
    return raw.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  }

  for (const p of parsed) {
    const cp = p.da.craftingRecipeCollectionPath;
    if (!cp) continue;
    const crcId = cp.split('/').pop() ?? '';
    const bId = (p.bd?.uniqueName ?? p.bd?.id ?? p.da.id ?? '').replace(/^DA_/, '');
    const bSlug = bId.replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase()).replace(/^-/, '');
    if (!crcToBuildings[crcId]) crcToBuildings[crcId] = [];
    crcToBuildings[crcId].push(bSlug);

    // determine building category from BD (UISubType or UIType normalized into uiSubType by parser)
    const catRaw = p.bd?.uiSubType ?? null;
    if (catRaw) {
      const catToken = String(catRaw).split('::').pop() ?? String(catRaw);
      const catId = tokenToId(String(catRaw));
      const catName = tokenToName(String(catRaw));
      buildingSlugToCategory[bSlug] = catId;
      if (!categoriesMap[catId]) categoriesMap[catId] = { id: catId, name: catName };
    }
  }

  // Included CRs from included CRCs
  const includedCrcIdsList = Array.from(includedCrcIds);
  const includedCrObjectPathsList = Array.from(includedCrObjectPaths);
  const includedCrInfos = crParsed.filter((r) => includedCrObjectPathsList.includes(r.objectPath));

  // Determine included items from these recipes
  const includedItemIdsFinal = new Set<string>();
  for (const r of includedCrInfos) {
    if (r.output) {
      const outItem = itemMap[r.output.itemObjectPath ?? ''] ?? itemMap[(r.output.itemObjectPath ?? '').toLowerCase()];
      if (outItem) includedItemIdsFinal.add(outItem.id);
    }
    for (const inp of r.inputs) {
      const inItem = itemMap[inp.itemObjectPath ?? ''] ?? itemMap[(inp.itemObjectPath ?? '').toLowerCase()];
      if (inItem) includedItemIdsFinal.add(inItem.id);
    }
  }

  // Build items array
  const itemsArr: any[] = [];
  const fallbackIconId = iconsMeta[0]?.id ?? 'missing-icon';
  for (const iid of includedItemIdsFinal) {
    const it = Object.values(itemMap).find((x) => x.id === iid);
    if (!it) continue;
    const iconEntry = iconsMeta.find((ic) => ic.id === it.id);
    if (!iconEntry) logWarn(`No icon found for item ${it.id}; using fallback ${fallbackIconId}`);
    itemsArr.push({
      category: it.uiItemType && String(it.uiItemType).includes('Resource') ? 'raw' : 'parts',
      id: it.id,
      name: it.name ?? it.fileBasename,
      row: 0,
      stack: it.stack ?? 100,
      icon: iconEntry?.id ?? fallbackIconId,
    });
  }

  // Add machine entries for filtered buildings (as items with a 'machine' subobject)
  for (const p of parsed) {
    const bId = (p.bd?.uniqueName ?? p.bd?.id ?? p.da.id ?? '').replace(/^DA_/, '');
    if (!bId) continue;
    const bSlug = bId.replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase()).replace(/^-/, '');
    // avoid duplicates
    if (itemsArr.find((x) => x.id === bSlug)) continue;

    const iconEntry = iconsMeta.find((ic) => ic.id === bSlug);
    const machine: any = {};
    // Speed: use inverse of craftingLoopDuration if available (cycles per second-ish), otherwise default to 1
    if (p.da.craftingLoopDuration != null && p.da.craftingLoopDuration > 0) machine.speed = Number((1 / p.da.craftingLoopDuration).toFixed(6));
    else machine.speed = 1;
    // note: 'type' removed (invalid); keep usage only
    if (p.da.electricityValue != null) machine.usage = p.da.electricityValue;
    // rename coolingCapacity -> pollution to avoid adding new columns elsewhere
    if (p.da.coolingCapacity != null) machine.pollution = p.da.coolingCapacity;
    // default modules placeholder
    machine.modules = 1;

    const categoryForBuilding = buildingSlugToCategory[bSlug] ?? 'other';

    itemsArr.push({
      category: categoryForBuilding,
      id: bSlug,
      name: p.bd?.name ?? p.da.id,
      row: 0,
      machine,
      icon: iconEntry?.id ?? bSlug,
    });
  }

  // Build recipes array
  const recipesArr: any[] = [];
  for (const r of includedCrInfos) {
    if (!r.output) {
      logWarn(`Skipping recipe ${r.id} because it has no output`);
      continue;
    }

    const outItem = itemMap[r.output.itemObjectPath ?? ''] ?? itemMap[(r.output.itemObjectPath ?? '').toLowerCase()];
    if (!outItem) {
      logWarn(`Skipping recipe ${r.id} because output item couldn't be resolved: ${r.output.itemObjectPath}`);
      continue;
    }

    const inMap: Record<string, number> = {};
    for (const inp of r.inputs) {
      const ii = itemMap[inp.itemObjectPath ?? ''] ?? itemMap[(inp.itemObjectPath ?? '').toLowerCase()];
      if (ii) inMap[ii.id] = (inMap[ii.id] ?? 0) + inp.count;
      else inMap[inp.itemObjectPath ?? 'unknown'] = (inMap[inp.itemObjectPath ?? 'unknown'] ?? 0) + inp.count;
    }

    const outMap: Record<string, number> = {};
    outMap[outItem.id] = r.output.count;

    // producers: find CRC id that contains this CR
    const crcForThis = crcParsed.find((c) => c.recipes.includes(r.objectPath));
    const producers = crcForThis ? (crcToBuildings[crcForThis.id] ?? []) : [];

    // Determine category: prefer producer building category when available
    let recipeCategory = outItem.uiItemType && String(outItem.uiItemType).includes('Resource') ? 'raw' : 'parts';
    if (producers.length > 0) {
      const firstProducer = producers[0];
      const bcat = buildingSlugToCategory[firstProducer];
      if (bcat) recipeCategory = bcat;
      else if (producers.length > 1) {
        // try to find any producer with a category
        for (const pSlug of producers) {
          if (buildingSlugToCategory[pSlug]) {
            recipeCategory = buildingSlugToCategory[pSlug];
            break;
          }
        }
      }
    }

    const recipeIdBase = r.id.replace(/^CR_/, '').toLowerCase();
    const recipeId = recipeIdBase; // keep simple; collisions unlikely for filtered set

    recipesArr.push({
      id: recipeId,
      name: r.name ?? r.id,
      producers: producers,
      time: r.buildTime ?? 999,
      in: inMap,
      out: outMap,
      row: 0,
      category: recipeCategory,
    });
  }

  // Build icons array: include building icons and item icons used
  const usedIconIdsFinal = new Set<string>();
  for (const p of parsed) {
    if (p.bd && p.bd.iconObjectPath) {
      const bslug = (p.bd.uniqueName ?? p.bd.id ?? p.da.id).toLowerCase();
      usedIconIdsFinal.add(bslug.replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase()).replace(/^-/, ''));
    }
  }
  for (const it of itemsArr) usedIconIdsFinal.add(it.icon);

  const iconsArr = iconsMeta.filter((ic) => usedIconIdsFinal.has(ic.id)).map((ic) => ({ id: ic.id, position: ic.position, color: ic.color }));

  const categoriesArr = Object.values(categoriesMap);

  const outData = {
    version: { StarRupture: 'EA' },
    categories: categoriesArr.length > 0 ? categoriesArr : [{ id: 'raw', name: 'Raw', icon: 'raw-titanium' }],
    icons: iconsArr,
    items: itemsArr,
    recipes: recipesArr,
    defaults: { minBelt: 'rail-v1', maxBelt: 'rail-v5', excludedRecipes: [] },
  };

  const dataOutPath = path.join(args.output, 'data.json');
  if (!args.dryRun) {
    if (!fs.existsSync(args.output)) fs.mkdirSync(args.output, { recursive: true });
    fs.writeFileSync(dataOutPath, JSON.stringify(outData, null, 2));
  }

  const dataDebugOut = path.join(tempOutDir, 'data.generated.json');
  fs.writeFileSync(dataDebugOut, JSON.stringify(outData, null, 2));
  logTime(`Wrote data.json to ${dataOutPath} and debug ${dataDebugOut}`);

  logTime('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
