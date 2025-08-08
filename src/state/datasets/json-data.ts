import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';

export interface JsonData {
  data?: ModData;
  hash?: ModHash;
  i18n?: Record<string, ModI18n>;
}
