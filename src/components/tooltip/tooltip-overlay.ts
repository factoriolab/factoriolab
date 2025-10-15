import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { cva } from 'class-variance-authority';

import { BonusPercentPipe } from '~/rational/bonus-percent-pipe';
import { FuelValuePipe } from '~/rational/fuel-value-pipe';
import { rational } from '~/rational/rational';
import { RoundPipe } from '~/rational/round-pipe';
import { UsagePipe } from '~/rational/usage-pipe';
import { Adjustment } from '~/state/adjustment';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Icon } from '../icon/icon';
import { RecipeProcess } from '../recipe-process/recipe-process';
import { TOOLTIP_DATA } from './tooltip-data';

const positionVariants = {
  originX: { start: null, center: null, end: null },
  originY: { top: null, center: null, bottom: null },
  overlayX: { start: null, center: null, end: null },
  overlayY: { top: null, center: null, bottom: null },
};

const host = cva(
  'bg-gray-950 border rounded-xs border-gray-600 py-[5px] px-3 animate-delayed-fade-in relative max-w-69 inline-flex flex-col',
  {
    variants: positionVariants,
    compoundVariants: [
      { originY: 'bottom', overlayY: 'top', class: 'mt-1.5' },
      { originX: 'end', overlayX: 'start', class: 'ml-1.5' },
      { originY: 'top', overlayY: 'bottom', class: 'mb-1.5' },
      { originX: 'start', overlayX: 'end', class: 'mr-1.5' },
    ],
  },
);

const nub = cva(
  'absolute size-1.75 border-gray-600 bg-gray-950 m-auto border-t border-l',
  {
    variants: positionVariants,
    compoundVariants: [
      { originY: 'bottom', overlayY: 'top', class: '-top-1 rotate-45' },
      { originX: 'end', overlayX: 'start', class: '-left-1 rotate-315' },
      { originY: 'top', overlayY: 'bottom', class: '-bottom-1 rotate-225' },
      { originX: 'start', overlayX: 'end', class: '-right-1 rotate-135' },
      {
        originX: 'start',
        originY: ['top', 'bottom'],
        overlayX: 'start',
        overlayY: ['top', 'bottom'],
        class: 'left-3',
      },
      {
        originX: 'end',
        originY: ['top', 'bottom'],
        overlayX: 'end',
        overlayY: ['top', 'bottom'],
        class: 'right-3',
      },
      {
        originX: ['start', 'end'],
        originY: 'top',
        overlayX: ['start', 'end'],
        overlayY: 'top',
        class: 'top-3',
      },
      {
        originX: ['start', 'end'],
        originY: 'bottom',
        overlayX: ['start', 'end'],
        overlayY: 'bottom',
        class: 'bottom-3',
      },
    ],
  },
);

@Component({
  selector: 'lab-tooltip-overlay',
  imports: [
    KeyValuePipe,
    NgTemplateOutlet,
    BonusPercentPipe,
    Icon,
    FuelValuePipe,
    RecipeProcess,
    RoundPipe,
    TranslatePipe,
    UsagePipe,
  ],
  templateUrl: './tooltip-overlay.html',
  styleUrl: './tooltip-overlay.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
})
export class TooltipOverlay implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly adjustment = inject(Adjustment);
  protected readonly recipesStore = inject(RecipesStore);
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly tooltipData = inject(TOOLTIP_DATA);

  protected readonly data = this.recipesStore.adjustedDataset;
  protected readonly rational = rational;

  /**
   * Assume preferred position is taken instead of waiting, so that content is
   * rendered on first cycle (need to know tooltip size to determine what the
   * final position should be)
   */
  private readonly position = signal(this.tooltipData.defaultPosition);

  protected readonly hostClass = computed(() => host(this.position()));
  protected readonly nubClass = computed(() => nub(this.position()));
  protected readonly recipeId = computed(() => {
    const type = this.tooltipData.type;
    if (type !== 'item' && type !== 'technology') return undefined;

    const id = this.tooltipData.value;
    const data = this.data();
    const itemRecipeIds = data.itemRecipeIds[id];
    const recipes = itemRecipeIds
      .map((r) => data.adjustedRecipe[r])
      .filter(
        (r) =>
          !r.flags.has('recycling') && r.quality == null && r.produces.has(id),
      );
    if (recipes.length === 1) return recipes[0].id;
    return undefined;
  });

  ngOnInit(): void {
    this.tooltipData.positionChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => {
        this.position.set(p.connectionPair);
      });
  }
}
