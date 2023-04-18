import { Route } from '@angular/router';

import { Dataset, IdType } from '~/models';

export interface Collection {
  label: string;
  type: IdType;
  ids: keyof Dataset;
  entities: keyof Dataset;
}

export type DataRoute = Route & { data?: Collection };
