import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
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
import { Confirm } from '~/components/confirm/confirm';
import { Category, CategoryJson } from '~/data/schema/category';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Select } from '../components/select/select';
import { EditorTab } from '../editor-tab';

@Component({
  selector: 'lab-categories',
  imports: [
    FormsModule,
    DragDropModule,
    FaIconComponent,
    Button,
    Select,
    TranslatePipe,
  ],
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories extends EditorTab {
  private readonly confirm = inject(Confirm);
  private readonly cd = inject(ChangeDetectorRef);

  protected readonly faGrip = faGrip;
  protected readonly model: Category = {
    id: '',
    name: '',
    icon: undefined,
    iconText: undefined,
  };

  add(): void {
    this.edit().data.categories.push({
      id: this.model.id,
      name: this.model.name,
      icon: this.model.icon || undefined,
      iconText: this.model.iconText || undefined,
    });
  }

  drop(event: CdkDragDrop<unknown>): void {
    moveItemInArray(
      this.edit().data.categories,
      event.previousIndex,
      event.currentIndex,
    );
  }

  changeId(category: CategoryJson, id: string): void {
    const { data } = this.edit();
    [...data.items, ...data.recipes]
      .filter((e) => e.category === category.id)
      .forEach((e) => (e.category = id));
    category.id = id;
  }

  remove(id: string): void {
    const { data } = this.edit();
    if (
      data.items.some((i) => i.category === id) ||
      data.recipes.some((r) => r.category === id)
    ) {
      this.confirm
        .open({
          header: 'Category in use',
          message:
            'This category is in use, and deleting it will orphan some items/recipes. Continue?',
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
    } else {
      data.categories = data.categories.filter((c) => c.id !== id);
    }
  }
}
