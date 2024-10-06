import { Route } from '@angular/router';

import { Dataset } from '~/models/dataset';
import { IdType } from '~/models/enum/id-type';

export interface Collection {
  label: string;
  type: IdType;
  key: keyof Dataset;
}

export interface Detail {
  collectionLabel: string;
}

export type DataRoute = Route & { data?: Collection | Detail };
