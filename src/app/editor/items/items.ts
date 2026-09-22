import { Dialog } from '@angular/cdk/dialog';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CdkMenuModule } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faEllipsis,
  faExclamationTriangle,
  faGrip,
  faPencil,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Select } from '~/components/select/select';
import { ItemJson } from '~/data/schema/item';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorTab } from '../editor-tab';
import { emptyItem, toOptions } from '../object-utils';
import { ItemDialog, ItemDialogData } from './item-dialog/item-dialog';

@Component({
  selector: 'lab-items',
  imports: [
    FormsModule,
    CdkMenuModule,
    DragDropModule,
    FaIconComponent,
    Button,
    Select,
    TranslatePipe,
  ],
  templateUrl: './items.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grow' },
})
export class Items extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);

  protected readonly faEllipsis = faEllipsis;
  protected readonly faGrip = faGrip;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected model = emptyItem();

  protected readonly categoryOptions = computed(() => {
    const { data, icons } = this.edit();
    return toOptions(data.categories, icons, true);
  });

  editItem(item: ItemJson, index?: number): void {
    item = JSON.parse(JSON.stringify(item)) as ItemJson;
    this.dialog
      .open<
        ItemJson | undefined,
        ItemDialogData,
        ItemDialog
      >(ItemDialog, { data: { item, edit: this.edit(), header: item.name } })
      .closed.subscribe((result) => {
        if (result) {
          if (index == null) this.model = result;
          else this.edit().data.items[index] = result;
        }
        this.cd.detectChanges();
      });
  }

  add(): void {
    this.edit().data.items.push(this.model);
    this.model = emptyItem();
  }

  drop(event: CdkDragDrop<unknown>): void {
    moveItemInArray(
      this.edit().data.items,
      event.previousIndex,
      event.currentIndex,
    );
  }

  changeId(item: ItemJson, id: string): void {
    const { data } = this.edit();
    for (const i of data.items) {
      if (i.machine) {
        if (i.machine.fuel === item.id) i.machine.fuel = id;
        if (i.machine.consumption?.[item.id]) {
          i.machine.consumption[id] = i.machine.consumption[item.id];
          delete i.machine.consumption[item.id];
        }
      }

      if (i.module?.proliferator === item.id) i.module.proliferator = id;
      if (i.fuel?.result === item.id) i.fuel.result = id;
      this.replaceId(i.technology?.prerequisites, item.id, id);
    }

    for (const r of data.recipes) {
      this.replaceId(r.producers, item.id, id);

      if (r.in[item.id]) {
        r.in[id] = r.in[item.id];
        delete r.in[item.id];
      }

      if (r.out[item.id]) {
        r.out[id] = r.out[item.id];
        delete r.out[item.id];
      }

      if (r.catalyst?.[item.id]) {
        r.catalyst[id] = r.catalyst[item.id];
        delete r.catalyst[item.id];
      }

      if (r.part === item.id) r.part = id;
    }

    if (data.defaults) {
      if (data.defaults.beacon === item.id) data.defaults.beacon = id;
      if (data.defaults.beaconModule === item.id)
        data.defaults.beaconModule = id;

      this.replaceId(data.defaults?.wagonRank, item.id, id);
      this.replaceId(data.defaults?.fuelRank, item.id, id);
      this.replaceId(data.defaults?.moduleRank, item.id, id);
      this.replaceId(data.defaults?.researchedTechnologies, item.id, id);

      if ('presets' in data.defaults) {
        for (const preset of data.defaults.presets) {
          if (preset.beacon === item.id) preset.beacon = id;
          if (preset.beaconModule === item.id) preset.beaconModule = id;
          this.replaceId(preset.beltRank, item.id, id);
          this.replaceId(preset.wagonRank, item.id, id);
          this.replaceId(preset.fuelRank, item.id, id);
          this.replaceId(preset.machineRank, item.id, id);
          this.replaceId(preset.moduleRank, item.id, id);
          this.replaceId(preset.researchedTechnologies, item.id, id);
        }
      } else {
        this.replaceId(data.defaults.minBeltRank, item.id, id);
        this.replaceId(data.defaults.maxBeltRank, item.id, id);
        this.replaceId(data.defaults.minMachineRank, item.id, id);
        this.replaceId(data.defaults.maxMachineRank, item.id, id);
      }
    }

    item.id = id;
  }

  private replaceId(
    collection: string[] | undefined,
    oldId: string,
    newId: string,
  ): void {
    if (!collection?.length) return;
    const index = collection.indexOf(oldId);
    if (index >= 0) collection[index] = newId;
  }

  clone(item: ItemJson, index: number): void {
    item = JSON.parse(JSON.stringify(item)) as ItemJson;
    this.edit().data.items.splice(index + 1, 0, item);
  }

  remove(id: string): void {
    const { data } = this.edit();
    this.confirm
      .open({
        header: 'Delete item?',
        message:
          'If this item is in use, deleting it will invalidate some entities. Continue?',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faCheck },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1) {
          data.items = data.items.filter((c) => c.id !== id);
          this.cd.detectChanges();
        }
      });
  }
}
