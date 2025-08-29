import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { ModI18n } from '~/data/schema/mod-i18n';

export interface JsonData {
  data?: ModData;
  hash?: ModHash;
  i18n?: Record<string, ModI18n>;
}
