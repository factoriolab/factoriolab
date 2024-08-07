import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

import { CollectionTableComponent } from '~/components';
import { coalesce } from '~/helpers';
import {
  Category,
  Game,
  Item,
  ItemId,
  ItemSettings,
  MachineSettings,
} from '~/models';
import {
  BonusPercentPipe,
  IconClassPipe,
  IconSmClassPipe,
  RoundPipe,
  TranslatePipe,
  UsagePipe,
} from '~/pipes';
import { Items, Machines } from '~/store';
import { DetailComponent } from '../../models';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    KeyValuePipe,
    BreadcrumbModule,
    ButtonModule,
    CheckboxModule,
    BonusPercentPipe,
    CollectionTableComponent,
    IconClassPipe,
    IconSmClassPipe,
    RoundPipe,
    TranslatePipe,
    UsagePipe,
  ],
  templateUrl: './item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent extends DetailComponent {
  itemsStateRaw = this.store.selectSignal(Items.itemsState);
  itemsState = this.store.selectSignal(Items.selectItemsState);
  machinesStateRaw = this.store.selectSignal(Machines.machinesState);
  machinesState = this.store.selectSignal(Machines.selectMachinesState);

  obj = computed<Item | undefined>(() => this.data().itemEntities[this.id()]);
  breadcrumb = computed<MenuItem[]>(() => [
    this.parent() ?? {},
    { label: this.obj()?.name },
  ]);
  category = computed<Category | undefined>(() => {
    const id = this.id();
    const data = this.data();
    return data.categoryEntities[coalesce(data.itemEntities[id]?.category, '')];
  });
  recipes = computed(() => {
    const id = this.id();
    const data = this.data();
    const producedBy: string[] = [];
    const consumedBy: string[] = [];
    const producible: string[] = [];
    const unlocked: string[] = [];

    for (const r of data.recipeIds) {
      const recipe = data.recipeEntities[r];
      if (recipe.out[id]) producedBy.push(r);
      if (recipe.in[id]) consumedBy.push(r);
      if (recipe.producers.includes(id)) producible.push(r);
      if (recipe.unlockedBy === id) unlocked.push(r);
    }

    return { producedBy, consumedBy, producible, unlocked };
  });
  itemSettings = computed<ItemSettings | undefined>(
    () => this.itemsState()[this.id()],
  );
  machineSettings = computed<MachineSettings | undefined>(
    () => this.machinesState().entities[this.id()],
  );

  Game = Game;
  ItemId = ItemId;

  /** Action dispatch methods */
  setItemExcluded(id: string, value: boolean): void {
    this.store.dispatch(Items.setExcluded({ id, value }));
  }

  setItemChecked(id: string, value: boolean): void {
    this.store.dispatch(Items.setChecked({ id, value }));
  }

  resetItem(id: string): void {
    this.store.dispatch(Items.resetItem({ id }));
  }

  resetMachine(id: string): void {
    this.store.dispatch(Machines.resetMachine({ id }));
  }
}
