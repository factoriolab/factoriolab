import { createAction, props } from '@ngrx/store';

import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';

const key = '[Datasets]';
export const loadMod = createAction(
  `${key} Load Mod`,
  props<{
    id: string;
    i18nId: string;
    data: ModData | undefined;
    hash: ModHash | undefined;
    i18n: ModI18n | undefined;
  }>(),
);
