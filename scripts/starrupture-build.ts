import fs from 'fs';
import path from 'path';

import { getJsonData } from './helpers/file.helpers';
import { logTime, logWarn } from './helpers/log.helpers';
import { listDaFiles, parseDaFile } from './starrupture/buildings';
import { parseBdFile } from './starrupture/buildingData';

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

  if (!args.dryRun) {
    logTime('(No further steps implemented yet)');
  }

  logTime('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
