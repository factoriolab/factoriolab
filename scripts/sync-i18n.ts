import fs from 'fs';

import { getJsonData } from './utils/file';

const i18nPath = 'public/i18n';

function getI18nData(file: string): Record<string, unknown> {
  const path = `${i18nPath}/${file}`;
  return getJsonData(path) as Record<string, unknown>;
}

function setI18nData(file: string, result: Record<string, unknown>): void {
  const path = `${i18nPath}/${file}`;
  fs.writeFileSync(path, JSON.stringify(result, null, 2));
}

const en = getI18nData('en.json');
const i18nPaths = fs.readdirSync(i18nPath).filter((file) => file !== 'en.json');
const i18n = i18nPaths.map(getI18nData);

interface StackItem {
  en: Record<string, unknown>;
  en2: Record<string, unknown>;
  i18n: Record<string, unknown>[];
  i18n2: Record<string, unknown>[];
}

const en2: Record<string, unknown> = {};
const i18n2: Record<string, unknown>[] = i18n.map(() => ({}));
const stack: StackItem[] = [{ en, en2, i18n, i18n2 }];

while (stack.length) {
  const item = stack.pop();
  if (item == null) break;

  Object.keys(item.en)
    .sort()
    .forEach((key) => {
      const value = item.en[key];
      if (typeof value === 'object') {
        const en2 = {};
        const i18n2 = item.i18n2.map(() => ({}));
        item.en2[key] = en2;
        item.i18n2.forEach((i18n, i) => (i18n[key] = i18n2[i]));

        stack.push({
          en: value as Record<string, unknown>,
          en2: en2,
          i18n: item.i18n.map(
            (i18n) => (i18n[key] as Record<string, unknown>) ?? {},
          ),
          i18n2,
        });
      } else {
        item.en2[key] = value;
        item.i18n2.forEach((i18n2, i) => {
          i18n2[key] = item.i18n[i][key] ?? value;
        });
      }
    });
}

setI18nData('en.json', en2);
i18n2.forEach((result, i) => {
  setI18nData(i18nPaths[i], result);
});
