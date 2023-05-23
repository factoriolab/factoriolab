import fs from 'fs';

export function getJsonData<T>(file: string, sanitize = false): T {
  let str = fs.readFileSync(file).toString();
  if (sanitize) {
    str = str.replace(/"(.*)":\s?-?inf/g, '"$1": 0');
  }

  return JSON.parse(str) as T;
}
