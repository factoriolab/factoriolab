import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

import { CollectionTableComponent } from '~/components/collection-table/collection-table.component';
import { coalesce, updateSetIds } from '~/helpers';
import { Category } from '~/models/data/category';
import { Item } from '~/models/data/item';
import { Game } from '~/models/enum/game';
import { ItemId } from '~/models/enum/item-id';
import { ItemSettings } from '~/models/settings/item-settings';
import { MachineSettings } from '~/models/settings/machine-settings';
import { BonusPercentPipe } from '~/pipes/bonus-percent.pipe';
import { IconClassPipe, IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { RoundPipe } from '~/pipes/round.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { UsagePipe } from '~/pipes/usage.pipe';
import { resetItem } from '~/store/items/items.actions';
import { itemsState, selectItemsState } from '~/store/items/items.selectors';
import { resetMachine } from '~/store/machines/machines.actions';
import {
  machinesState,
  selectMachinesState,
} from '~/store/machines/machines.selectors';
import {
  setCheckedItems,
  setExcludedItems,
} from '~/store/settings/settings.actions';
import { selectSettings } from '~/store/settings/settings.selectors';

import { DetailComponent } from '../../models/detail.component';

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
  itemsStateRaw = this.store.selectSignal(itemsState);
  itemsState = this.store.selectSignal(selectItemsState);
  machinesStateRaw = this.store.selectSignal(machinesState);
  machinesState = this.store.selectSignal(selectMachinesState);
  settings = this.store.selectSignal(selectSettings);

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
    () => this.machinesState()[this.id()],
  );

  Game = Game;
  ItemId = ItemId;

  changeExcluded(value: boolean): void {
    this.setExcludedItems(
      updateSetIds(this.id(), value, this.settings().excludedItemIds),
    );
  }

  changeChecked(value: boolean): void {
    this.setCheckedItems(
      updateSetIds(this.id(), value, this.settings().checkedItemIds),
    );
  }

  /** Action dispatch methods */
  setExcludedItems(excludedItemIds: Set<string>): void {
    this.store.dispatch(setExcludedItems({ excludedItemIds }));
  }

  setCheckedItems(checkedItemIds: Set<string>): void {
    this.store.dispatch(setCheckedItems({ checkedItemIds }));
  }

  resetItem(id: string): void {
    this.store.dispatch(resetItem({ id }));
  }

  resetMachine(id: string): void {
    this.store.dispatch(resetMachine({ id }));
  }
}
