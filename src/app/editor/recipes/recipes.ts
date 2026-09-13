import { Dialog } from '@angular/cdk/dialog';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
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
  faExclamationTriangle,
  faGrip,
  faPencil,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Select } from '~/components/select/select';
import { CategoryJson } from '~/data/schema/category';
import { RecipeJson } from '~/data/schema/recipe';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorTab } from '../editor-tab';
import { emptyRecipe, toOptions } from '../object-utils';
import { RecipeDialog, RecipeDialogData } from './recipe-dialog/recipe-dialog';

@Component({
  selector: 'lab-recipes',
  imports: [
    FormsModule,
    DragDropModule,
    FaIconComponent,
    Button,
    Select,
    TranslatePipe,
  ],
  templateUrl: './recipes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grow' },
})
export class Recipes extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);

  protected readonly faGrip = faGrip;
  protected readonly faPencil = faPencil;
  protected model = emptyRecipe();

  protected readonly categoryOptions = computed(() => {
    const { data, icons } = this.edit();
    return toOptions(data.categories, icons);
  });

  editRecipe(recipe: RecipeJson, index?: number): void {
    recipe = JSON.parse(JSON.stringify(recipe)) as RecipeJson;
    this.dialog
      .open<
        RecipeJson | undefined,
        RecipeDialogData,
        RecipeDialog
      >(RecipeDialog, { data: { recipe, edit: this.edit() } })
      .closed.subscribe((result) => {
        if (result) {
          if (index == null) this.model = result;
          else this.edit().data.recipes[index] = result;
        }
        this.cd.detectChanges();
      });
  }

  add(): void {
    const { data } = this.edit();
    const recipes = [...data.recipes];
    recipes.push(this.model);
    data.recipes = recipes;
    this.model = emptyRecipe();
    this.cd.detectChanges();
  }

  drop(event: CdkDragDrop<unknown>): void {
    moveItemInArray(
      this.edit().data.recipes,
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
        header: 'Delete recipe?',
        message:
          'If this recipe is in use, deleting it will invalidate some entities. Continue?',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faCheck },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1) {
          data.recipes = data.recipes.filter((c) => c.id !== id);
          this.cd.detectChanges();
        }
      });
  }
}
