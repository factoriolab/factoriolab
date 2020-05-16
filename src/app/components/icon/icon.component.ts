import { Component, Input } from '@angular/core';
import { Recipe, Item } from '~/models';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
})
export class IconComponent {
  @Input() iconId: string;
  @Input() scale: boolean;
  @Input() text: string;

  @Input() tooltip: string;
  @Input() recipe: Recipe;
  @Input() item: Item;

  constructor() {}
}
