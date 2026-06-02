import modJson11 from '/public/data/1.1/data.json';
import modJson from '/public/data/2.0/data.json';
import hashJson from '/public/data/2.0/hash.json';
import i18nJson from '/public/data/2.0/i18n/zh.json';
import langJson from '/public/i18n/en.json';
import { datasets } from '~/data/datasets';
import { HardCodedPresetsJson } from '~/data/schema/defaults';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { ModI18n } from '~/data/schema/mod-i18n';
import { LangData } from '~/translate/translate';

import { RecipeId } from '../recipe-id';

export const mockModId = '2.0';
export const mockModInfo = datasets.mods.find((m) => m.id === mockModId)!;
export const mockModData = modJson as unknown as ModData;
mockModData.defaults!.excludedRecipes = [RecipeId.NuclearFuelReprocessing];
export const mockModData11 = modJson11 as unknown as ModData;
export const mockDefaults11 = mockModData11.defaults as HardCodedPresetsJson;
export const mockModHash: ModHash = hashJson;
export const mockModI18n: ModI18n = i18nJson;
export const mockLangData: LangData = langJson;
