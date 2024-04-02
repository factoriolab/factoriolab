import { Route } from '@angular/router';

import { Dataset, IdType } from '~/models';

export interface Collection {
  label: string;
  type: IdType;
  key: keyof Dataset;
}

export interface Detail {
  collectionLabel: string;
}

export type DataRoute = Route & { data?: Collection | Detail };
