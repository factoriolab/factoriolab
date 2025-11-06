import {
  Overlay,
  OverlayRef,
  STANDARD_DROPDOWN_ADJACENT_POSITIONS,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  afterNextRender,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
} from '@angular/core';
import { filter, take } from 'rxjs';

import { AdjustedRecipe } from '~/data/schema/recipe';

import { TOOLTIP_DATA, TooltipData } from './tooltip-data';
import { TooltipOverlay } from './tooltip-overlay';
import { TooltipType } from './tooltip-type';

@Directive({
  selector: '[labTooltip]',
  host: {
    '(mouseenter)': 'enter()',
    '(mouseleave)': 'hide()',
    '(touchstart)': 'touch()',
    '(touchend)': 'cancelTouch()',
    '(touchcancel)': 'cancelTouch()',
    '(touchmove)': 'cancelTouch()',
  },
})
export class Tooltip implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly platform = inject(Platform);

  readonly labTooltip = input<string>();
  readonly labTooltipType = input<TooltipType>();
  readonly labTooltipPosition = input<'below' | 'adjacent'>('below');
  readonly labTooltipAction = input<string>();
  readonly labTooltipAdjustedRecipe = input<AdjustedRecipe>();
  readonly labTooltipDisabled = input<boolean>();

  private overlayRef: OverlayRef | undefined;

  constructor() {
    effect(() => {
      if (this.labTooltipDisabled()) this.hide();
    });
  }

  show(): void {
    if (this.labTooltipDisabled()) return;

    const value = this.labTooltip();
    if (this.overlayRef || !value) return;

    const positions =
      this.labTooltipPosition() === 'adjacent'
        ? STANDARD_DROPDOWN_ADJACENT_POSITIONS
        : STANDARD_DROPDOWN_BELOW_POSITIONS;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withFlexibleDimensions(false)
      .withPositions(positions);

    const data: TooltipData = {
      value,
      type: this.labTooltipType(),
      action: this.labTooltipAction(),
      adjustedRecipe: this.labTooltipAdjustedRecipe(),
      defaultPosition: positions[0],
      positionChanges: positionStrategy.positionChanges,
    };

    const injector = Injector.create({
      parent: this.injector,
      providers: [{ provide: TOOLTIP_DATA, useValue: data }],
    });

    const ref = this.overlay.create({ positionStrategy });

    // Watch for click events to hide after touchstart on mobile
    ref
      .outsidePointerEvents()
      .pipe(
        filter((e) => e.type === 'click'),
        take(1),
      )
      .subscribe(() => {
        this.hide();
      });

    ref.attach(new ComponentPortal(TooltipOverlay, undefined, injector));
    this.overlayRef = ref;

    /** Update position after next render to account for tooltip size */
    afterNextRender(
      () => {
        ref.updatePosition();
      },
      { injector: this.injector },
    );
  }

  enter(): void {
    // Ignore mouse enter on mobile
    if (this.platform.IOS || this.platform.ANDROID) return;
    this.show();
  }

  private touchTimer: number | undefined;
  touch(): void {
    this.touchTimer = setTimeout(() => {
      this.show();
      delete this.touchTimer;
    }, 500);
  }

  cancelTouch(): void {
    clearTimeout(this.touchTimer);
  }

  hide(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    delete this.overlayRef;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
