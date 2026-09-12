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
import { Select } from '~/components/select/select';
import { CategoryJson } from '~/data/schema/category';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorTab } from '../editor-tab';
import { emptyBase } from '../object-utils';

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
  private readonly cd = inject(ChangeDetectorRef);

  protected readonly faGrip = faGrip;
  protected model = emptyBase();

  add(): void {
    const { data } = this.edit();
    const categories = [...data.categories];
    categories.push(this.model);
    data.categories = categories;
    this.model = emptyBase();
    this.cd.detectChanges();
  }

  drop(event: CdkDragDrop<unknown>): void {
    moveItemInArray(
      this.edit().data.categories,
      event.previousIndex,
      event.currentIndex,
    );
  }

  updateId(category: CategoryJson, id: string): void {
    const { data } = this.edit();
    [...data.items, ...data.recipes]
      .filter((e) => e.category === category.id)
      .forEach((e) => (e.category = id));
    category.id = id;
  }

  remove(id: string): void {
    const { data } = this.edit();
    this.confirm
      .open({
        header: 'Delete category?',
        message:
          'If this category is in use, deleting it will invalidate some entities. Continue?',
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
