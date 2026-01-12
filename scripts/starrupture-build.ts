import fs from 'fs';
import path from 'path';

import { logTime, logWarn } from './helpers/log.helpers';
import { listDaFiles, parseDaFile } from './starrupture/buildings';
import { parseBdFile } from './starrupture/buildingData';
import { listCrcFiles, parseCrcFile, parseCrFile, CrInfo, CrcInfo } from './starrupture/recipes';
import { buildItemMap } from './starrupture/items';
import { packIcons, IconEntry, indexUiIcons, generatePurityVariants } from './starrupture/icons';
import { slugify, makeMachineEntry, makeBeltEntry, expandProducersForPurity } from './starrupture/helpers';

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
  'DA_MechanicalDrill', // Ore Extractor, tiered
  'DA_Smelter',
  'DA_Crafter', // Fabricator
  'DA_Furnace',
  'DA_Hammer', // Mega Press
  'DA_Refinery',
  'DA_Synthetizer', // Compounder
  'DA_Assembler',
  'DA_DroneRailT1',
  'DA_DroneRailT2',
  'DA_DroneRailT3',
  'DA_DroneRailT4',
  'DA_DroneRailT5',
];

// Buildings which should have Impure / Normal / Pure variants generated for them.
// Use the generated slug (e.g., 'mechanical-drill' for `DA_MechanicalDrill`).
const PURITY_BUILDINGS: string[] = [
  'mechanical-drill', // Ore Extractor
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
    const arg = args[i];
    if (arg === '--input' && args[i + 1]) {
      out.input = args[++i];
    } else if (arg === '--output' && args[i + 1]) {
      out.output = args[++i];
    } else if (arg === '--buildings' && args[i + 1]) {
      const val = args[++i];
      if (val.toLowerCase() === 'all') {
        out.buildings = null;
      } else {
        out.buildings = val.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--verbose') out.verbose = true;
  }

  return out;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  logTime('Starting StarRupture build');

  const srData = args.input;
  if (!fs.existsSync(srData)) {
    logWarn(`StarRupture data directory not found at ${srData}`);
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
    .filter((r): r is CrInfo => r != null);

  // --- Items ---
  logTime('Scanning Items');
  const itemMap = buildItemMap(srData);

  // Map recipe IO to item ids and filter invalid recipes
  const mappedRecipes = crParsed.map((crRaw) => {
    // Map output
    if (!crRaw.output) {
      logWarn(`Recipe ${crRaw.id} has no output; skipping as fatal`);
      return null;
    }

    const outItemPath = crRaw.output.itemObjectPath;
    const outItemKey = outItemPath?.startsWith('/Game/') ? outItemPath : (outItemPath?.replace(/^BlueprintGeneratedClass\'|\'$/g, '') ?? outItemPath);
    const outItem = itemMap[outItemKey] ?? itemMap[outItemKey.toLowerCase()];
    if (!outItem) {
      logWarn(`Unable to resolve output item for recipe ${crRaw.id}: ${outItemPath}`);
      return null;
    }

    const inputs: Record<string, number> = {};
    for (const inp of crRaw.inputs) {
      const ik = inp.itemObjectPath?.startsWith('/Game/') ? inp.itemObjectPath : (inp.itemObjectPath?.replace(/^BlueprintGeneratedClass\'|\'$/g, '') ?? inp.itemObjectPath);
      const ii = itemMap[ik] ?? itemMap[ik.toLowerCase()];
      if (!ii) {
        logWarn(`Unable to resolve input item for recipe ${crRaw.id}: ${inp.itemObjectPath}`);
        // still include with original path key so it can be examined
        inputs[inp.itemObjectPath ?? 'unknown'] = inp.count;
      } else {
        inputs[ii.id] = inp.count;
      }
    }

    const out: Record<string, number> = {};
    out[outItem.id] = crRaw.output.count;

    return {
      id: crRaw.id,
      name: crRaw.name,
      time: crRaw.buildTime ?? 999,
      in: inputs,
      out: out,
      sourcePath: crRaw.path,
    };
  }).filter((x) => x != null);

  // --- Icons: select from included buildings and recipes ---
  logTime('Selecting icons for included buildings and recipes');
  // Determine which CRCs/CRs are referenced by our filtered DA files
  const includedCrcIds = new Set<string>();
  for (const parsedEntry of parsed) {
    const cp = parsedEntry.da.craftingRecipeCollectionPath;
    if (cp) {
      const parts = cp.split('/');
      const crcId = parts[parts.length - 1];
      includedCrcIds.add(crcId);
    }
  }

  // Gather objectPaths for included CRs
  const includedCrObjectPaths = new Set<string>();
  for (const crc of crcParsed) {
    if (includedCrcIds.has(crc.id)) {
      for (const rp of crc.recipes) includedCrObjectPaths.add(rp);
    }
  }

  const includedCrParsed = crParsed.filter((r) => includedCrObjectPaths.has(r.objectPath));

  // Items referenced by included recipes
  const includedItemIds = new Set<string>();
  for (const includedCr of includedCrParsed) {
    if (includedCr.output) {
      const outKey = includedCr.output.itemObjectPath ?? '';
      const outItem = itemMap[outKey] ?? itemMap[outKey.toLowerCase()];
      if (outItem) includedItemIds.add(outItem.id);
    }
    for (const inp of includedCr.inputs) {
      const inKey = inp.itemObjectPath ?? '';
      const inItem = itemMap[inKey] ?? itemMap[inKey.toLowerCase()];
      if (inItem) includedItemIds.add(inItem.id);
    }
  }

  // Buildings' icons (use same slugging as building ids so machine items match icon ids)
  const buildingIconEntries: IconEntry[] = [];
  // Index UI icons so we can resolve base icon files and generate variant overlays
  const uiIndex = indexUiIcons(srData);

  for (const parsedEntry of parsed) {
    if (parsedEntry.bd && parsedEntry.bd.iconObjectPath) {
      const rawId = (parsedEntry.bd.uniqueName ?? parsedEntry.bd.id ?? parsedEntry.da.id ?? '').replace(/^DA_/, '');
      const bSlug = rawId.replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase()).replace(/^-/, '');

      // Try to resolve base icon path from BD objectPath
      let basePath: string | undefined;
      try {
        const parts = parsedEntry.bd.iconObjectPath.replace('/Game/Chimera/UI/', '').split('/');
        const basename = parts.pop() ?? '';
        basePath = uiIndex[basename.toLowerCase()] ?? uiIndex[bSlug];
      } catch (e) {
        basePath = undefined;
      }

      if (PURITY_BUILDINGS.includes(bSlug) && basePath && fs.existsSync(basePath)) {
        try {
          const variantEntries = await generatePurityVariants(basePath, bSlug);
          for (const ve of variantEntries) buildingIconEntries.push(ve);
          continue;
        } catch (e) {
          logWarn(`Failed to generate overlay icons for ${bSlug}: ${(e as Error).message}`);
        }
      }

      // Fallback to default icon entry
      buildingIconEntries.push({ id: bSlug, objectPath: parsedEntry.bd.iconObjectPath });
    }
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
  logTime(`Packed ${iconsMeta.length} icons into ${iconsOutPath}`);

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

  for (const parsedEntry of parsed) {
    const cp = parsedEntry.da.craftingRecipeCollectionPath;
    if (!cp) continue;
    const crcId = cp.split('/').pop() ?? '';
    const bSlug = slugify((parsedEntry.bd?.uniqueName ?? parsedEntry.bd?.id ?? parsedEntry.da.id ?? ''));
    if (!crcToBuildings[crcId]) crcToBuildings[crcId] = [];
    crcToBuildings[crcId].push(bSlug);

    // determine building category from BD (UISubType or UIType normalized into uiSubType by parser)
    const catRaw = parsedEntry.bd?.uiSubType ?? null;
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
  for (const crInfo of includedCrInfos) {
    if (crInfo.output) {
      const outItem = itemMap[crInfo.output.itemObjectPath ?? ''] ?? itemMap[(crInfo.output.itemObjectPath ?? '').toLowerCase()];
      if (outItem) includedItemIdsFinal.add(outItem.id);
    }
    for (const inp of crInfo.inputs) {
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

  // Add building entries for filtered buildings. For logistics lines (drone rails) emit a 'belt' subobject; otherwise emit 'machine'.
  for (const parsedEntry of parsed) {
    const bId = (parsedEntry.bd?.uniqueName ?? parsedEntry.bd?.id ?? parsedEntry.da.id ?? '').replace(/^DA_/, '');
    if (!bId) continue;
    const bSlug = bId.replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase()).replace(/^-/, '');
    // avoid duplicates
    if (itemsArr.find((x) => x.id === bSlug)) continue;

    const iconEntry = iconsMeta.find((ic) => ic.id === bSlug);
    const categoryForBuilding = buildingSlugToCategory[bSlug] ?? 'other';

    // If DA contains logisticsLine trait (even if MoveSpeed is missing), treat as a belt/rail
    if (parsedEntry.da.logisticsMoveSpeed !== undefined) {
      // Use default MoveSpeed = 200 when not explicitly present
      const baseMove = parsedEntry.da.logisticsMoveSpeed ?? 200;
      // Transform from internal value to units per second
      const speed = Number((baseMove / 100).toFixed(6));
      itemsArr.push(makeBeltEntry(parsedEntry, bSlug, parsedEntry.bd?.name ?? parsedEntry.da.id, speed, categoryForBuilding, iconEntry?.id ?? bSlug));
      continue;
    }

    // Fallback: standard machine entry

    // Variant-enabled buildings: create Impure, Normal (default), and Pure variants
    if (PURITY_BUILDINGS.includes(bSlug)) {
      const iconBase = iconEntry?.id ?? bSlug;
      itemsArr.push(makeMachineEntry(parsedEntry, bSlug, `${parsedEntry.bd?.name ?? parsedEntry.da.id} (Normal)`, 1, categoryForBuilding, bSlug));
      itemsArr.push(makeMachineEntry(parsedEntry, `${bSlug}-impure`, `${parsedEntry.bd?.name ?? parsedEntry.da.id} (Impure)`, 0.5, categoryForBuilding, `${bSlug}-impure`));
      itemsArr.push(makeMachineEntry(parsedEntry, `${bSlug}-pure`, `${parsedEntry.bd?.name ?? parsedEntry.da.id} (Pure)`, 2, categoryForBuilding, `${bSlug}-pure`));
      continue;
    }

    itemsArr.push(makeMachineEntry(parsedEntry, bSlug, parsedEntry.bd?.name ?? parsedEntry.da.id, 1, categoryForBuilding, iconEntry?.id ?? bSlug));
  }

  // Build recipes array
  const recipesArr: any[] = [];
  for (const crInfo of includedCrInfos) {
    if (!crInfo.output) {
      logWarn(`Skipping recipe ${crInfo.id} because it has no output`);
      continue;
    }

    const outItem = itemMap[crInfo.output.itemObjectPath ?? ''] ?? itemMap[(crInfo.output.itemObjectPath ?? '').toLowerCase()];
    if (!outItem) {
      logWarn(`Skipping recipe ${crInfo.id} because output item couldn't be resolved: ${crInfo.output.itemObjectPath}`);
      continue;
    }

    const inMap: Record<string, number> = {};
    for (const inp of crInfo.inputs) {
      const ii = itemMap[inp.itemObjectPath ?? ''] ?? itemMap[(inp.itemObjectPath ?? '').toLowerCase()];
      if (ii) inMap[ii.id] = (inMap[ii.id] ?? 0) + inp.count;
      else inMap[inp.itemObjectPath ?? 'unknown'] = (inMap[inp.itemObjectPath ?? 'unknown'] ?? 0) + inp.count;
    }

    const outMap: Record<string, number> = {};
    outMap[outItem.id] = crInfo.output.count;

    // producers: find CRC id that contains this CR
    const crcForThis = crcParsed.find((crc) => crc.recipes.includes(crInfo.objectPath));
    let producers = crcForThis ? (crcToBuildings[crcForThis.id] ?? []) : [];

    // Expand any producer references that match buildings listed in PURITY_BUILDINGS.
    if (producers.length > 0) {
      const itemsPresent = new Set(itemsArr.map((it) => it.id));
      producers = expandProducersForPurity(producers, new Set(PURITY_BUILDINGS), itemsPresent);
    }

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

    const recipeIdBase = crInfo.id.replace(/^CR_/, '').toLowerCase();
    const recipeId = recipeIdBase; // keep simple; collisions unlikely for filtered set

    recipesArr.push({
      id: recipeId,
      name: crInfo.name ?? crInfo.id,
      producers: producers,
      time: crInfo.buildTime ?? 999,
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
    version: { StarRupture: '0.1.1.112941' },
    categories: categoriesArr.length > 0 ? categoriesArr : [{ id: 'raw', name: 'Raw', icon: 'raw-titanium' }],
    icons: iconsArr,
    items: itemsArr,
    recipes: recipesArr,
    defaults: { minBelt: 'drone-rail-t1', maxBelt: 'drone-rail-t5', excludedRecipes: [] },
  };

  const dataOutPath = path.join(args.output, 'data.json');
  if (!args.dryRun) {
    if (!fs.existsSync(args.output)) fs.mkdirSync(args.output, { recursive: true });
    fs.writeFileSync(dataOutPath, JSON.stringify(outData, null, 2));
  }
  logTime(`Wrote data.json to ${dataOutPath}`);

  // --- Hash file ---
  // Create a compact hash.json containing sorted lists of all relevant IDs in the generated data
  const itemIds = outData.items.map((i: any) => i.id);
  const machineIds = outData.items.filter((i: any) => i.machine).map((i: any) => i.id);
  const recipeIds = outData.recipes.map((r: any) => r.id);
  const beaconIds = outData.items.filter((i: any) => i.beacon).map((i: any) => i.id);
  const beltIds = outData.items.filter((i: any) => i.belt || i.pipe).map((i: any) => i.id);
  const fuelIds = outData.items.filter((i: any) => i.fuel).map((i: any) => i.id);
  const moduleIds = outData.items.filter((i: any) => i.module).map((i: any) => i.id);
  const wagonIds = outData.items.filter((i: any) => i.cargoWagon || i.fluidWagon).map((i: any) => i.id);

  function uniqSort(arr: string[]) {
    return Array.from(new Set(arr)).sort();
  }

  const hashObj = {
    items: uniqSort(itemIds),
    machines: uniqSort(machineIds),
    recipes: uniqSort(recipeIds),
    beacons: uniqSort(beaconIds),
    belts: uniqSort(beltIds),
    fuels: uniqSort(fuelIds),
    modules: uniqSort(moduleIds),
    wagons: uniqSort(wagonIds),
  };

  const hashOutPath = path.join(args.output, 'hash.json');
  if (!args.dryRun) {
    fs.writeFileSync(hashOutPath, JSON.stringify(hashObj, null, 2));
  }
  logTime(`Wrote hash.json to ${hashOutPath}`);

  // --- Defaults File ---
  // Write the `defaults` portion of data.json into a separate defaults.json file
  const defaultsOutPath = path.join(args.output, 'defaults.json');
  if (!args.dryRun) {
    fs.writeFileSync(defaultsOutPath, JSON.stringify(outData.defaults, null, 2));
  }
  logTime(`Wrote defaults.json to ${defaultsOutPath}`);

  logTime('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
