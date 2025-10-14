import {
  Overlay,
  OverlayRef,
  STANDARD_DROPDOWN_ADJACENT_POSITIONS,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
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

import { AdjustedRecipe } from '~/data/schema/recipe';

import { TOOLTIP_DATA, TooltipData } from './tooltip-data';
import { TooltipOverlay } from './tooltip-overlay';
import { TooltipType } from './tooltip-type';

@Directive({
  selector: '[labTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(touchstart)': 'show()',
    '(mouseleave)': 'hide($event)',
    '(touchend)': 'hide()',
    '(touchcancel)': 'hide()',
  },
})
export class Tooltip implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

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
    ref.attach(new ComponentPortal(TooltipOverlay, undefined, injector));
    this.overlayRef = ref;
    ref.hostElement.addEventListener('mouseleave', (event) => {
      const target = event.relatedTarget as Node | null;
      if (this.elementRef.nativeElement.contains(target)) return;
      this.hide();
    });

    /** Update position after next render to account for tooltip size */
    afterNextRender(
      () => {
        ref.updatePosition();
      },
      { injector: this.injector },
    );
  }

  hide(event?: Event): void {
    if (!this.overlayRef) return;
    const target = (event as MouseEvent | undefined)
      ?.relatedTarget as Node | null;
    if (target && this.overlayRef.overlayElement.contains(target)) return;
    this.overlayRef.dispose();
    delete this.overlayRef;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
