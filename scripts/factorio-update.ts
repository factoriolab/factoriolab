import { exec, spawn } from 'child_process';
import fs from 'fs';

import { Game } from '~/models/enum/game';

import { data } from '../src/data';
import { logTime } from './helpers/log.helpers';

/**
 * This script is intended to update a specific Factorio mod set or all sets
 */

/** Old Factorio data sets that cannot be updated via this script */
const OLD_FACTORIO_MODS = new Set(['1.0', '017', '016']);
const CURRENT_FACTORIO_MODS = data.mods
  .filter((m) => m.game === Game.Factorio && !OLD_FACTORIO_MODS.has(m.id))
  .map((m) => m.id);

// Load mods from arguments
let mods = process.argv.slice(2);

// Fallback to update all mods
if (mods.length === 0) {
  mods = CURRENT_FACTORIO_MODS;
}

const logsPath = `./scripts/logs`;
const logPath = `${logsPath}/factorio-update.log`;
if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath);
if (fs.existsSync(logPath)) fs.rmSync(logPath);
/** Log command output to separate log file to minimize console output */
function logDebug(msg: string): void {
  fs.appendFileSync(logPath, msg);
}

async function runCommand(
  command: string,
  args?: string[],
): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    proc.stdout.on('data', (data: string) => {
      logDebug(data);
    });
    proc.stderr.on('data', (data: string) => {
      logDebug(data);
    });
    proc.on('error', (code) => {
      reject(code);
    });
    proc.on('exit', (code) => {
      resolve(code);
    });
  });
}

async function runNpmCommand(cmd: string, mod: string): Promise<number | null> {
  return runCommand('npm.cmd', ['run', cmd, mod]);
}

/** Prep for a dump of Factorio using the factorio-prep.ts script */
async function runFactorioPrep(mod: string): Promise<number | null> {
  return runNpmCommand('factorio-prep', mod);
}

/** Start a dump of Factorio using the factorio-dump.bat script */
async function runFactorioDump(): Promise<number | null> {
  const bat = require.resolve('./factorio-dump.bat');
  const result = await runCommand(bat);
  await waitForFactorio(true, 10000);
  await waitForFactorio(false, 30000);
  return result;
}

/** Check whether Factorio is running after a delay */
async function checkIfFactorioIsRunning(delayMs = 1000): Promise<boolean> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      exec('tasklist', (err, stdout, _) => {
        if (err != null) reject(err);
        resolve(stdout.toLowerCase().includes('factorio.exe'));
      });
    }, delayMs);
  });
}

/**
 * Wait for factorio.exe to exit, since the image dump continues to run after
 * the batch script exits.
 */
async function waitForFactorio(
  running: boolean,
  waitMs: number,
): Promise<void> {
  const start = Date.now();
  let result = false;
  let runtime = 0;
  do {
    result = await checkIfFactorioIsRunning();
    runtime = Date.now() - start;
  } while (result !== running && runtime < waitMs);
  logDebug(
    `Waited ${runtime.toString()} for Factorio to ${running ? 'start' : 'exit'}\n`,
  );
}

/** Build a Factorio mod data set using the factorio-build.ts script */
async function runFactorioBuild(mod: string): Promise<number | null> {
  return runNpmCommand('factorio-build', mod);
}

/** Run all scripts required to update a Factorio mod set */
async function updateMod(mod: string): Promise<void> {
  await runFactorioPrep(mod);
  await runFactorioDump();
  await runFactorioBuild(mod);
}

/** Run all scripts required to update an array of Factorio mod sets */
async function updateMods(mods: string[]): Promise<void> {
  for (let i = 0; i < mods.length; i++) {
    const mod = mods[i];
    await updateMod(mod);
    logTime(
      `Updated mod '${mod}' (${(i + 1).toString()} of ${mods.length.toString()})`,
    );
  }
}

logTime(
  `Starting update for ${mods.length.toString()} mod${mods.length > 1 ? 's' : ''}...`,
);

void updateMods(mods);
