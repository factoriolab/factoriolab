import { createAction, props } from '@ngrx/store';
import { ModData, ModHash, ModI18n } from 'src/app/models';

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
