import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { Game } from '~/models';
import { Recipes, Settings } from '~/store';

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
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  store = inject(Store);

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

  beltSpeedTxt = this.store.selectSignal(Settings.selectBeltSpeedTxt);
  dispRateInfo = this.store.selectSignal(Settings.selectDisplayRateInfo);
  data = this.store.selectSignal(Recipes.selectAdjustedDataset);

  Game = Game;
}
