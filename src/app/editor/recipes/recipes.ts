import { Dialog } from '@angular/cdk/dialog';
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
import { Icon } from '~/components/icon/icon';
import { Select } from '~/components/select/select';
import { CategoryJson } from '~/data/schema/category';
import { RecipeFlag, RecipeJson } from '~/data/schema/recipe';
import { Option } from '~/option/option';
import { OptionPipe } from '~/option/option-pipe';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { QuantitiesButton } from '../components/quantities-button/quantities-button';
import {
  QuantitiesDialog,
  QuantitiesDialogData,
} from '../components/quantities-dialog/quantities-dialog';
import { EditorTab } from '../editor-tab';
import {
  emptyRecipe,
  moduleEffectOptions,
  toNullableNumeric,
  toNumeric,
  toOptions,
} from '../object-utils';

@Component({
  selector: 'lab-recipes',
  imports: [
    FormsModule,
    DragDropModule,
    ScrollingModule,
    FaIconComponent,
    Button,
    Icon,
    OptionPipe,
    Select,
    TranslatePipe,
    QuantitiesButton,
  ],
  templateUrl: './recipes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grow' },
})
export class Recipes extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);

  protected readonly categoryOptions = computed(() => {
    const { data, icons } = this.edit();
    return toOptions(data.categories, icons);
  });
  protected readonly producerOptions = computed(() => {
    const { data, icons } = this.edit();
    return toOptions(
      data.items.filter((i) => i.machine),
      icons,
    );
  });
  protected readonly recipeOptions = computed(() => {
    const { data, icons } = this.edit();
    return toOptions(data.recipes, icons, true);
  });
  protected readonly locationOptions = computed(() => {
    const { data, icons } = this.edit();
    return toOptions(coalesce(data.locations, []), icons);
  });
  protected readonly faGrip = faGrip;
  protected model = emptyRecipe();
  protected readonly moduleEffectOptions = moduleEffectOptions;
  protected readonly recipeFlagOptions: Option<RecipeFlag>[] = [
    { label: 'burn', value: 'burn' },
    { label: 'infinite', value: 'infinite' },
    { label: 'locked', value: 'locked' },
    { label: 'mining', value: 'mining' },
    { label: 'noCostMultiplier', value: 'noCostMultiplier' },
    { label: 'recycling', value: 'recycling' },
    { label: 'showCount', value: 'showCount' },
    { label: 'technology', value: 'technology' },
  ];
  protected readonly toNullableNumeric = toNullableNumeric;
  protected readonly toNumeric = toNumeric;
  protected readonly trackByFn: TrackByFunction<RecipeJson> = (
    _,
    recipe: RecipeJson,
  ): string => recipe.id;

  editIngredients(recipe: RecipeJson): void {
    const { data, icons } = this.edit();
    const options = toOptions(data.items, icons);
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: recipe.in, options, header: 'editor.editIngredients' } })
      .closed.subscribe((record) => {
        if (record) recipe.in = record;
        this.cd.detectChanges();
      });
  }

  editProducts(recipe: RecipeJson): void {
    const { data, icons } = this.edit();
    const options = toOptions(data.items, icons);
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: recipe.out, options, header: 'editor.editProducts' } })
      .closed.subscribe((record) => {
        if (record) recipe.out = record;
        this.cd.detectChanges();
      });
  }

  editCatalysts(recipe: RecipeJson): void {
    const { data, icons } = this.edit();
    const options = toOptions(data.items, icons);
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: coalesce(recipe.catalyst, {}), options, header: 'editor.editCatalysts', optional: true } })
      .closed.subscribe((record) => {
        if (record === null) delete recipe.catalyst;
        else if (record) recipe.catalyst = record;
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
