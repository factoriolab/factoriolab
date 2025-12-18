import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRotateLeft, faCheck } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { CollectionTable } from '~/components/collection-table/collection-table';
import { Icon } from '~/components/icon/icon';
import { Item } from '~/data/schema/item';
import { BonusPercentPipe } from '~/rational/bonus-percent-pipe';
import { RoundPipe } from '~/rational/round-pipe';
import { UsagePipe } from '~/rational/usage-pipe';
import { ItemsStore } from '~/state/items/items-store';
import { MachinesStore } from '~/state/machines/machines-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { updateSetIds } from '~/utils/set';

import { Detail } from '../detail/detail';
import { DetailBase } from '../detail-base';

@Component({
  selector: 'lab-item-detail',
  imports: [
    FormsModule,
    KeyValuePipe,
    RouterLink,
    FaIconComponent,
    BonusPercentPipe,
    Button,
    Checkbox,
    Icon,
    RoundPipe,
    TranslatePipe,
    UsagePipe,
    CollectionTable,
    Detail,
  ],
  templateUrl: './item-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetail extends DetailBase<Item> {
  protected readonly itemsStore = inject(ItemsStore);
  protected readonly machinesStore = inject(MachinesStore);

  protected readonly faArrowRotateLeft = faArrowRotateLeft;
  protected readonly settings = this.settingsStore.settings;

  protected readonly obj = computed(
    (): Item | undefined => this.settingsStore.dataset().itemRecord[this.id()],
  );

  protected readonly category = computed(() => {
    const obj = this.obj();
    if (obj == null) return;
    return this.settingsStore.dataset().categoryRecord[obj.category];
  });

  protected readonly itemSettings = computed(
    () => this.itemsStore.settings()[this.id()],
  );

  protected readonly machineSettings = computed(
    () => this.machinesStore.settings()[this.id()],
  );

  protected readonly recipes = computed(() => {
    const id = this.id();
    const data = this.data();
    const producedBy: string[] = [];
    const consumedBy: string[] = [];
    const producible: string[] = [];
    const unlocked = data.technologyRecord[id]?.recipeUnlock;
    for (const r of data.recipeIds) {
      const recipe = data.recipeRecord[r];
      if (recipe.out[id]) producedBy.push(r);
      if (recipe.in[id]) consumedBy.push(r);
      if (recipe.producers.includes(id)) producible.push(r);
    }
    return { producedBy, consumedBy, producible, unlocked };
  });

  protected readonly faCheck = faCheck;

  changeExcluded(value: boolean): void {
    const excludedItemIds = updateSetIds(
      this.id(),
      value,
      this.settings().excludedItemIds,
    );
    this.settingsStore.apply({ excludedItemIds });
  }

  changeChecked(value: boolean): void {
    const checkedItemIds = updateSetIds(
      this.id(),
      value,
      this.settings().checkedItemIds,
    );
    this.settingsStore.apply({ checkedItemIds });
  }
}
