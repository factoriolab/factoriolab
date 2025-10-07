import fs from 'fs';

export function getJsonData(file: string): unknown {
  return JSON.parse(fs.readFileSync(file).toString());
}

export function writeJsonData(file: string, data: unknown): void {
  fs.writeFileSync(file, JSON.stringify(data));
}
