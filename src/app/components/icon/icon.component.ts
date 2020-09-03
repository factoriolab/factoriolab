import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
} from '@angular/core';

import { Recipe, Item, DisplayRate, Dataset, Rational } from '~/models';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() data: Dataset;
  @Input() iconId: string;
  _scale = true;
  get scale() {
    return this._scale;
  }
  @Input() set scale(value: boolean) {
    this._scale = value;
    this.setTooltipMargin();
  }
  @Input() text: string;
  _scrollTop = 0;
  get scrollTop() {
    return this._scrollTop;
  }
  @Input() set scrollTop(value: number) {
    this._scrollTop = value;
    this.setTooltipMargin();
  }
  @Input() scrollLeft: number;
  @Input() tooltip: string;
  @Input() recipe: Recipe;
  @Input() item: Item;
  @Input() displayRate: DisplayRate;

  hover = false;
  tooltipMarginTop = 40;

  DisplayRate = DisplayRate;

  get element(): HTMLElement {
    return this.ref.nativeElement;
  }

  constructor(private ref: ElementRef) {}

  setTooltipMargin() {
    this.tooltipMarginTop = (this.scale ? 40 : 72) - this.scrollTop;
  }

  round(value: number) {
    return Number(value.toFixed(2));
  }

  toBonusPercent(value: number) {
    const rational = this.round(
      Rational.fromNumber(value).mul(Rational.hundred).toNumber()
    );
    if (value > 0) {
      return `+${rational}%`;
    } else if (value < 0) {
      return `${rational}%`;
    } else {
      return null;
    }
  }
}
