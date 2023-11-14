import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { map } from 'rxjs';

import { filterNullish } from '~/helpers';
import { LabState, Settings } from '~/store';

@Injectable({ providedIn: 'root' })
export class DataRouteService {
  store = inject(Store<LabState>);

  home$ = this.store.select(Settings.getMod).pipe(
    filterNullish(),
    map(
      (mod): MenuItem => ({
        icon: 'fa-solid fa-database',
        routerLink: '/data',
        queryParamsHandling: 'preserve',
        label: mod.name,
      }),
    ),
  );
}
