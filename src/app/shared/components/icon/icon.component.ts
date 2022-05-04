import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { first, map } from 'rxjs';

import {
  DisplayRate,
  DisplayRateVal,
  EnergyType,
  Game,
  Icon,
  Rational,
  RationalItem,
  Recipe,
} from '~/models';
import { TrackService } from '~/services';
import { LabState } from '~/store';
import * as Settings from '~/store/settings';

@Component({
  selector: 'lab-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnChanges {
  @Input() iconId: string | undefined;
  @Input() scale = true;
  @Input() text: string | null | undefined;
  @Input() tooltip: string | null | undefined;
  @Input() hoverIcon: string | undefined;
  @Input() scrollTop = 0;
  @Input() scrollLeft = 0;
  @Input() recipe: Recipe | null | undefined;
  @Input() item: RationalItem | null | undefined;

  game$ = this.store.select(Settings.getGame);
  displayRate$ = this.store.select(Settings.getDisplayRate);

  icon: Icon | null | undefined;
  hover = false;
  tooltipMarginTop = 40;

  DisplayRateVal = DisplayRateVal;

  DisplayRate = DisplayRate;
  EnergyType = EnergyType;
  Game = Game;

  constructor(public trackSvc: TrackService, private store: Store<LabState>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scale'] || changes['scrollTop']) {
      this.tooltipMarginTop = (this.scale ? 40 : 72) - this.scrollTop;
    }
    if (changes['recipe'] || changes['iconId']) {
      this.store
        .select(Settings.getDataset)
        .pipe(
          first(),
          map((data) => data.iconEntities)
        )
        .subscribe((iconEntities) => {
          if (this.recipe) {
            const rId = this.iconId + '|recipe';
            if (iconEntities[rId]) {
              this.icon = iconEntities[rId];
              return;
            }
          }
          this.icon = this.iconId ? iconEntities[this.iconId] : null;
        });
    }
  }

  @HostListener('mouseenter') mouseenter(): void {
    this.hover = true;
  }
  @HostListener('mouseleave') mouseleave(): void {
    this.hover = false;
  }

  round(value: Rational): number {
    return Number(value.toNumber().toFixed(2));
  }

  power(value: Rational | string | number): string {
    if (typeof value === 'string') {
      value = Rational.fromString(value);
    } else if (typeof value === 'number') {
      value = Rational.fromNumber(value);
    }
    if (value.abs().lt(Rational.thousand)) {
      return `${this.round(value)} kW`;
    } else {
      return `${this.round(value.div(Rational.thousand))} MW`;
    }
  }

  toBonusPercent(value: Rational): string | null {
    const rational = this.round(value.mul(Rational.hundred));
    if (value.gt(Rational.zero)) {
      return `+${rational}%`;
    } else if (value.lt(Rational.zero)) {
      return `${rational}%`;
    } else {
      return null;
    }
  }
}
