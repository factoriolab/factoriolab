import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Recipe, Item, DisplayRate, Dataset } from '~/models';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() data: Dataset;
  @Input() iconId: string;
  @Input() scale: boolean;
  @Input() text: string;

  @Input() tooltip: string;
  @Input() recipe: Recipe;
  @Input() item: Item;
  @Input() displayRate: DisplayRate;

  DisplayRate = DisplayRate;

  constructor() {}
}
