import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  TrackByFunction,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faExclamationTriangle,
  faGrip,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { ItemJson } from '~/data/schema/item';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Select } from '../components/select/select';
import { EditorTab } from '../editor-tab';

@Component({
  selector: 'lab-items',
  imports: [
    FormsModule,
    DragDropModule,
    ScrollingModule,
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

  protected readonly categoryOptions = computed(() => {
    const { data, icons } = this.edit();
    return data.categories
      .map(
        (c): Option => ({
          label: c.name,
          value: c.id,
          icon: icons[c.icon ?? c.id]?.url,
        }),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  protected readonly faGrip = faGrip;
  protected readonly model: ItemJson = {
    id: '',
    name: '',
    icon: undefined,
    iconText: undefined,
    category: '',
    row: 0,
  };
  protected readonly trackByFn: TrackByFunction<ItemJson> = (
    _,
    item: ItemJson,
  ): string => item.id;

  add(): void {
    this.edit().data.items.push({
      id: this.model.id,
      name: this.model.name,
      icon: this.model.icon || undefined,
      iconText: this.model.iconText || undefined,
      category: this.model.category,
      row: this.model.row,
      stack: this.model.stack ?? undefined,
      rocketCapacity: this.model.rocketCapacity ?? undefined,
    });
  }

  drop(event: CdkDragDrop<unknown>): void {
    const items = [...this.edit().data.items];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.edit().data.items = items;
  }

  changeId(item: ItemJson, id: string): void {
    // TODO switch usages in recipes?
    // const { data } = this.edit();
    // [...data.items, ...data.recipes]
    //   .filter((e) => e.category === category.id)
    //   .forEach((e) => (e.category = id));
    item.id = id;
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
          data.categories = data.categories.filter((c) => c.id !== id);
          this.cd.detectChanges();
        }
      });
  }
}
