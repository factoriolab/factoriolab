import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { combineLatest, map } from 'rxjs';

import { LabState, Settings } from '~/store';
import { DataRouteService } from './data-route.service';

@Component({
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataComponent {
  vm$ = combineLatest([
    this.dataRouteSvc.home$,
    this.store.select(Settings.getDataset),
  ]).pipe(map(([home, data]) => ({ home, data })));

  collections: MenuItem[] = [
    {
      label: 'data.categories',
      routerLink: 'categories',
    },
    {
      label: 'data.items',
      routerLink: 'items',
    },
    {
      label: 'data.recipes',
      routerLink: 'recipes',
    },
  ];

  constructor(
    private store: Store<LabState>,
    private dataRouteSvc: DataRouteService
  ) {}
}
