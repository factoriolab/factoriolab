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
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faEllipsis,
  faExclamationTriangle,
  faGrip,
  faPlus,
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
    CdkMenuModule,
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

  protected readonly faEllipsis = faEllipsis;
  protected readonly faGrip = faGrip;
  protected readonly faPlus = faPlus;
  protected model = emptyBase();

  add(): void {
    this.edit().data.categories.push(this.model);
    this.model = emptyBase();
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

  clone(category: CategoryJson, index: number): void {
    category = JSON.parse(JSON.stringify(category)) as CategoryJson;
    this.edit().data.categories.splice(index + 1, 0, category);
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
