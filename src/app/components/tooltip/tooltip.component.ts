import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { BonusPercentPipe } from '~/pipes/bonus-percent.pipe';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { RoundPipe } from '~/pipes/round.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { UsagePipe } from '~/pipes/usage.pipe';
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
  recipesSvc = inject(RecipesService);
  settingsSvc = inject(SettingsService);

  id = input.required<string>();
  type = input<TooltipType>('item');

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
      .map((r) => data.recipeEntities[r])
      .filter((r) => r.quality == null);
    if (recipes.length === 1) return recipes[0];
    return undefined;
  });

  unlockedRecipes = computed(() => {
    const type = this.type();
    if (type !== 'technology') return undefined;

    const id = this.id();
    const data = this.data();
    const result = data.recipeIds
      .map((r) => data.recipeEntities[r])
      .filter((r) => r.quality == null && r.unlockedBy === id)
      .map((r) => r.id);
    if (result.length === 0) return undefined;
    return result;
  });
}
