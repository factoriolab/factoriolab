import fs from 'fs';

import { getJsonData } from './utils/file';

const i18nPath = 'public/i18n';

fs.readdirSync(i18nPath).forEach((file) => {
  const path = `${i18nPath}/${file}`;
  const data = getJsonData(path) as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  const stack: [Record<string, unknown>, Record<string, unknown>][] = [
    [data, result],
  ];

  while (stack.length) {
    const next = stack.pop();
    if (next == null) break;
    const [original, clone] = [...next];

    Object.keys(original)
      .sort()
      .forEach((key) => {
        const value = original[key];
        if (value && typeof value === 'object') {
          const child = {};
          clone[key] = child;
          stack.push([value as Record<string, unknown>, child]);
        } else clone[key] = value;
      });
  }

  fs.writeFileSync(path, JSON.stringify(result, null, 2));
});
