#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * Usage:
 *   ts-node translation-script.ts <source.json> <target.json>
 */

////////////////////////////////////////////////////////////////////////////////
// 1. Utility functions: read/write JSON
////////////////////////////////////////////////////////////////////////////////

function readJSON<T = any>(filePath: string): T {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent) as T;
}

function writeJSON(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

////////////////////////////////////////////////////////////////////////////////
// 2. Get all paths (nested keys) in a JSON object
////////////////////////////////////////////////////////////////////////////////

function getAllPaths(obj: any, currentPath: string[] = []): string[][] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    // Base case: if it's a primitive or array, just return this "leaf" path
    return [currentPath];
  }

  let paths: string[][] = [];
  for (const key of Object.keys(obj)) {
    const newPath = [...currentPath, key];
    paths = paths.concat(getAllPaths(obj[key], newPath));
  }
  return paths;
}

////////////////////////////////////////////////////////////////////////////////
// 3. Recursively fill in missing translations
////////////////////////////////////////////////////////////////////////////////

function fillMissingTranslations(source: any, target: any): any {
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    const result: any = {};
    for (const [key, sourceVal] of Object.entries(source)) {
      const targetVal = target ? target[key] : undefined;
      result[key] = fillMissingTranslations(sourceVal, targetVal);
    }
    return result;
  } else {
    // Base case: if target has a value, use it; else "UNTRANSLATED"
    return target !== undefined ? target : 'UNTRANSLATED';
  }
}

////////////////////////////////////////////////////////////////////////////////
// 4. Finding and setting "UNTRANSLATED" paths
////////////////////////////////////////////////////////////////////////////////

function findAllUntranslatedPaths(obj: any, path: string[] = []): string[][] {
  let results: string[][] = [];

  if (obj === 'UNTRANSLATED') {
    results.push(path);
  } else if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      const deeperPath = [...path, key];
      results = results.concat(findAllUntranslatedPaths(obj[key], deeperPath));
    }
  }
  return results;
}

function setValueAtPath(obj: any, path: string[], value: any): void {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[path[path.length - 1]] = value;
}

////////////////////////////////////////////////////////////////////////////////
// 5. Prompt user in console
////////////////////////////////////////////////////////////////////////////////

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

////////////////////////////////////////////////////////////////////////////////
// 6. Extra in target but not in source
////////////////////////////////////////////////////////////////////////////////

function extractNotInSourceObject(
  notInSourcePaths: string[][],
  targetJSON: any,
): any {
  const result: any = {};
  for (const pathArr of notInSourcePaths) {
    const value = getValueAtPath(targetJSON, pathArr);
    setValueAtPath(result, pathArr, value);
  }
  return result;
}

function getValueAtPath(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

////////////////////////////////////////////////////////////////////////////////
// 7. Simple menu handling
////////////////////////////////////////////////////////////////////////////////

enum MenuOption {
  Translate10 = '1',
  ExportExtra = '2',
  Exit = '3',
}

async function showMenuAndGetChoice(): Promise<MenuOption> {
  console.log(`Please choose an option:
  1) Translate next 10 items
  2) Export 'not in source' keys to JSON
  3) Exit
  `);

  const answer = (await askQuestion('Enter 1, 2, or 3: ')).trim() as MenuOption;
  return answer;
}

////////////////////////////////////////////////////////////////////////////////
// 8. Main script logic
////////////////////////////////////////////////////////////////////////////////

async function main() {
  // 1) Parse command line arguments
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      'Usage: ts-node translation-script.ts <source.json> <target.json>',
    );
    process.exit(1);
  }

  const sourceFilePath = path.resolve(args[0]);
  const targetFilePath = path.resolve(args[1]);

  if (!fs.existsSync(sourceFilePath)) {
    console.error(`Source file does not exist: ${sourceFilePath}`);
    process.exit(1);
  }

  const sourceJSON = readJSON<any>(sourceFilePath);
  const targetExists = fs.existsSync(targetFilePath);
  const targetJSON = targetExists ? readJSON<any>(targetFilePath) : {};

  // 2) We look for a temp file: <target>.temp.json
  const tempFilePath = targetFilePath + '.temp.json';
  let merged: any;
  let usedTempFile = false;

  if (fs.existsSync(tempFilePath)) {
    // If temp file exists, let's read from it directly
    console.log(
      `Found existing temp file: ${tempFilePath}\nUsing it to continue where you left off...`,
    );
    merged = readJSON<any>(tempFilePath);
    usedTempFile = true;
    // Optional: You might want to do a quick check that 'merged' contains all source keys,
    // or fill in missing keys from the source if needed.
    // merged = fillMissingTranslations(sourceJSON, merged);
    // writeJSON(tempFilePath, merged);
  } else {
    // No temp file, do the usual merging
    merged = fillMissingTranslations(sourceJSON, targetJSON);
    writeJSON(tempFilePath, merged);
  }

  // 3) Identify paths in source and target
  const sourcePaths = getAllPaths(sourceJSON);
  const targetPaths = getAllPaths(targetJSON);
  const extraInTargetPaths = targetPaths.filter((tp) => {
    return !sourcePaths.some((sp) => sp.join('.') === tp.join('.'));
  });
  const notInSourceCount = extraInTargetPaths.length;

  // 4) Interactive loop
  while (true) {
    // Re-read the merged object every iteration
    merged = readJSON<any>(tempFilePath);
    const untranslatedPaths = findAllUntranslatedPaths(merged);

    const totalSourceKeys = sourcePaths.length;
    const missingTranslation = untranslatedPaths.length;
    const alreadyTranslated = totalSourceKeys - missingTranslation;

    // Show stats
    console.log(`\n--- Translation Status ---`);
    console.log(`Total keys in source:         ${totalSourceKeys}`);
    console.log(`Already translated:           ${alreadyTranslated}`);
    console.log(`Missing translation:          ${missingTranslation}`);
    console.log(`Keys not in source (target):  ${notInSourceCount}`);
    console.log(`----------------------------\n`);

    // If all translated and user is using a temp file, they might want to finalize
    if (missingTranslation === 0) {
      console.log('All source keys are translated!');
    }

    const choice = await showMenuAndGetChoice();
    switch (choice) {
      case MenuOption.Translate10:
        // Translate up to the next 10 items
        if (missingTranslation === 0) {
          console.log('There are no UNTRANSLATED items left.');
          break;
        }

        const next10 = untranslatedPaths.slice(0, 10);
        for (const pathArr of next10) {
          const displayPath = pathArr.join('.');
          console.log(`Key path: "${displayPath}"`);
          const answer = await askQuestion('Please provide a translation: ');
          const translation = answer.trim() || 'UNTRANSLATED';
          setValueAtPath(merged, pathArr, translation);
        }
        writeJSON(tempFilePath, merged);
        break;

      case MenuOption.ExportExtra:
        if (notInSourceCount === 0) {
          console.log('No extra keys found in target. Nothing to export.');
        } else {
          const extraObj = extractNotInSourceObject(
            extraInTargetPaths,
            targetJSON,
          );
          const exportFilePath = targetFilePath + '.notInSource.json';
          writeJSON(exportFilePath, extraObj);
          console.log(
            `Exported ${notInSourceCount} extra key(s) to: ${exportFilePath}`,
          );
        }
        break;

      case MenuOption.Exit:
        if (missingTranslation > 0) {
          const confirm = await askQuestion(
            'There are still untranslated keys. Save partial translations (to the target) and exit? (y/n) ',
          );
          if (confirm.toLowerCase().startsWith('y')) {
            // Rename the temp file to the final target file => partial translations are saved
            fs.renameSync(tempFilePath, targetFilePath);
            console.log(
              `Partial translations saved to ${targetFilePath}. Exiting...`,
            );
            process.exit(0);
          } else {
            // Keep the temp file (so user can continue next time)
            console.log(
              'Not saving partial translations to target. Keeping temp file for next time. Exiting...',
            );
            process.exit(0);
          }
        } else {
          // No missing translations => finalize
          fs.renameSync(tempFilePath, targetFilePath);
          console.log(`\nAll translations done! Final file: ${targetFilePath}`);
          process.exit(0);
        }
        break;

      default:
        console.log('Invalid choice. Please enter 1, 2, or 3.');
        break;
    }
  }
}

// Run
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
