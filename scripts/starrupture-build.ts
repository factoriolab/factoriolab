import fs from 'fs';
import path from 'path';

import { logTime, logWarn } from './helpers/log.helpers';
import { parseBdFile } from './starrupture/buildingData';
import { listDaFiles, parseDaFile } from './starrupture/buildings';
import {
  computeCargoRate,
  expandProducersForPurity,
  makeBeltEntry,
  makeMachineEntry,
  slugify,
} from './starrupture/helpers';
import {
  generateCargoIcon,
  generatePurityVariants,
  generateRailZoom,
  IconEntry,
  indexUiIcons,
  packIcons,
  type ZoomOptions,
} from './starrupture/icons';
import { buildItemMap } from './starrupture/items';
import {
  CrcInfo,
  CrInfo,
  listCrcFiles,
  parseCrcFile,
  parseCrFile,
} from './starrupture/recipes';

interface CLIArgs {
  input: string;
  output: string;
  dryRun: boolean;
  verbose: boolean;
  buildings: string[] | null; // null means no filter (all buildings)
}

const DEFAULT_BUILDINGS = [
  // Early access
  'DA_AcidExtractor', // Sulfur Extractor
  'DA_GasExtractor', // Helium-3 Extractor
  'DA_MechanicalDrill', // Ore Extractor, tiered by ore quality
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
  'DA_ItemPrinter',

  // Update 1
  'DA_LiquidExtractor', // Oil Extractor
  'DA_LaserDrill',
  'DA_Pressurizer',
  'DA_Forge', // Pyro Forge
  'DA_Factory', // Constructorizer
  'DA_MilitaryAssembler', // Facturer
  'DA_CombustionPowerGenerator', // Chemical generator
  // 'BD_DroneRoundabout', // not useful in the planner
  // 'DA_Recycler', // not useful in the planner

  'DA_SynthetizerTier2', // Compounder Tier 2
  'DA_CrafterTier2', // Fabricator Tier 2
  'DA_FurnaceTier2',
  // 'BD_ExporterTier2', // not useful in the planner
  'DA_FactoryTier2', // Constructorizer Tier 2
];

// Buildings which should have Impure / Normal / Pure variants generated for them.
// Use the generated slug (e.g., 'mechanical-drill' for `DA_MechanicalDrill`).
const PURITY_BUILDINGS: string[] = [
  'mechanical-drill', // Ore Extractor v1
];

// Rail image crop/zoom adjustments
const RAIL_IMAGE_ADJUSTMENTS: Record<string, ZoomOptions> = {
  'drone-rail-t1': { centreOffsetPctX: 0.02 },
  'drone-rail-t2': { centreOffsetPctX: 0.04 },
  'drone-rail-t3': { centreOffsetPctX: 0.02 },
  'drone-rail-t4': { centreOffsetPctX: 0.0 },
  'drone-rail-t5': { centreOffsetPctX: 0.02 },
};

// Additional rail simulation for Cargo Dispatcher/Receiver - tiered based on rail inputs
// Transfer rate is a calculation based on the time the input rail takes to fill the stack plus the delay
// We have to assume the most common stack size of 100, then rail rates are 2/s, 4/s, 8/s, 15/s, 25/s for T1 to T5 respectively
// So simulated rate (items/s) = stack / ((stack / railRate) + delay)
const CARGO_RECEIVERS = {
  'cargo-receiver-t1': { input: 'drone-rail-t1', delay: 10 },
  'cargo-receiver-t2': { input: 'drone-rail-t2', delay: 10 },
  'cargo-receiver-t3': { input: 'drone-rail-t3', delay: 10 },
  'cargo-receiver-t4': { input: 'drone-rail-t4', delay: 10 },
  'cargo-receiver-t5': { input: 'drone-rail-t5', delay: 10 },
};
const CARGO_IMAGE_CROP = {
  source: 'UI/Buildings/Icons/T_PackageSender_Icon.png',
  leftPct: 0.25,
  rightPct: 0.25,
  topPct: 0.2,
  bottomPct: 0,
};

const DEFAULT_BUILD_TIME = 10; // seconds

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  raw: 'titanium-ore',
  extraction: 'mechanical-drill',
  crafting: 'crafter',
  'ore-processing': 'smelter',
  'personal-crafting': 'item-printer',
  parts: 'standard-ammo-item',
};

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
        out.buildings = val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
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
    daFilesFiltered = daFiles.filter((fp) =>
      allowed.has(path.basename(fp, '.json')),
    );
    console.log(
      `Filtered DA files to ${daFilesFiltered.length} entries: ${args.buildings.join(', ')}`,
    );
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
        if (args.verbose)
          logWarn(`BD file not found for ${info.id}: ${bdPath}`);
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

  // Determine which CRC ids are referenced by our filtered DA files (so we only parse CRCs we actually need)
  const includedCrcIds = new Set<string>();
  for (const parsedEntry of parsed) {
    const cp = parsedEntry.da.craftingRecipeCollectionPath;
    if (cp) {
      const parts = cp.split('/');
      const crcId = parts[parts.length - 1];
      includedCrcIds.add(crcId);
    }
  }
  if (includedCrcIds.size > 0)
    console.log(
      `Filtered to ${includedCrcIds.size} CRCs referenced by filtered buildings`,
    );

  // --- Recipes ---
  logTime('Scanning CRC recipe collections');
  const crcFiles = listCrcFiles(srData);
  console.log(`Found ${crcFiles.length} CRC files`);

  // Only parse CRC files that are referenced by our filtered buildings (unless no filter was applied)
  const crcFilesFiltered = crcFiles.filter(
    (p) =>
      includedCrcIds.size === 0 ||
      includedCrcIds.has(path.basename(p, '.json')),
  );
  console.log(
    `Using ${crcFilesFiltered.length} CRC files relevant to filtered buildings`,
  );

  const crcParsed: CrcInfo[] = crcFilesFiltered
    .map((p: string) => {
      try {
        return parseCrcFile(p);
      } catch (err) {
        logWarn(`Failed to parse CRC ${p}: ${(err as Error).message}`);
        return null;
      }
    })
    .filter((c): c is CrcInfo => c != null);

  // Collect unique CR object paths from the selected CRCs and parse each CR once
  const crObjectPathSet = new Set<string>();
  for (const c of crcParsed) {
    for (const rp of c.recipes) crObjectPathSet.add(rp);
  }
  const crObjectPaths = Array.from(crObjectPathSet);
  console.log(
    `Found ${crObjectPaths.length} unique CR object paths referenced by selected CRCs`,
  );

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
  const mappedRecipes = crParsed
    .map((crRaw) => {
      // Map output
      if (!crRaw.output) {
        logWarn(`Recipe ${crRaw.id} has no output; skipping as fatal`);
        return null;
      }

      const outItemPath = crRaw.output.itemObjectPath;
      const outItemKey = outItemPath?.startsWith('/Game/')
        ? outItemPath
        : (outItemPath?.replace(/^BlueprintGeneratedClass\'|\'$/g, '') ??
          outItemPath);
      const outItem = itemMap[outItemKey] ?? itemMap[outItemKey.toLowerCase()];
      if (!outItem) {
        logWarn(
          `Unable to resolve output item for recipe ${crRaw.id}: ${outItemPath}`,
        );
        return null;
      }

      const inputs: Record<string, number> = {};
      for (const inp of crRaw.inputs) {
        const ik = inp.itemObjectPath?.startsWith('/Game/')
          ? inp.itemObjectPath
          : (inp.itemObjectPath?.replace(
              /^BlueprintGeneratedClass\'|\'$/g,
              '',
            ) ?? inp.itemObjectPath);
        const ii = itemMap[ik] ?? itemMap[ik.toLowerCase()];
        if (!ii) {
          logWarn(
            `Unable to resolve input item for recipe ${crRaw.id}: ${inp.itemObjectPath}`,
          );
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
        time: (crRaw.buildTime ?? DEFAULT_BUILD_TIME) || 1, // Don't allow zero build time
        in: inputs,
        out: out,
        sourcePath: crRaw.path,
      };
    })
    .filter((x) => x != null);

  // --- Icons: select from included buildings and recipes ---
  logTime('Selecting icons for included buildings and recipes');
  // `includedCrcIds` was computed earlier (to limit CRC parsing to referenced collections)

  // Gather objectPaths for included CRs
  const includedCrObjectPaths = new Set<string>();
  for (const crc of crcParsed) {
    if (includedCrcIds.has(crc.id)) {
      for (const rp of crc.recipes) includedCrObjectPaths.add(rp);
    }
  }

  const includedCrParsed = crParsed.filter((r) =>
    includedCrObjectPaths.has(r.objectPath),
  );

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
    if (parsedEntry.bd?.iconObjectPath) {
      const rawId = (
        parsedEntry.bd.uniqueName ??
        parsedEntry.bd.id ??
        parsedEntry.da.id ??
        ''
      ).replace(/^DA_/, '');
      const bSlug = rawId
        .replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase())
        .replace(/^-/, '');

      // Try to resolve base icon path from BD objectPath
      let basePath: string | undefined;
      try {
        const parts = parsedEntry.bd.iconObjectPath
          .replace('/Game/Chimera/UI/', '')
          .split('/');
        const basename = parts.pop() ?? '';
        basePath = uiIndex[basename.toLowerCase()] ?? uiIndex[bSlug];
      } catch (e) {
        basePath = undefined;
      }

      if (
        PURITY_BUILDINGS.includes(bSlug) &&
        basePath &&
        fs.existsSync(basePath)
      ) {
        try {
          const variantEntries = await generatePurityVariants(basePath, bSlug);
          for (const ve of variantEntries) buildingIconEntries.push(ve);
          continue;
        } catch (e) {
          logWarn(
            `Failed to generate overlay icons for ${bSlug}: ${(e as Error).message}`,
          );
        }
      }

      // Special handling: rails - generate a zoomed center band to make arrow tiers legible
      if (/rail/i.test(bSlug) && basePath && fs.existsSync(basePath)) {
        const additionalSettings = RAIL_IMAGE_ADJUSTMENTS[bSlug] || {};
        try {
          const railEntry = await generateRailZoom(basePath, bSlug, {
            size: 64,
            capStartPct: 0.1,
            capEndPct: 0.18,
            centreOffsetPctX: 0.02,
            centreSizePctX: 0.27,
            railPctY: 3 / 8,
            rightCapIsFlippedLeft: true,
            // debugOutDir: path.join('temp', 'rails'),
            ...additionalSettings,
          });
          buildingIconEntries.push(railEntry);
          continue;
        } catch (e) {
          logWarn(
            `Failed to generate rail zoom for ${bSlug}: ${(e as Error).message}`,
          );
        }
      }

      // Fallback to default icon entry
      buildingIconEntries.push({
        id: bSlug,
        objectPath: parsedEntry.bd.iconObjectPath,
      });
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

  // --- Cargo icons: generate cropped left-aligned icons with tier labels ---
  const cargoIconEntries: IconEntry[] = [];
  try {
    const cargoKey = path
      .basename(CARGO_IMAGE_CROP.source)
      .replace(/\.[^/.]+$/, '')
      .toLowerCase();
    const cargoBasePath = uiIndex[cargoKey];
    if (cargoBasePath && fs.existsSync(cargoBasePath)) {
      for (const [cid, cfg] of Object.entries(CARGO_RECEIVERS)) {
        const match = /t(\d+)/i.exec(String(cfg.input ?? ''));
        const label = match ? `T${match[1]}` : '';
        try {
          const ce = await generateCargoIcon(
            cargoBasePath,
            cid,
            CARGO_IMAGE_CROP,
            { size: 64, label },
          );
          cargoIconEntries.push(ce);
        } catch (e) {
          logWarn(
            `Failed to generate cargo icon for ${cid}: ${(e as Error).message}`,
          );
        }
      }
    } else {
      logWarn(
        `Cargo icon source not found in UI index: ${CARGO_IMAGE_CROP.source}`,
      );
    }
  } catch (e) {
    logWarn(`Failed to generate cargo icons: ${(e as Error).message}`);
  }

  const iconsToPack = [
    ...buildingIconEntries,
    ...itemIconEntries,
    ...cargoIconEntries,
  ];
  const iconsOutPath = path.join(args.output, 'icons.webp');
  // pack icons (attempt to write sprite if sharp present and not dry-run)
  const iconsMeta = await packIcons(srData, iconsOutPath, iconsToPack, {
    iconSize: 64,
    padding: 0,
    columns: 8,
    dryRun: args.dryRun,
  });
  logTime(`Packed ${iconsMeta.length} icons into ${iconsOutPath}`);

  // --- Generate final data.json using the building filter ---
  logTime('Generating data.json for filtered buildings');

  // Map CRC id -> buildings (slugs)
  const crcToBuildings: Record<string, string[]> = {};
  // Also gather building -> category mapping and category list
  const buildingSlugToCategory: Record<string, string> = {};
  const categoriesMap: Record<
    string,
    { id: string; name: string; icon?: string }
  > = {};

  function tokenToId(token: string): string {
    return token
      .replace(/^ECrBuildingUISubType::|^ECrBuildingUIType::/, '')
      .replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase())
      .replace(/^-/, '');
  }

  function tokenToName(token: string): string {
    const raw = token.replace(
      /^ECrBuildingUISubType::|^ECrBuildingUIType::/,
      '',
    );
    // Split camelcase / underscores
    return raw.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  }

  for (const parsedEntry of parsed) {
    const cp = parsedEntry.da.craftingRecipeCollectionPath;
    if (!cp) continue;
    const crcId = cp.split('/').pop() ?? '';
    const bSlug = slugify(
      parsedEntry.bd?.uniqueName ??
        parsedEntry.bd?.id ??
        parsedEntry.da.id ??
        '',
    );
    if (!crcToBuildings[crcId]) crcToBuildings[crcId] = [];
    crcToBuildings[crcId].push(bSlug);

    // determine building category from BD (UISubType or UIType normalized into uiSubType by parser)
    const catRaw = parsedEntry.bd?.uiSubType ?? null;
    if (catRaw) {
      const catToken = String(catRaw).split('::').pop() ?? String(catRaw);
      const catId = tokenToId(String(catRaw));
      const catName = tokenToName(String(catRaw));
      buildingSlugToCategory[bSlug] = catId;
      if (!categoriesMap[catId])
        categoriesMap[catId] = {
          id: catId,
          name: catName,
          icon: CATEGORY_ICONS[catId] ?? undefined,
        };
    }
  }

  // Included CRs from included CRCs
  const includedCrcIdsList = Array.from(includedCrcIds);
  const includedCrObjectPathsList = Array.from(includedCrObjectPaths);
  const includedCrInfos = crParsed.filter((r) =>
    includedCrObjectPathsList.includes(r.objectPath),
  );

  // Determine included items from these recipes
  const includedItemIdsFinal = new Set<string>();
  for (const crInfo of includedCrInfos) {
    if (crInfo.output) {
      const outItem =
        itemMap[crInfo.output.itemObjectPath ?? ''] ??
        itemMap[(crInfo.output.itemObjectPath ?? '').toLowerCase()];
      if (outItem) includedItemIdsFinal.add(outItem.id);
    }
    for (const inp of crInfo.inputs) {
      const inItem =
        itemMap[inp.itemObjectPath ?? ''] ??
        itemMap[(inp.itemObjectPath ?? '').toLowerCase()];
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
    if (!iconEntry)
      logWarn(
        `No icon found for item ${it.id}; using fallback ${fallbackIconId}`,
      );
    itemsArr.push({
      category:
        it.uiItemType && String(it.uiItemType).includes('Resource')
          ? 'extraction'
          : 'parts',
      id: it.id,
      name: it.name ?? it.fileBasename,
      row: 0,
      stack: it.stack ?? 100,
      icon: iconEntry?.id ?? fallbackIconId,
    });
  }

  // Add building entries for filtered buildings. For logistics lines (drone rails) emit a 'belt' subobject; otherwise emit 'machine'.
  for (const parsedEntry of parsed) {
    const bId = (
      parsedEntry.bd?.uniqueName ??
      parsedEntry.bd?.id ??
      parsedEntry.da.id ??
      ''
    ).replace(/^DA_/, '');
    if (!bId) continue;
    const bSlug = bId
      .replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase())
      .replace(/^-/, '');
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
      itemsArr.push(
        makeBeltEntry(
          parsedEntry,
          bSlug,
          parsedEntry.bd?.name ?? parsedEntry.da.id,
          speed,
          categoryForBuilding,
          iconEntry?.id ?? bSlug,
        ),
      );
      continue;
    }

    // Fallback: standard machine entry

    // Variant-enabled buildings: create Impure, Normal (default), and Pure variants
    if (PURITY_BUILDINGS.includes(bSlug)) {
      const iconBase = iconEntry?.id ?? bSlug;
      itemsArr.push(
        makeMachineEntry(
          parsedEntry,
          bSlug,
          `${parsedEntry.bd?.name ?? parsedEntry.da.id} (Normal)`,
          1,
          categoryForBuilding,
          bSlug,
        ),
      );
      itemsArr.push(
        makeMachineEntry(
          parsedEntry,
          `${bSlug}-impure`,
          `${parsedEntry.bd?.name ?? parsedEntry.da.id} (Impure)`,
          0.5,
          categoryForBuilding,
          `${bSlug}-impure`,
        ),
      );
      itemsArr.push(
        makeMachineEntry(
          parsedEntry,
          `${bSlug}-pure`,
          `${parsedEntry.bd?.name ?? parsedEntry.da.id} (Pure)`,
          2,
          categoryForBuilding,
          `${bSlug}-pure`,
        ),
      );
      continue;
    }

    itemsArr.push(
      makeMachineEntry(
        parsedEntry,
        bSlug,
        parsedEntry.bd?.name ?? parsedEntry.da.id,
        1,
        categoryForBuilding,
        iconEntry?.id ?? bSlug,
      ),
    );
  }

  // Add cargo receivers (fake machines) for each tier
  for (const [cid, cfg] of Object.entries(CARGO_RECEIVERS)) {
    // avoid duplicates
    if (itemsArr.find((x) => x.id === cid)) continue;
    const railRateMap: Record<string, number> = {
      'drone-rail-t1': 2,
      'drone-rail-t2': 4,
      'drone-rail-t3': 8,
      'drone-rail-t4': 15,
      'drone-rail-t5': 25,
    };
    const railRate = railRateMap[cfg.input] ?? 2;
    const rate = computeCargoRate(railRate, (cfg as any).delay ?? 0, 100);
    const iconEntry = iconsMeta.find((ic) => ic.id === cid);
    const iconId = iconEntry?.id ?? 'missing-icon';
    const tierLabelRaw = /t(\d+)/i.exec(String(cfg.input ?? ''))?.[1] ?? '';
    const niceName = `Cargo Receiver${tierLabelRaw ? ' (T' + tierLabelRaw + ')' : ''}`;
    // Represent cargo receivers as belts since they transfer items
    const entry = makeBeltEntry({}, cid, niceName, rate, 'logistics', iconId);
    (entry as any).cargoReceiver = true;
    itemsArr.push(entry);
  }

  // Build recipes array with dedup/merge logic
  const recipesArr: any[] = [];
  const recipeKeyToIndex = new Map<string, number>();
  const usedRecipeIds = new Set<string>();

  function normalizeMapKeys(m: Record<string, number>) {
    return Object.keys(m)
      .sort()
      .reduce<Record<string, number>>((acc: Record<string, number>, k) => {
        acc[k] = m[k];
        return acc;
      }, {});
  }

  for (const crInfo of includedCrInfos) {
    if (!crInfo.output) {
      logWarn(`Skipping recipe ${crInfo.id} because it has no output`);
      continue;
    }

    const outItem =
      itemMap[crInfo.output.itemObjectPath ?? ''] ??
      itemMap[(crInfo.output.itemObjectPath ?? '').toLowerCase()];
    if (!outItem) {
      logWarn(
        `Skipping recipe ${crInfo.id} because output item couldn't be resolved: ${crInfo.output.itemObjectPath}`,
      );
      continue;
    }

    const inMap: Record<string, number> = {};
    for (const inp of crInfo.inputs) {
      const ii =
        itemMap[inp.itemObjectPath ?? ''] ??
        itemMap[(inp.itemObjectPath ?? '').toLowerCase()];
      if (ii) inMap[ii.id] = (inMap[ii.id] ?? 0) + inp.count;
      else
        inMap[inp.itemObjectPath ?? 'unknown'] =
          (inMap[inp.itemObjectPath ?? 'unknown'] ?? 0) + inp.count;
    }

    const outMap: Record<string, number> = {};
    outMap[outItem.id] = crInfo.output.count;

    // producers: find CRC id that contains this CR
    const crcForThis = crcParsed.find((crc) =>
      crc.recipes.includes(crInfo.objectPath),
    );
    let producers = crcForThis ? (crcToBuildings[crcForThis.id] ?? []) : [];

    // Expand any producer references that match buildings listed in PURITY_BUILDINGS.
    if (producers.length > 0) {
      const itemsPresent = new Set(itemsArr.map((it) => it.id));
      producers = expandProducersForPurity(
        producers,
        new Set(PURITY_BUILDINGS),
        itemsPresent,
      );
    }

    // Determine category: prefer producer building category when available
    let recipeCategory =
      outItem.uiItemType && String(outItem.uiItemType).includes('Resource')
        ? 'extraction'
        : 'parts';
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

    const time = (crInfo.buildTime ?? DEFAULT_BUILD_TIME) || 1; // Don't allow zero build time
    const canonicalKey = JSON.stringify({
      in: normalizeMapKeys(inMap),
      out: normalizeMapKeys(outMap),
      time,
    });

    // If an identical recipe already exists, merge producers
    if (recipeKeyToIndex.has(canonicalKey)) {
      const idx = recipeKeyToIndex.get(canonicalKey)!;
      const existing = recipesArr[idx];
      existing.producers = Array.from(
        new Set([...(existing.producers || []), ...producers]),
      );
      // Merge level by taking the minimum (lowest) level among merged recipes
      const existingLevel = existing.row ?? 0;
      const thisLevel = crInfo.level ?? 0;
      existing.row = Math.min(existingLevel, thisLevel);
      continue;
    }

    // Determine a unique recipe id. Base on CR id, and append numeric suffix if collision with different recipe
    const recipeIdBase = crInfo.id.replace(/^CR_/, '').toLowerCase();
    let recipeId = recipeIdBase;
    if (usedRecipeIds.has(recipeId)) {
      let suffix = 2;
      while (usedRecipeIds.has(`${recipeIdBase}-${suffix}`)) suffix++;
      recipeId = `${recipeIdBase}-${suffix}`;
      logWarn(
        `Recipe id collision for ${recipeIdBase}; using unique id ${recipeId}`,
      );
    }

    usedRecipeIds.add(recipeId);
    recipeKeyToIndex.set(canonicalKey, recipesArr.length);

    recipesArr.push({
      id: recipeId,
      name: crInfo.name ?? crInfo.id,
      producers: producers,
      time: time,
      in: inMap,
      out: outMap,
      row: crInfo.level != null ? crInfo.level : 0,
      category: recipeCategory,
    });
  }

  // After building recipes, prefer item rows derived from recipe levels where available
  const minLevelByItem: Record<string, number> = {};
  for (const r of recipesArr) {
    if (!r.out) continue;
    for (const outId of Object.keys(r.out)) {
      const lvl = r.row ?? 0;
      if (minLevelByItem[outId] == null || lvl < minLevelByItem[outId])
        minLevelByItem[outId] = lvl;
    }
  }
  for (const it of itemsArr) {
    if (minLevelByItem[it.id] != null) it.row = minLevelByItem[it.id];
  }

  // Assign item categories from recipes when possible (prefer recipe with lowest row)
  const recipesByRow = [...recipesArr].sort(
    (a, b) => (a.row ?? 0) - (b.row ?? 0),
  );
  for (const r of recipesByRow) {
    if (!r.out) continue;
    for (const outId of Object.keys(r.out)) {
      const item = itemsArr.find((x) => x.id === outId);
      if (!item) continue;
      if (r.category) {
        // Prefer category derived from the earliest recipe (lowest row). Use a marker to avoid overwriting.
        if (!item._categoryAssignedFromRecipe) {
          item.category = r.category;
          item._categoryAssignedFromRecipe = true;
        }
      }
    }
  }
  // Remove internal marker before output
  for (const it of itemsArr) {
    if (it._categoryAssignedFromRecipe) delete it._categoryAssignedFromRecipe;
  }

  // Build icons array: include building icons and item icons used
  const usedIconIdsFinal = new Set<string>();
  for (const p of parsed) {
    if (p.bd?.iconObjectPath) {
      const bslug = (p.bd.uniqueName ?? p.bd.id ?? p.da.id).toLowerCase();
      usedIconIdsFinal.add(
        bslug
          .replace(/([A-Z])/g, (m: string) => '-' + m.toLowerCase())
          .replace(/^-/, ''),
      );
    }
  }
  for (const it of itemsArr) usedIconIdsFinal.add(it.icon);

  const iconsArr = iconsMeta
    .filter((ic) => usedIconIdsFinal.has(ic.id))
    .map((ic) => ({ id: ic.id, position: ic.position, color: ic.color }));

  // Ensure categories referenced by items or recipes are present in categoriesMap
  const initialCategories = Object.values(categoriesMap);
  const usedCategoryIds = new Set<string>(initialCategories.map((c) => c.id));
  for (const it of itemsArr) if (it.category) usedCategoryIds.add(it.category);
  for (const r of recipesArr) if (r.category) usedCategoryIds.add(r.category);

  function categoryIdToName(catId: string): string {
    if (categoriesMap[catId]) return categoriesMap[catId].name;
    // Tokens from BD might be like ECrBuildingUISubType::..., attempt to make a friendlier name
    if (String(catId).includes('ECr')) return tokenToName(String(catId));
    return String(catId)
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
  }

  for (const cid of Array.from(usedCategoryIds)) {
    if (!categoriesMap[cid])
      categoriesMap[cid] = {
        id: cid,
        name: categoryIdToName(cid),
        icon: CATEGORY_ICONS[cid] ?? undefined,
      };
  }

  const categoriesArr = Object.values(categoriesMap);

  const outData = {
    version: { StarRupture: '0.2.1.118629' },
    categories:
      categoriesArr.length > 0
        ? categoriesArr
        : [
            {
              id: 'raw',
              name: 'Raw',
              icon: CATEGORY_ICONS['raw'] ?? 'raw-titanium',
            },
          ],
    icons: iconsArr,
    items: itemsArr,
    recipes: recipesArr,
    defaults: {
      minBelt: 'drone-rail-t1',
      maxBelt: 'drone-rail-t5',
      excludedRecipes: [],
    },
  };

  const dataOutPath = path.join(args.output, 'data.json');
  if (!args.dryRun) {
    if (!fs.existsSync(args.output))
      fs.mkdirSync(args.output, { recursive: true });
    fs.writeFileSync(dataOutPath, JSON.stringify(outData, null, 2));
  }
  logTime(`Wrote data.json to ${dataOutPath}`);

  // --- Hash file ---
  // Create a compact hash.json containing sorted lists of all relevant IDs in the generated data
  const itemIds = outData.items.map((i: any) => i.id);
  const machineIds = outData.items
    .filter((i: any) => i.machine)
    .map((i: any) => i.id);
  const recipeIds = outData.recipes.map((r: any) => r.id);
  const beaconIds = outData.items
    .filter((i: any) => i.beacon)
    .map((i: any) => i.id);
  const beltIds = outData.items
    .filter((i: any) => i.belt || i.pipe)
    .map((i: any) => i.id);
  const fuelIds = outData.items
    .filter((i: any) => i.fuel)
    .map((i: any) => i.id);
  const moduleIds = outData.items
    .filter((i: any) => i.module)
    .map((i: any) => i.id);
  const wagonIds = outData.items
    .filter((i: any) => i.cargoWagon || i.fluidWagon)
    .map((i: any) => i.id);

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
    fs.writeFileSync(
      defaultsOutPath,
      JSON.stringify(outData.defaults, null, 2),
    );
  }
  logTime(`Wrote defaults.json to ${defaultsOutPath}`);

  logTime('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
