import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
} from '@angular/core';

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
  @Input() scale = true;
  @Input() text: string;

  @Input() tooltip: string;
  @Input() recipe: Recipe;
  @Input() item: Item;
  @Input() displayRate: DisplayRate;

  hover = false;

  DisplayRate = DisplayRate;

  get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  constructor(private elementRef: ElementRef) {}

  mouseenter() {
    this.hover = true;
  }

  mouseleave() {
    this.hover = false;
  }
}
