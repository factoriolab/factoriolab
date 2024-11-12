import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { AdjustedRecipe } from '~/models/data/recipe';
import { rational } from '~/models/rational';
import { BonusPercentPipe } from '~/pipes/bonus-percent.pipe';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { RoundPipe } from '~/pipes/round.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { UsagePipe } from '~/pipes/usage.pipe';
import { RecipeService } from '~/services/recipe.service';
import { RecipesService } from '~/store/recipes.service';
import { SettingsService } from '~/store/settings.service';

type TooltipType =
  | 'item'
  | 'beacon'
  | 'belt'
  | 'cargo-wagon'
  | 'fluid-wagon'
  | 'fuel'
  | 'machine'
  | 'module'
  | 'pipe'
  | 'technology'
  | 'recipe';

@Component({
  selector: 'lab-tooltip',
  standalone: true,
  imports: [
    KeyValuePipe,
    NgTemplateOutlet,
    BonusPercentPipe,
    IconSmClassPipe,
    RoundPipe,
    TranslatePipe,
    UsagePipe,
  ],
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  recipeSvc = inject(RecipeService);
  recipesSvc = inject(RecipesService);
  settingsSvc = inject(SettingsService);

  id = input.required<string>();
  type = input<TooltipType>('item');
  action = input<string>();
  adjustedRecipe = input<AdjustedRecipe>();

  rational = rational;
  dataKey: Record<TooltipType, string> = {
    item: 'items',
    beacon: 'beacons',
    belt: 'belts',
    'cargo-wagon': 'cargoWagons',
    'fluid-wagon': 'fluidWagons',
    fuel: 'fuels',
    machine: 'machines',
    module: 'modules',
    pipe: 'pipes',
    technology: 'technologies',
    recipe: 'recipes',
  };

  beltSpeedTxt = this.settingsSvc.beltSpeedTxt;
  dispRateInfo = this.settingsSvc.displayRateInfo;
  data = this.recipesSvc.adjustedDataset;

  recipe = computed(() => {
    const type = this.type();
    if (type !== 'item' && type !== 'technology') return undefined;

    const id = this.id();
    const data = this.data();
    const itemRecipeIds = data.itemRecipeIds[id];
    const recipes = itemRecipeIds
      .map((r) => data.adjustedRecipe[r])
      .filter((r) => r.quality == null && r.produces.has(id));
    if (recipes.length === 1) return recipes[0];
    return undefined;
  });
}
