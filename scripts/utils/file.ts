import fs from 'fs';

export function getJsonData(file: string): unknown {
  const str = fs.readFileSync(file).toString();
  return JSON.parse(str);
}
