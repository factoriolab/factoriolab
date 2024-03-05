import { Route } from '@angular/router';

import { IdType, RawDataset } from '~/models';

export interface Collection {
  label: string;
  type: IdType;
  ids: keyof RawDataset;
}

export interface Detail {
  collectionLabel: string;
}

export type DataRoute = Route & { data?: Collection | Detail };
