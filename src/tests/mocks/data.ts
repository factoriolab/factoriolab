import modJson from '/public/data/1.1/data.json';
import hashJson from '/public/data/1.1/hash.json';
import i18nJson from '/public/data/1.1/i18n/zh.json';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { ModI18n } from '~/data/schema/mod-i18n';

import { RecipeId } from '../recipe-id';

export const mockModData = modJson as unknown as ModData;
mockModData.defaults!.excludedRecipes = [RecipeId.NuclearFuelReprocessing];
export const mockModHash: ModHash = hashJson;
export const mockModI18n: ModI18n = i18nJson;
