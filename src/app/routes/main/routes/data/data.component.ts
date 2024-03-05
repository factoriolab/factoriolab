import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  store = inject(Store<LabState>);
  dataRouteSvc = inject(DataRouteService);

  vm$ = combineLatest([
    this.dataRouteSvc.home$,
    this.store.select(Settings.getDataset),
  ]).pipe(map(([home, data]) => ({ home, data })));

  collections: MenuItem[] = [
    {
      label: 'data.categories',
      routerLink: 'categories',
      id: 'categoryIds',
    },
    {
      label: 'data.items',
      routerLink: 'items',
      id: 'itemIds',
    },
    {
      label: 'data.beacons',
      routerLink: 'beacons',
      id: 'beaconIds',
    },
    {
      label: 'data.belts',
      routerLink: 'belts',
      id: 'beltIds',
    },
    {
      label: 'data.cargoWagons',
      routerLink: 'cargo-wagons',
      id: 'cargoWagonIds',
    },
    {
      label: 'data.fluidWagons',
      routerLink: 'fluid-wagons',
      id: 'fluidWagonIds',
    },
    {
      label: 'data.fuels',
      routerLink: 'fuels',
      id: 'fuelIds',
    },
    {
      label: 'data.machines',
      routerLink: 'machines',
      id: 'machineIds',
    },
    {
      label: 'data.modules',
      routerLink: 'modules',
      id: 'moduleIds',
    },
    {
      label: 'data.pipes',
      routerLink: 'pipes',
      id: 'pipeIds',
    },
    {
      label: 'data.technologies',
      routerLink: 'technologies',
      id: 'technologyIds',
    },
    {
      label: 'data.recipes',
      routerLink: 'recipes',
      id: 'recipeIds',
    },
  ];
}
