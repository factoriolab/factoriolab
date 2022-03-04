import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostListener,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';

import {
  Recipe,
  Item,
  DisplayRate,
  Rational,
  EnergyType,
  Icon,
  Game,
} from '~/models';
import { TrackService } from '~/services';
import { State } from '~/store';
import { getGame, getIconEntities } from '~/store/settings';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnChanges {
  @Input() iconId: string = '';
  @Input() scale = true;
  @Input() text = '';
  @Input() scrollTop = 0;
  @Input() scrollLeft = 0;
  @Input() tooltip = '';
  @Input() recipe: Recipe | undefined;
  @Input() item: Item | undefined;
  @Input() displayRate = DisplayRate.PerMinute;
  @Input() hoverIcon = '';

  game$ = this.store.select(getGame);

  icon: Icon | undefined;
  hover = false;
  tooltipMarginTop = 40;

  DisplayRate = DisplayRate;
  EnergyType = EnergyType;
  Game = Game;

  constructor(public track: TrackService, private store: Store<State>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scale'] || changes['scrollTop']) {
      this.tooltipMarginTop = (this.scale ? 40 : 72) - this.scrollTop;
    }
    if (changes['recipe'] || changes['iconId']) {
      this.store
        .select(getIconEntities)
        .pipe(take(1))
        .subscribe((iconEntities) => {
          if (this.recipe) {
            const rId = this.iconId + '|recipe';
            if (iconEntities[rId]) {
              this.icon = iconEntities[rId];
              return;
            }
          }
          this.icon = iconEntities[this.iconId];
        });
    }
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

  toBonusPercent(value: number): string | undefined {
    const rational = this.round(
      Rational.fromNumber(value).mul(Rational.hundred).toNumber()
    );
    if (value > 0) {
      return `+${rational}%`;
    } else if (value < 0) {
      return `${rational}%`;
    } else {
      return undefined;
    }
  }
}
