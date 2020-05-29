import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Recipe, Item, DisplayRate, Icon, RecipeId, ItemId } from '~/models';
import { DatasetState } from '~/store/dataset';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() iconId: ItemId | RecipeId;
  @Input() scale: boolean;
  @Input() text: string;
  @Input() data: DatasetState;

  @Input() tooltip: string;
  @Input() recipe: Recipe;
  @Input() item: Item;
  @Input() displayRate: DisplayRate;

  DisplayRate = DisplayRate;

  constructor() {}
}
