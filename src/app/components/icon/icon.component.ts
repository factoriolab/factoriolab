import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostListener,
  OnChanges,
} from '@angular/core';

import {
  Recipe,
  Item,
  DisplayRate,
  Dataset,
  Rational,
  EnergyType,
  Icon,
} from '~/models';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnChanges {
  @Input() data: Dataset;
  @Input() iconId: string;
  @Input() scale = true;
  @Input() text: string;
  @Input() scrollTop = 0;
  @Input() scrollLeft: number;
  @Input() tooltip: string;
  @Input() recipe: Recipe;
  @Input() item: Item;
  @Input() displayRate: DisplayRate;
  @Input() hoverIcon: string;

  icon: Icon;
  hover = false;
  tooltipMarginTop = 40;

  DisplayRate = DisplayRate;
  EnergyType = EnergyType;

  constructor() {}

  ngOnChanges(): void {
    this.tooltipMarginTop = (this.scale ? 40 : 72) - this.scrollTop;
    if (this.recipe) {
      const rId = this.iconId + '|recipe';
      if (this.data.iconEntities[rId]) {
        this.icon = this.data.iconEntities[rId];
        return;
      }
    }
    this.icon = this.data.iconEntities[this.iconId];
  }

  @HostListener('mouseenter') mouseenter(): void {
    this.hover = true;
  }
  @HostListener('mouseleave') mouseleave(): void {
    this.hover = false;
  }

  round(value: number): number {
    return Number(value.toFixed(2));
  }

  power(value: number | string): string {
    if (typeof value === 'string') {
      // Simplify to number before rounding
      value = Rational.fromString(value).toNumber();
    }
    if (Math.abs(value) < 1000) {
      return `${this.round(value)} kW`;
    } else {
      return `${this.round(value / 1000)} MW`;
    }
  }

  toBonusPercent(value: number): string {
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
