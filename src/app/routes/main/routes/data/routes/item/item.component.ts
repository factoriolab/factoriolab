import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { orString } from '~/helpers';
import { Game, ItemId } from '~/models';
import { Items, LabState, Machines, Settings } from '~/store';
import { DataRouteService } from '../../data-route.service';
import { DataSharedModule } from '../../data-shared.module';
import { DetailComponent } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule, DataSharedModule],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent extends DetailComponent {
  store = inject(Store<LabState>);
  dataRouteSvc = inject(DataRouteService);

  vm$ = combineLatest([
    this.id$,
    this.parent$,
    this.dataRouteSvc.home$,
    this.store.select(Items.itemsState),
    this.store.select(Items.getItemsState),
    this.store.select(Machines.machinesState),
    this.store.select(Machines.getMachinesState),
    this.store.select(Settings.getDataset),
  ]).pipe(
    map(
      ([
        id,
        parent,
        home,
        itemsStateRaw,
        itemsState,
        machinesStateRaw,
        machinesState,
        data,
      ]) => ({
        id,
        obj: data.itemEntities[id],
        category:
          data.categoryEntities[orString(data.itemEntities[id]?.category)],
        breadcrumb: [parent, { label: data.itemEntities[id]?.name }],
        producedByRecipeIds: data.recipeIds.filter(
          (r) => data.recipeEntities[r]?.out[id],
        ),
        consumedByRecipeIds: data.recipeIds.filter(
          (r) => data.recipeEntities[r]?.in[id],
        ),
        producibleRecipeIds: data.recipeIds.filter(
          (r) => data.recipeEntities[r]?.producers.indexOf(id) !== -1,
        ),
        unlockedRecipeIds: data.recipeIds.filter(
          (r) => data.recipeEntities[r]?.unlockedBy === id,
        ),
        itemSettingsRaw: itemsStateRaw[id],
        itemSettings: itemsState[id],
        machineSettingsRaw: machinesStateRaw.entities[id],
        machineSettings: machinesState.entities[id],
        home,
        data,
      }),
    ),
  );

  Game = Game;
  ItemId = ItemId;

  /** Action dispatch methods */
  setItemExcluded(id: string, value: boolean): void {
    this.store.dispatch(new Items.SetExcludedAction({ id, value }));
  }

  setItemChecked(id: string, value: boolean): void {
    this.store.dispatch(new Items.SetCheckedAction({ id, value }));
  }

  resetItem(value: string): void {
    this.store.dispatch(new Items.ResetItemAction(value));
  }

  resetMachine(value: string): void {
    this.store.dispatch(new Machines.ResetMachineAction(value));
  }
}
